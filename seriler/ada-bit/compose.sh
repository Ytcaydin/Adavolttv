set -e
A=/home/claude/uzun/alpha
seg(){ echo "[$1:v]fps=30,scale=-1:1050,trim=0:$2,setpts=PTS-STARTPTS+$3/TB[a$1];"; }
ffmpeg -y -loglevel error -i base.mp4 \
 -stream_loop -1 -i $A/konusma.mov -stream_loop -1 -i $A/onay.mov -i $A/sasirma.mov -stream_loop -1 -i $A/konusma.mov \
 -i $A/sasirma.mov -stream_loop -1 -i $A/onay.mov -stream_loop -1 -i $A/konusma.mov -i top.mov \
 -filter_complex "$(seg 1 6.5 0)$(seg 2 2.1 6.5)$(seg 3 4.4 8.6)$(seg 4 6.5 13.0)$(seg 5 4.4 19.5)$(seg 6 4.4 23.9)$(seg 7 5.7 28.3)
 [0:v][a1]overlay=-60:870:eof_action=pass:enable='between(t,0,6.5)'[v1];
 [v1][a2]overlay=-60:870:eof_action=pass:enable='between(t,6.5,8.6)'[v2];
 [v2][a3]overlay=-60:870:eof_action=pass:enable='between(t,8.6,13.0)'[v3];
 [v3][a4]overlay=-60:870:eof_action=pass:enable='between(t,13.0,19.5)'[v4];
 [v4][a5]overlay=-60:870:eof_action=pass:enable='between(t,19.5,23.9)'[v5];
 [v5][a6]overlay=-60:870:eof_action=pass:enable='between(t,23.9,28.3)'[v6];
 [v6][a7]overlay=-60:870:eof_action=pass:enable='between(t,28.3,34)'[v7];
 [v7][8:v]overlay=0:0[v]" -map "[v]" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -t 34 video_nosound.mp4
