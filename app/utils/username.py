"""Random anonymous username generator.

Used at signup when a student doesn't supply their own username, so we never
expose real names in community/forum features. ~1M possible combinations
(32 adjectives × 32 nouns × 1000 numbers) keeps collisions rare.
"""
from __future__ import annotations

import random

_ADJECTIVES = (
    "Brave", "Kind", "Quiet", "Gentle", "Bright", "Sunny", "Bold", "Calm",
    "Clever", "Curious", "Daring", "Eager", "Fierce", "Free", "Honest",
    "Joyful", "Lively", "Loyal", "Merry", "Mighty", "Noble", "Patient",
    "Proud", "Pure", "Quick", "Smart", "Steady", "Strong", "Swift", "Warm",
    "Wise", "Witty",
)

_NOUNS = (
    "Lily", "River", "Sun", "Moon", "Star", "Sky", "Sea", "Wave",
    "Bird", "Bee", "Owl", "Fox", "Wolf", "Deer", "Hawk", "Dove",
    "Pine", "Oak", "Rose", "Iris", "Dawn", "Dusk", "Rain", "Cloud",
    "Stone", "Brook", "Ember", "Spark", "Petal", "Reed", "Feather", "Leaf",
)


def generate_username() -> str:
    """Return a random username like 'BraveLily042'."""
    adj = random.choice(_ADJECTIVES)
    noun = random.choice(_NOUNS)
    num = f"{random.randint(0, 999):03d}"
    return f"{adj}{noun}{num}"