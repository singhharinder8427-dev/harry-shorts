# What if today was Earth's last day? (harry-animator v3)

A 55 s vertical Short (designed 1080x1920, delivered 1440x2560, 60 fps). The cast is flat 2D: Blob as the scientist, a corrupt boss, a masked thief, a beachgoer and a dinosaur. They act in stylized 3D sets: a city street (night, doom red, dusk, sunrise), the boss's office, deep space (Earth, the Moon, the rock), a ruler track, an impact cross-section, a coast, a prehistoric valley, an observatory, the DART asteroids and a split "why" stage. A telemetry card counts down the distance and time to impact.

## Script (Variant 3, 140 words)
A corrupt boss counts stolen money. A thief robs the street. And in this story, God has seen enough. A rock ten kilometres wide turns toward Earth. It falls more than ten kilometres every second, about ten times faster than a bullet. From the Moon's distance, under nine hours to impact. The boss tries to buy his way out. The thief tries to run. Neither helps. A rock this size once turned the ground to vapour at around five thousand degrees, wrapped the planet in dust within hours, and sent giant waves to most coastlines in two days. It ended the dinosaurs. But one scientist has a plan. In 2022, NASA crashed a spacecraft called DART into an asteroid, and shifted its orbit by thirty-two minutes. Find the rock early, and a small push is enough. Subscribe for more what-ifs.

The other four variants are in `voiceover/variants.md`.

## Facts and their status
- **The dinosaur impactor:** about 10 km wide, about 12 km/s or more. It vaporised the rock it hit at around 5,000 °C. Dust and soot circled the Earth within 4–5 hours, and big waves reached most coastlines within 48 hours (Imperial College; Morgan et al. 2022). The size and speed are estimates.
- **Ten times faster than a bullet:** a rifle bullet travels at roughly 1 km/s, so "about ten times" is a round comparison.
- **The Moon's distance:** 384,400 km at 12 km/s is 8 h 54 min. That's my own calculation.
- **DART (2022):** shortened Dimorphos's orbit from about 11 h 55 min to about 11 h 23 min (NASA). Some outlets round the change to 34 minutes.
- **Read through search summaries only:** some sources were read only through search summaries because the npr.org and wikipedia.org pages were blocked in the build session.
- **The God / punishment framing** is a story premise, stated as "in this story".
- **The telemetry** is a story clock (distance shown in log steps, time = distance / 12 km/s).

## Re-run with your voice take
```bash
tools/retime.sh /path/to/take.mp3          # RENDER=0 to stop before the 2K render
```
For a 2K render in chunks (cloud job time limit): `RENDER=0 tools/retime.sh take.mp3`, then
`tools/render_chunk.sh 0 1099`, `tools/render_chunk.sh 1100 2199`, ... and `tools/join_chunks.sh`.
