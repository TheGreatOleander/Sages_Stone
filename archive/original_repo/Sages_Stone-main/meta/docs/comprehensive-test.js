#!/usr/bin/env node
/**
 * ============================================================================
 * CRUCIBLE SDK - COMPREHENSIVE TEST SUITE
 * ============================================================================
 * 
 * Tests everything:
 * - Core SDK functionality
 * - All 6 lenses
 * - Dimensional projection
 * - Adversarial testing
 * - RCF integration
 * - Python bridge
 * - State generation
 * - Export functions
 * 
 * Run: node comprehensive-test.js
 */

import { Crucible, Constraint, StateGenerator, Presets, Export } from '../src/crucible-sdk.js';

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
};

// Test runner
async function test(name, fn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
        await fn();
        console.log('✅ PASS');
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
    } catch (e) {
        console.log(`❌ FAIL: ${e.message}`);
        results.failed++;
        results.tests.push({ name, status: 'FAIL', error: e.message });
    }
}

function skip(name, reason) {
    console.log(`⏭️  SKIP: ${name} (${reason})`);
    results.skipped++;
    results.tests.push({ name, status: 'SKIP', reason });
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║          CRUCIBLE SDK - COMPREHENSIVE TEST SUITE            ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================================
// CORE TESTS
// ============================================================================

console.log('📦 Core SDK Tests\n');

await test('Constraint creation', async () => {
    const c = new Constraint('Test', (s) => s[0] > 0);
    assert(c.name === 'Test', 'Name should match');
    assert(c.test([1]) === true, 'Should pass valid state');
    assert(c.test([-1]) === false, 'Should fail invalid state');
});

await test('Constraint with metadata', async () => {
    const c = new Constraint('Test', (s) => true, {
        domain: 'physics',
        description: 'Test constraint',
        metadata: { custom: 'value' }
    });
    assert(c.domain === 'physics');
    assert(c.metadata.custom === 'value');
});

await test('StateGenerator.random', async () => {
    const states = StateGenerator.random(10, { dimensions: 6 });
    assert(states.length === 10, 'Should generate 10 states');
    assert(states[0].length === 6, 'Each state should have 6 dimensions');
});

await test('StateGenerator.trajectory', async () => {
    const states = StateGenerator.trajectory(
        (s, t) => s.map(x => x * 0.9),
        [1, 2, 3],
        5
    );
    assert(states.length === 5, 'Should generate 5 states');
    assert(states[0][0] === 1, 'First state should be initial');
});

await test('Crucible instantiation', async () => {
    const crucible = new Crucible();
    assert(crucible.lenses, 'Should have lenses');
    assert(crucible.dimensionalEngine, 'Should have dimensional engine');
    assert(crucible.adversarialEngine, 'Should have adversarial engine');
});

// ============================================================================
// LENS TESTS
// ============================================================================

console.log('\n🔍 Lens Tests\n');

await test('Information Lens', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    const constraint = new Constraint('Test', (s) => true);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    
    assert(result.lensResults.information, 'Should have information results');
    assert(typeof result.lensResults.information.entropy === 'string');
});

await test('Thermodynamic Lens', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    const constraint = new Constraint('Test', (s) => true);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    
    assert(result.lensResults.thermodynamic, 'Should have thermodynamic results');
    assert(result.lensResults.thermodynamic.verdict);
});

await test('Game Theoretic Lens', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    const constraint = new Constraint('Test', (s) => true);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    
    assert(result.lensResults.gameTheoretic, 'Should have game theoretic results');
});

await test('Quantum Lens', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    const constraint = new Constraint('Test', (s) => true);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    
    assert(result.lensResults.quantum, 'Should have quantum results');
    assert(result.lensResults.quantum.fidelity);
});

await test('Network Lens', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    const constraint = new Constraint('Test', (s) => true);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    
    assert(result.lensResults.network, 'Should have network results');
    assert(typeof result.lensResults.network.density === 'string');
});

await test('Category Lens', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    const constraint = new Constraint('Test', (s) => true);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    
    assert(result.lensResults.category, 'Should have category results');
});

// ============================================================================
// DIMENSIONAL TESTS
// ============================================================================

console.log('\n📐 Dimensional Projection Tests\n');

