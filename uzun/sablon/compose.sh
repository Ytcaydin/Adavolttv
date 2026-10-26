set -e
A=alpha
# segments: clip t0 t1 layout
ffmpeg -y -loglevel error -i base.mp4 \
 -i $A/giris.mov -stream_loop -1 -i $A/konusma.mov \
 -stream_loop -1 -i $A/konusma.mov -i $A/sasirma.mov -stream_loop -1 -i $A/konusma.mov \
 -i $A/hologram.mov -stream_loop -1 -i $A/onay.mov \
 -filter_complex "
 [1:v]fps=30,scale=-1:1040,trim=0:6.55,setpts=PTS-STARTPTS[a1];
 [2:v]fps=30,scale=-1:1040,trim=0:1.0,setpts=PTS-STARTPTS+6.5/TB[a2];
 [3:v]fps=30,crop=500:600:134:100,scale=372:446,trim=0:7.1,setpts=PTS-STARTPTS+7.5/TB[a3];
 [4:v]fps=30,crop=500:600:134:100,scale=372:446,trim=0:3.6,setpts=PTS-STARTPTS+14.6/TB[a4];
 [5:v]fps=30,crop=500:600:134:100,scale=372:446,trim=0:3.8,setpts=PTS-STARTPTS+18.2/TB[a5];
 [6:v]fps=30,scale=-1:1040,hflip,trim=0:6.6,setpts=PTS-STARTPTS+22/TB[a6];
 [7:v]fps=30,scale=-1:1040,hflip,trim=0:1.6,setpts=PTS-STARTPTS+28.5/TB[a7];
 [0:v][a1]overlay=60:40:eof_action=pass:enable='between(t,0,6.55)'[v1];
 [v1][a2]overlay=60:40:eof_action=pass:enable='between(t,6.5,7.5)'[v2];
 [v2][a3]overlay=1484:114:eof_action=pass:enable='between(t,7.5,14.6)'[v3];
 [v3][a4]overlay=1484:114:eof_action=pass:enable='between(t,14.6,18.2)'[v4];
 [v4][a5]overlay=1484:114:eof_action=pass:enable='between(t,18.2,22)'[v5];
 [v5][a6]overlay=1240:40:eof_action=pass:enable='between(t,22,28.6)'[v6];
 [v6][a7]overlay=1240:40:eof_action=pass:enable='between(t,28.5,30)'[v]" \
 -map "[v]" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -t 30 video_nosound.mp4
D=30
ffmpeg -y -loglevel error -i video_nosound.mp4 -f lavfi -i "aevalsrc='0.3*sin(2*PI*55*t)*exp(-14*mod(t,0.5))+0.035*sin(2*PI*220*t)+0.03*sin(2*PI*261.63*t)+0.028*sin(2*PI*329.63*t)+0.04*(random(0)-0.5)*exp(-40*mod(t+0.25,0.5))':s=44100:d=$D" -filter_complex "[1:a]volume=0.45,afade=t=in:d=1,afade=t=out:st=28:d=2[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 160k -t $D ada_volt_uzun_deneme.mp4
