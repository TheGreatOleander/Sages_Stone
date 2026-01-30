"""
Oscillatory Collapse Demo
========================

Constraints push in opposite directions over time.
The system oscillates instead of converging.
"""

def constraint_A(x):
    return x + 1 if x < 0 else x - 1


def constraint_B(x):
    return -x


if __name__ == "__main__":
    x = 5
    print("\n--- OSCILLATORY COLLAPSE ---\n")

    for step in range(10):
        x = constraint_A(x)
        x = constraint_B(x)
        print(f"Step {step}: {x}")
