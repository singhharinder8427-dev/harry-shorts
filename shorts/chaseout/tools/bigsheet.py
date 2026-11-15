import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]; w, h = ims[0].size; cols = min(7, len(ims)); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (h + 22)), 'white'); d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * w, (i // cols) * (h + 22); S.paste(im, (x, y + 22)); d.text((x + 6, y + 5), f.split('still_')[-1][:-4] + 's', fill='black')
S.save(out); print(out, S.size)
