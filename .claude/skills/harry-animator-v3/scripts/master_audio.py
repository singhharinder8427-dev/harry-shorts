"""master_audio.py in.mp4 out.mp4 : two-pass loudness master of the final mix (voice + sfx + bed) to -14 LUFS,
true peak <= -1 dBTP; the video stream is copied untouched."""
import sys, json, subprocess, re
src, dst = sys.argv[1], sys.argv[2]
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-c:v', 'copy', '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', dst], check=True)
print('mastered ->', dst, '(input', m['input_i'], 'LUFS)')
