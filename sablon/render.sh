set -e
cd /home/claude/ep2
node overlay4.js
D=108.4
ffmpeg -y -loglevel error -i video_nosound.mp4 -i sesc.wav -f lavfi -i "aevalsrc='0.3*sin(2*PI*55*t)*exp(-14*mod(t,0.5))+0.035*sin(2*PI*220*t)+0.03*sin(2*PI*261.63*t)+0.028*sin(2*PI*329.63*t)+0.04*(random(0)-0.5)*exp(-40*mod(t+0.25,0.5))':s=44100:d=$D" -filter_complex "[1:a]aresample=44100,loudnorm=I=-15:TP=-1.5:LRA=9,apad=whole_dur=$D,asplit=2[vo1][vo2];[2:a]volume=0.32,afade=t=in:d=1,afade=t=out:st=106.4:d=2[mu];[mu][vo1]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=350[mud];[mud][vo2]amix=inputs=2:duration=longest:normalize=0[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 160k -t $D ada_volt_bolum002.mp4
ffprobe -v error -show_entries format=duration,size -of default=nw=1 ada_volt_bolum002.mp4
