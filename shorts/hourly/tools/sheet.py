import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size; cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols
tw, th = w // 2, h // 2
S = Image.new('RGB', (cols * tw, rows * (th + 30)), 'white'); d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * tw, (i // cols) * (th + 30)
    S.paste(im.resize((tw, th)), (x, y + 30)); d.text((x + 6, y + 8), f.split('still_')[-1][:-4] + 's', fill='black')
S.save(out); print(out, S.size)
