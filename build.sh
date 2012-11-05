#!/bin/bash
cat js/header.js \
js/SoundOutputBuffer.js \
js/PluckedString.js \
js/Guitar.js \
js/GuitarSynthFlash.js \
js/GuitarSynthWebAudio.js \
js/GuitarSynth.js > build/guitar.js
cp flash/GuitarSynth.swf build/.
