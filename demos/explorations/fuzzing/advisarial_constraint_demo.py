"""
Adversarial Constraint Demo
===========================

This constraint actively attempts to erase information.
"""

def adversary(x):
    return 0


if __name__ == "__main__":
    x = 7.3
    print("\n--- ADVERSARIAL CONSTRAINT ---\n")
    print("Before:", x)
    print("After:", adversary(x))
