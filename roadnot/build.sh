#!/bin/bash
# kullanım: build.sh <klasör>  (config.js içinde out adı)
set -e
cd "$1"; OUT=$(node -e "console.log(require(require('path').resolve('config.js')).out)")
node ../cues.js config.js > cues.json && python3 ../music.py cues.json muzik.wav
node ../engine.js config.js render
ffmpeg -y -loglevel error -i ${OUT}_v.mp4 -i muzik.wav -c:v copy -af "loudnorm=I=-14:TP=-1.5" -c:a aac -b:a 160k -shortest -movflags +faststart ${OUT}.mp4
rm -f ${OUT}_pv_*.png; echo "built $1/${OUT}.mp4"
