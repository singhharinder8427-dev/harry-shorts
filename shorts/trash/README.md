# What happens to trash at a waste-to-energy plant? (code-drawn cartoon Short)

Vertical 2D cartoon Short (designed at 1080x1920, delivered 1440x2560 (2K), 60 fps, at most 45 s) made with Remotion.
All art, motion, captions and sound effects are drawn/made in code. The voice is your own take; the video is re-timed to it.

## Script (115 words incl. the subscribe line)
See `voiceover/script.txt`. Timing sheet for recording the take: `voiceover/TIMING_SHEET.md`.

## Shots
1. Town: a guy throws away a trash bag (it has a face); it lands and stays put ("doesn't vanish"); bags rain down into a
   stinking mountain; it's burned in the open, the sky goes black, the guy coughs.
2. Plant cutaway (tagged "simplified, not to scale"): a crane grabs trash from the pit (the bag has a close call) and drops it
   into the furnace; it tumbles down a moving grate, blue air arrows from below make the fire roar; water in the wall pipes
   boils, steam runs to a turbine, the generator lights the houses and an orange heat pipe warms them; white lime powder
   pops the green acid specks, black carbon grabs the purple mercury/dioxin specks, the fabric filter bags catch the dust;
   the chimney smiles out a white plume ("mostly water vapor"); in the basement a magnet pulls cans out of the ash and the
   rest piles up as road gravel.
3. Town again, standing on the road: SUBSCRIBE button + cursor click + bell; the last frame matches frame 0 (loop).

## Re-time to your voice take and render 2K
```bash
tools/retime.sh path/to/take.mp3
```
(Forced alignment one sentence at a time -> `src/timing.json` -> sound effects, captions and timing sheet rebuilt -> 2K render
to `out/trash-2K.mp4`.) Add `RENDER=0` to stop before rendering.

Other tools: `node tools/stills.mjs <t...>` + `python3 tools/sheet.py` (contact sheets), `python3 tools/qa_video.py <mp4>`
(pop / loop / loudness / audio gaps), `SCALE=2 node tools/thumbs.mjs A B C` (thumbnails).

## Sources
- US EPA (archive), mass-burn moving grate, boiler steam, turbine generator: https://archive.epa.gov/epawaste/nonhaz/municipal/web/html/basic.html
- Waste Management World, lime + activated carbon injection and fabric filters: https://waste-management-world.com/artikel/filtering-flue-gas
- Babcock, waste incineration flue-gas cleaning: https://www.babcock.com:443/assets/PDF-Downloads/Emissions-Control/E201-1003-Waste-Incineration-BREF-Solutions.pdf
- UK Environment Agency note (Javelin Park): the visible plume is condensed water vapour: https://www.hardwickepc.gov.uk/documents/200126-230102-105-PlumeEnergyFromWasteFacilitypdf.pdf
- CEWEP bottom ash fact sheet: metal recovery and reuse in roads (about 99% in Denmark): https://www.cewep.eu/wp-content/uploads/2017/09/FINAL-Bottom-Ash-factsheet.pdf
- Bottom ash in Switzerland may not be used in roads: https://www.seprosystems.com/how-to-recover-value-from-incinerator-bottom-ash-infographic/
- State of Green, CopenHill / Amager Bakke combined heat and power: https://stateofgreen.com/en/solutions/copenhill/

## Honesty notes
- "Can warm homes" and "can become road gravel" are hedged on purpose: only combined heat-and-power plants send heat to
  homes, and reuse of ash in roads depends on national rules.
- Lime handles the acid gases; activated carbon handles mercury and dioxins (the script says so separately).
- The plant drawing is a simplified diagram, not to scale (tagged on screen). Several smoke-cleaning and ash sources are
  equipment makers and conference papers, read through search summaries.
- Captions show the script spelling; the alignment assumes the take reads the script as written.
