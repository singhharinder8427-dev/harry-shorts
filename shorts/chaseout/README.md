# The chase-out room (harry-animator v3)

A 55 s-max vertical Short (designed 1080x1920, delivered 1440x2560, 60 fps). Flat 2D cel cast (Ken = "you", teal
shirt; Taro = the man in the corner, red cardigan; the boss, slate jacket) acting in a code-built 3D office and the tiny
sage-grey room behind its grey door. All picture, sound and timing are code.

## Script (variant 3, story with characters)
See `voiceover/script.txt`. 145 words, estimated 50.5 s at a natural pace.

## Sources
- Labor Contracts Act, Art. 16: https://www.japaneselawtranslation.go.jp/en/laws/view/3744/en
- Japan's power-harassment law (2020 / 2022): https://www.mercer.com/en-us/insights/law-and-policy/japan-strengthens-protection-against-workplace-harassment/
- Bloomberg's Bandai Namco report via The Register: https://www.theregister.com/2024/10/16/bandai_namcos_layoff_technique_is/
- 2013 "boredom room" report (NYT via Taipei Times): https://www.taipeitimes.com/News/world/archives/2013/08/18/2003569990

## Files
- `src/Short.tsx` - every shot; `src/timing.json` - word times (estimated until the take arrives)
- `tools/gen_sfx.py` - code-made sound cues + music bed
- `voiceover/TIMING_SHEET.md` - how to record the voice take
- `out/preview.mp4` - half-size preview on estimated timing (no voice)
- `thumbnails/`, `youtube.md`, `voiceover/captions.srt`, `voiceover/word_times.csv`

## Re-time to your voice take and render the 2K master
```bash
tools/retime.sh path/to/take.mp3
```
