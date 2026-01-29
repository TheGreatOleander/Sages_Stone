"""
============================================================================
CRUCIBLE SDK - PYTHON WRAPPER
============================================================================

Python interface to the Crucible SDK (JavaScript).
Allows Python code to use the full Crucible SDK capabilities.

Two modes:
1. PyExecJS: Execute JavaScript directly from Python
2. HTTP Bridge: Run JS as server, call from Python

Usage:
    from crucible_python import Crucible, Constraint
    
    crucible = Crucible()
    constraint = Constraint('MyLaw', lambda s: sum(s) < 10)
    result = crucible.test(constraint, states)
    
    print(result.is_fundamental())
"""

import json
import subprocess
import sys
from typing import List, Dict, Any, Callable, Optional
from dataclasses import dataclass
import numpy as np

# ============================================================================
# CONFIGURATION
# ============================================================================

SDK_PATH = "../src/crucible-sdk.js"
ADAPTER_PATH = "../integration/rcf/rcf_adapter.js"

# ============================================================================
# CORE CLASSES (Python Mirrors of JS SDK)
# ============================================================================

@dataclass
class Constraint:
    """
    Python version of Crucible Constraint.
    Mirrors the JavaScript Constraint class.
    """
    name: str
    check_function: Callable
    domain: str = 'general'
    description: str = ''
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
    
    def test(self, state) -> bool:
        """Test constraint against state"""
        try:
            return bool(self.check_function(state))
        except Exception as e:
            print(f"Constraint {self.name} error: {e}", file=sys.stderr)
            return False
    
    def to_dict(self) -> Dict:
        """Convert to JSON-serializable dict"""
        return {
            'name': self.name,
            'domain': self.domain,
            'description': self.description,
            'metadata': self.metadata
        }
    
    def to_rcf(self) -> Dict:
        """Convert to RCF constraint format"""
        return {
            'name': self.name,
            'score_fn': self.check_function,
            'weight': self.metadata.get('weight', 1.0)
        }


@dataclass
class CrucibleResult:
    """
    Python version of Crucible Result.
    Contains test results from SDK.
    """
    constraint_name: str
    classification: str
    consensus_score: float
    min_dimension: Optional[int]
    lens_results: Dict
    dimensional_results: Dict
    adversarial_results: Dict
    predictions: List[str]
    
    def is_fundamental(self) -> bool:
        """Check if fundamental"""
        return self.classification == 'FUNDAMENTAL'
    
    def is_emergent(self) -> bool:
        """Check if emergent"""
        return self.classification == 'EMERGENT'
    
    def get_summary(self) -> str:
        """Get one-line summary"""
        return f"{self.constraint_name}: {self.classification} ({self.consensus_score}%)"
    
    @staticmethod
    def from_dict(data: Dict) -> 'CrucibleResult':
        """Create from JSON dict"""
        return CrucibleResult(
            constraint_name=data['constraint']['name'],
            classification=data['classification'],
            consensus_score=data['consensusScore'],
            min_dimension=data.get('minDimension'),
            lens_results=data['lensResults'],
            dimensional_results=data['dimensionalResults'],
            adversarial_results=data['adversarialResults'],
            predictions=data['predictions']
        )


# ============================================================================
# JAVASCRIPT BRIDGE
# ============================================================================

class JavaScriptBridge:
    """
    Executes JavaScript code and returns results to Python.
    Uses Node.js subprocess.
    """
    
    def __init__(self, node_path: str = 'node'):
        self.node_path = node_path
    
    def execute(self, js_code: str) -> Any:
        """
        Execute JavaScript code and return result.
        
        Args:
            js_code: JavaScript code to execute
            
        Returns:
            Parsed JSON result from JavaScript
        """
        try:
            # Run JavaScript via Node.js
            result = subprocess.run(
                [self.node_path, '-e', js_code],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"JavaScript error: {result.stderr}")
            
            # Parse JSON output
            return json.loads(result.stdout)
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("JavaScript execution timeout")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse JavaScript output: {e}")
    
    def call_function(self, module_path: str, function_name: str, *args, **kwargs) -> Any:
        """
        Call a JavaScript function from Python.
        
        Args:
            module_path: Path to JS module
            function_name: Function to call
            *args, **kwargs: Function arguments
            
        Returns:
            Function result
        """
        # Build JavaScript code
        args_json = json.dumps(list(args))
        kwargs_json = json.dumps(kwargs)
        
        js_code = f"""
        const module = require('{module_path}');
        const result = module.{function_name}(...{args_json}, {kwargs_json});
        
        // Handle promises
        if (result instanceof Promise) {{
            result.then(r => console.log(JSON.stringify(r))).catch(e => console.error(e));
        }} else {{
            console.log(JSON.stringify(result));
        }}
        """
        
        return self.execute(js_code)


