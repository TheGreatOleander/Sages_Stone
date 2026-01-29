
from core.reality import Ontology, Dynamics, RepresentationSpec, Reality
from core.mutation import Mutation
from core.stability import StabilityMonitor
from core.invariants import InvariantRegistry
from core.observer import Observer
from engine.urf_engine import URFEngine

def main():
    ontology = Ontology({'entities': 'abstract'})
    dynamics = Dynamics({'time': 'linear'})

    reps = {
        'symbolic': RepresentationSpec(
            'symbolic',
            lambda r: {'ontology': r.ontology.schema, 'dynamics': r.dynamics.laws}
        )
    }

    reality = Reality(ontology, dynamics, reps)
    stability = StabilityMonitor()
    invariants = InvariantRegistry()

    observers = [Observer('default')]
    engine = URFEngine(reality, observers, stability, invariants)

    def fuzz_time(dyn):
        dyn.laws['time'] = 'nonlinear'

    mutation = Mutation('Time Nonlinearity', 'dynamics', fuzz_time)
    engine.apply_mutation(mutation)

    observations = engine.run_observers()
    print(observations)

if __name__ == '__main__':
    main()
