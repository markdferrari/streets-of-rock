"""Generate a short, deterministic development-only music loop.

Replace public/assets/audio/brightside.mp3 with the owner soundtrack before
final audio, offline, and performance acceptance. This file is intentionally named
so it cannot be mistaken for the intended track.
"""

from math import pi, sin
from pathlib import Path
from struct import pack
from wave import open as wave_open

RATE = 22050
SECONDS = 8
DESTINATION = Path(__file__).resolve().parents[1] / "public/assets/audio/brightside.mp3"


def sample(t: float) -> float:
    beat = int(t * 2) % 4
    chord = ((110, 138.59, 164.81), (98, 123.47, 146.83),
             (87.31, 110, 130.81), (98, 123.47, 146.83))[beat]
    pad = sum(sin(2 * pi * pitch * t) for pitch in chord) / 3
    pulse_phase = (t * 2) % 1
    pulse = sin(2 * pi * 55 * t) * max(0, 1 - pulse_phase * 8)
    shimmer = sin(2 * pi * 440 * t) * max(0, 1 - ((t * 4) % 1) * 12)
    return max(-1, min(1, .16 * pad + .16 * pulse + .035 * shimmer))


def main() -> None:
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    with wave_open(str(DESTINATION), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(b"".join(pack("<h", round(sample(index / RATE) * 32767))
                                    for index in range(RATE * SECONDS)))
    print(f"wrote {DESTINATION} ({DESTINATION.stat().st_size} bytes)")
    effects = {"attack": 330, "hit": 180, "damage": 110, "pickup": 660, "result": 440}
    for name, pitch in effects.items():
        path = DESTINATION.parent / f"sfx-{name}.wav"
        with wave_open(str(path), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(RATE)
            output.writeframes(b"".join(pack("<h", round(sin(2 * pi * pitch * index / RATE) *
                                                     max(0, 1 - index / (RATE * .15)) * 8000))
                                        for index in range(round(RATE * .15))))
        print(f"wrote {path} ({path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