# ============================================================================
# MAIN CRUCIBLE CLASS (Python Interface)
# ============================================================================

class Crucible:
    """
    Python interface to Crucible SDK.
    
    Usage:
        crucible = Crucible()
        result = crucible.test(constraint, states)
    """
    
    def __init__(self, mode: str = 'subprocess', **options):
        """
        Initialize Crucible.
        
        Args:
            mode: 'subprocess' (Node.js) or 'http' (JS server)
            **options: Additional SDK options
        """
        self.mode = mode
        self.options = options
        
        if mode == 'subprocess':
            self.bridge = JavaScriptBridge()
        elif mode == 'http':
            self.bridge = HTTPBridge(options.get('url', 'http://localhost:3000'))
        else:
            raise ValueError(f"Unknown mode: {mode}")
    
    def test(self, constraint: Constraint, states: List, 
             on_progress: Optional[Callable] = None) -> CrucibleResult:
        """
        Test a constraint through the Crucible SDK.
        
        Args:
            constraint: Constraint to test
            states: List of states to test against
            on_progress: Optional progress callback
            
        Returns:
            CrucibleResult with test results
        """
        # Convert constraint to serializable format
        constraint_data = self._serialize_constraint(constraint)
        
        # Convert states to serializable format
        states_data = self._serialize_states(states)
        
        # Call JavaScript SDK
        js_code = self._build_test_code(constraint_data, states_data)
        result_data = self.bridge.execute(js_code)
        
        # Convert result back to Python
        return CrucibleResult.from_dict(result_data)
    
    def test_batch(self, constraints: List[Constraint], states: List) -> List[CrucibleResult]:
        """Test multiple constraints"""
        results = []
        for constraint in constraints:
            result = self.test(constraint, states)
            results.append(result)
        return results
    
    def compare(self, constraints: List[Constraint], states: List) -> Dict:
        """Compare multiple constraints"""
        results = self.test_batch(constraints, states)
        
        return {
            'results': results,
            'fundamental': [r for r in results if r.is_fundamental()],
            'emergent': [r for r in results if r.is_emergent()],
            'failed': [r for r in results if not r.is_fundamental() and not r.is_emergent()]
        }
    
    def _serialize_constraint(self, constraint: Constraint) -> Dict:
        """Convert Python constraint to JSON-serializable format"""
        # We need to serialize the check function as code
        import inspect
        
        return {
            'name': constraint.name,
            'checkCode': inspect.getsource(constraint.check_function),
            'domain': constraint.domain,
            'description': constraint.description,
            'metadata': constraint.metadata
        }
    
    def _serialize_states(self, states: List) -> List:
        """Convert Python states to JSON-serializable format"""
        serialized = []
        for state in states:
            if isinstance(state, np.ndarray):
                serialized.append(state.tolist())
            elif hasattr(state, '__dict__'):
                serialized.append(state.__dict__)
            else:
                serialized.append(state)
        return serialized
    
    def _build_test_code(self, constraint_data: Dict, states_data: List) -> str:
        """Build JavaScript code to execute test"""
        return f"""
        const {{ Crucible, Constraint }} = require('{SDK_PATH}');
        
        // Create constraint
        const checkFn = {constraint_data['checkCode']};
        const constraint = new Constraint(
            '{constraint_data['name']}',
            checkFn,
            {{
                domain: '{constraint_data['domain']}',
                description: '{constraint_data['description']}',
                metadata: {json.dumps(constraint_data['metadata'])}
            }}
        );
        
        // States
        const states = {json.dumps(states_data)};
        
        // Test
        const crucible = new Crucible();
        crucible.test(constraint, states).then(result => {{
            console.log(JSON.stringify(result.toJSON()));
        }});
        """