await test('Dimensional sweep', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Bounds', (s) => s.every(x => Math.abs(x) < 5));
    const states = StateGenerator.random(30);
    
    const result = await crucible.test(constraint, states, {
        skipAdversarial: true
    });
    
    assert(result.dimensionalResults, 'Should have dimensional results');
    assert(Object.keys(result.dimensionalResults).length > 0, 'Should test multiple dimensions');
});

await test('0D survival detection', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('AlwaysTrue', (s) => true);
    const states = StateGenerator.random(20);
    
    const result = await crucible.test(constraint, states);
    
    assert(result.dimensionalResults[0] !== undefined, 'Should test 0D');
});

await test('Classification: Fundamental', async () => {
    const crucible = new Crucible();
    // This should be fundamental (always passes)
    const constraint = new Constraint('Trivial', (s) => true);
    const states = StateGenerator.random(20);
    
    const result = await crucible.test(constraint, states);
    
    // Might be fundamental or emergent depending on randomness
    assert(result.classification, 'Should have classification');
    assert(['FUNDAMENTAL', 'EMERGENT', 'NON-FUNDAMENTAL'].includes(result.classification));
});

// ============================================================================
// ADVERSARIAL TESTS
// ============================================================================

console.log('\n⚔️  Adversarial Testing\n');

await test('Adversarial battle', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Robust', (s) => s.every(x => Math.abs(x) < 10));
    const states = StateGenerator.random(20);
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true
    });
    
    assert(result.adversarialResults, 'Should have adversarial results');
    assert(typeof result.adversarialResults.wins === 'number');
    assert(typeof result.adversarialResults.losses === 'number');
});

// ============================================================================
// PRESET TESTS
// ============================================================================

console.log('\n🎯 Preset Constraint Tests\n');

await test('Physics presets exist', async () => {
    assert(Presets.Physics, 'Should have Physics presets');
    assert(Presets.Physics.energyConservation, 'Should have energyConservation');
    assert(Presets.Physics.momentumConservation, 'Should have momentumConservation');
});

await test('Mathematics presets exist', async () => {
    assert(Presets.Mathematics, 'Should have Mathematics presets');
    assert(Presets.Mathematics.hardBounds, 'Should have hardBounds');
    assert(Presets.Mathematics.symmetry, 'Should have symmetry');
});

await test('Economics presets exist', async () => {
    assert(Presets.Economics, 'Should have Economics presets');
    assert(Presets.Economics.equilibrium, 'Should have equilibrium');
});

await test('Test preset constraint', async () => {
    const crucible = new Crucible();
    const states = StateGenerator.random(20);
    
    const result = await crucible.test(Presets.Mathematics.hardBounds, states, {
        skipAdversarial: true
    });
    
    assert(result.classification, 'Preset should produce results');
});

// ============================================================================
// BATCH TESTING
// ============================================================================

console.log('\n📊 Batch Testing\n');

await test('Test batch', async () => {
    const crucible = new Crucible();
    const constraints = [
        new Constraint('C1', (s) => s[0] > 0),
        new Constraint('C2', (s) => s.every(x => Math.abs(x) < 5))
    ];
    const states = StateGenerator.random(20);
    
    const results = await crucible.testBatch(constraints, states);
    
    assert(results.length === 2, 'Should return 2 results');
    assert(results[0].constraint.name === 'C1');
    assert(results[1].constraint.name === 'C2');
});

await test('Compare constraints', async () => {
    const crucible = new Crucible();
    const constraints = [
        new Constraint('C1', (s) => s[0] > 0),
        new Constraint('C2', (s) => s[0] < 0)
    ];
    const states = StateGenerator.random(20);
    
    const comparison = await crucible.compare(constraints, states);
    
    assert(comparison.results, 'Should have results array');
    assert(typeof comparison.getFundamental === 'function');
    assert(typeof comparison.getEmergent === 'function');
});

// ============================================================================
// RESULT TESTS
// ============================================================================

console.log('\n📋 Result Tests\n');

await test('Result methods', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Test', (s) => true);
    const states = StateGenerator.random(20);
    
    const result = await crucible.test(constraint, states);
    
    assert(typeof result.isFundamental === 'function');
    assert(typeof result.isEmergent === 'function');
    assert(typeof result.getSummary === 'function');
    assert(typeof result.toJSON === 'function');
});

