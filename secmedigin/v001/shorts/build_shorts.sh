set -e
cd /home/claude/secmedigin/v001/render
for id in $(python3 -c "import json;print(' '.join(s['id'] for s in json.load(open('shorts.json'))))"); do
  read A B <<< $(python3 -c "import json;s=[x for x in json.load(open('shorts.json')) if x['id']=='$id'][0];print(s['a'],s['b'])")
  F0=$(python3 -c "print(int($A*30))"); F1=$(python3 -c "print(int($B*30)+1)")
  NOSUB=1 node render.js render $F0 $F1 clip_$id.mp4 &
  node shortlay.js $id &
  wait
  CL=$(python3 -c "print(round($B-$A,3))"); D=$(python3 -c "print(round($B-$A+2.8,3))")
  # dikey kompozisyon: bulanık arka plan + ortada 16:9 + üst katman; son 2.8 sn son kare dondurulur
  ffmpeg -y -loglevel error -i clip_$id.mp4 -i ${id}_ov.mov -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=2.8,split[a][b];[a]scale=-2:1920,crop=1080:1920,boxblur=30:2,eq=brightness=-0.25[bg];[b]scale=1080:608[fg];[bg][fg]overlay=0:660[v1];[v1][1:v]overlay=0:0[v]" -map "[v]" -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -t $D ${id}_v.mp4
  ffmpeg -y -loglevel error -ss $A -t $CL -i ses_v2.wav -ss $A -t $D -i muzik.wav -filter_complex "[0:a]aresample=44100,highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=9,afade=t=in:d=0.15,afade=t=out:st=$(python3 -c "print(round($B-$A-0.3,2))"):d=0.3,apad,asplit=2[vo1][vo2];[1:a]volume=0.45,afade=t=out:st=$(python3 -c "print(round($D-1.2,2))"):d=1.2[mu];[mu][vo1]sidechaincompress=threshold=0.03:ratio=5:attack=30:release=400[mud];[mud][vo2]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[aout]" -map "[aout]" -t $D -c:a aac -b:a 192k ${id}_a.m4a
  ffmpeg -y -loglevel error -i ${id}_v.mp4 -i ${id}_a.m4a -map 0:v -map 1:a -c copy -shortest $id.mp4
  echo "DONE $id $D"
done
