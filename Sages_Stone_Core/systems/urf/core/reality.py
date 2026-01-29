
from dataclasses import dataclass, field
from typing import Dict, Any

@dataclass
class Ontology:
    schema: Dict[str, Any]

@dataclass
class Dynamics:
    laws: Dict[str, Any]

@dataclass
class RepresentationSpec:
    name: str
    projector: callable

@dataclass
class Reality:
    ontology: Ontology
    dynamics: Dynamics
    representations: Dict[str, RepresentationSpec]
    metadata: Dict[str, Any] = field(default_factory=dict)