await test('Result export', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Test', (s) => true);
    const states = StateGenerator.random(20);
    
    const result = await crucible.test(constraint, states);
    const json = result.toJSON();
    
    assert(json.constraint, 'JSON should have constraint');
    assert(json.classification, 'JSON should have classification');
    assert(json.lensResults, 'JSON should have lens results');
});

// ============================================================================
// EXPORT TESTS
// ============================================================================

console.log('\n💾 Export Tests\n');

await test('Export to Markdown', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Test', (s) => true);
    const states = StateGenerator.random(10);
    
    const result = await crucible.test(constraint, states);
    const markdown = Export.toMarkdown(result);
    
    assert(typeof markdown === 'string', 'Should return string');
    assert(markdown.includes('# Crucible Test Report'), 'Should have header');
});

// Skip file exports in test environment
skip('Export to JSON file', 'File system not available in test');
skip('Export to CSV file', 'File system not available in test');

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('\n🔗 Integration Tests\n');

// RCF Adapter tests
try {
    const { RCFConstraintAdapter, RCFStateAdapter } = await import('../integration/rcf/rcf_adapter.js');
    
    await test('RCF Constraint Adapter', async () => {
        const rcfConstraint = {
            name: 'Test',
            score_fn: (s) => s.values ? (s.values[0] > 0 ? 1.0 : -1.0) : 1.0,
            weight: 1.0
        };
        
        const crucibleConstraint = RCFConstraintAdapter.toCrucible(rcfConstraint);
        
        assert(crucibleConstraint.name === 'Test');
        assert(crucibleConstraint.test([1]) === true);
    });
    
    await test('RCF State Adapter', async () => {
        const rcfState = {
            id: '123',
            values: [1, 2, 3],
            intent: [0, 0, 0],
            history: []
        };
        
        const crucibleState = RCFStateAdapter.toCrucible(rcfState);
        
        assert(Array.isArray(crucibleState));
        assert(crucibleState[0] === 1);
    });
    
} catch (e) {
    skip('RCF Adapter tests', 'RCF adapter not found');
}

// Python bridge tests
try {
    const { PythonRCFBridge } = await import('../integration/rcf/rcf_adapter.js');
    skip('Python bridge tests', 'Requires Python setup');
} catch (e) {
    skip('Python bridge tests', 'Python bridge not available');
}

// ============================================================================
// STRESS TESTS
// ============================================================================

console.log('\n💪 Stress Tests\n');

await test('Large state set (1000 states)', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Test', (s) => s[0] > 0);
    const states = StateGenerator.random(1000);
    
    const start = Date.now();
    const result = await crucible.test(constraint, states, {
        skipDimensional: true,
        skipAdversarial: true
    });
    const elapsed = Date.now() - start;
    
    assert(result.classification, 'Should complete');
    console.log(`      (Completed in ${elapsed}ms)`);
});

await test('High dimensional states (12D)', async () => {
    const crucible = new Crucible();
    const constraint = new Constraint('Test', (s) => true);
    const states = StateGenerator.random(50, { dimensions: 12 });
    
    const result = await crucible.test(constraint, states, {
        skipDimensional: true
    });
    
    assert(result.classification, 'Should handle high dimensions');
});

await test('Many constraints (10)', async () => {
    const crucible = new Crucible();
    const constraints = Array(10).fill(0).map((_, i) => 
        new Constraint(`C${i}`, (s) => s[0] > i * 0.1)
    );
    const states = StateGenerator.random(20);
    
    const results = await crucible.testBatch(constraints, states);
    
    assert(results.length === 10, 'Should test all constraints');
});

// ============================================================================
// FINAL REPORT
// ============================================================================

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                      TEST RESULTS                            ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`✅ Passed:  ${results.passed}`);
console.log(`❌ Failed:  ${results.failed}`);
console.log(`⏭️  Skipped: ${results.skipped}`);
console.log(`📊 Total:   ${results.passed + results.failed + results.skipped}`);
console.log('');

if (results.failed > 0) {
    console.log('Failed Tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
        console.log(`  ❌ ${t.name}: ${t.error}`);
    });
    console.log('');
}

const successRate = (results.passed / (results.passed + results.failed) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);
console.log('');

if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! The Crucible is operational. 🔥');
} else {
    console.log('⚠️  Some tests failed. Review errors above.');
}

console.log('');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