# ============================================================================
# HTTP BRIDGE (Alternative to subprocess)
# ============================================================================

class HTTPBridge:
    """
    Alternative bridge using HTTP server.
    Requires running crucible-server.js
    """
    
    def __init__(self, url: str = 'http://localhost:3000'):
        self.url = url
    
    def execute(self, endpoint: str, data: Dict) -> Any:
        """POST to server and get result"""
        import requests
        
        response = requests.post(f"{self.url}/{endpoint}", json=data)
        response.raise_for_status()
        return response.json()


# ============================================================================
# RCF INTEGRATION
# ============================================================================

class RCFIntegration:
    """
    Integrates existing Python RCF code with Crucible SDK.
    """
    
    @staticmethod
    def rcf_to_crucible_constraint(rcf_constraint: Dict) -> Constraint:
        """Convert RCF constraint to Crucible constraint"""
        return Constraint(
            name=rcf_constraint['name'],
            check_function=lambda s: rcf_constraint['score_fn'](s) > 0,
            domain='rcf',
            metadata={'rcf_weight': rcf_constraint.get('weight', 1.0)}
        )
    
    @staticmethod
    def rcf_state_to_crucible(rcf_state: Dict) -> List:
        """Convert RCF state to Crucible format"""
        return rcf_state.get('values', [])
    
    @staticmethod
    def import_rcf_archaeology(rcf_results: Dict) -> Dict:
        """Import RCF archaeological results"""
        return {
            'fundamental': rcf_results.get('fundamental_laws', []),
            'emergent': rcf_results.get('emergent_laws', []),
            'failed': rcf_results.get('failed_candidates', [])
        }


# ============================================================================
# STATE GENERATOR (Python version)
# ============================================================================

class StateGenerator:
    """Generate test states in Python"""
    
    @staticmethod
    def random(count: int = 50, dimensions: int = 6, 
               min_val: float = -5, max_val: float = 5,
               distribution: str = 'uniform') -> List[List[float]]:
        """Generate random states"""
        if distribution == 'uniform':
            return np.random.uniform(min_val, max_val, (count, dimensions)).tolist()
        elif distribution == 'normal':
            mean = (max_val + min_val) / 2
            std = (max_val - min_val) / 6
            return np.random.normal(mean, std, (count, dimensions)).tolist()
        else:
            raise ValueError(f"Unknown distribution: {distribution}")
    
    @staticmethod
    def trajectory(evolution_fn: Callable, initial_state: List, steps: int = 50) -> List:
        """Generate trajectory from evolution function"""
        states = [initial_state]
        for t in range(1, steps):
            next_state = evolution_fn(states[-1], t)
            states.append(next_state)
        return states
    
    @staticmethod
    def from_numpy(array: np.ndarray) -> List:
        """Convert numpy array to states"""
        return array.tolist()


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def quick_test(constraint_name: str, check_fn: Callable, states: List) -> CrucibleResult:
    """Quick test a constraint"""
    crucible = Crucible()
    constraint = Constraint(constraint_name, check_fn)
    return crucible.test(constraint, states)


def test_rcf_constraint(rcf_constraint: Dict, rcf_states: List) -> CrucibleResult:
    """Test RCF constraint using Crucible"""
    constraint = RCFIntegration.rcf_to_crucible_constraint(rcf_constraint)
    states = [RCFIntegration.rcf_state_to_crucible(s) for s in rcf_states]
    
    crucible = Crucible()
    return crucible.test(constraint, states)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

def example_usage():
    """Example of using Python wrapper"""
    
    # Create constraint
    energy_conservation = Constraint(
        'Energy Conservation',
        lambda state: abs(sum(x**2 for x in state) - 1.0) < 0.3,
        domain='physics'
    )
    
    # Generate states
    states = StateGenerator.random(50, dimensions=6)
    
    # Test
    crucible = Crucible()
    result = crucible.test(energy_conservation, states)
    
    # Results
    print(f"Classification: {result.classification}")
    print(f"Consensus: {result.consensus_score}%")
    print(f"Fundamental: {result.is_fundamental()}")
    
    if result.predictions:
        print("\nPredictions:")
        for pred in result.predictions:
            print(f"  • {pred}")


if __name__ == '__main__':
    example_usage()
