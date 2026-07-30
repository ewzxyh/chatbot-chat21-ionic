const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'chatcase-pdf-preview.js'), 'utf8');
const createAudioCard = source.slice(source.indexOf('function createAudioCard'), source.indexOf('function removeStructuredPreviewText'));

assert(createAudioCard.indexOf("audio.addEventListener('play'") < createAudioCard.indexOf('audio.src = payload.src'));
assert(createAudioCard.includes('if (!authorizedMessageAudio.has(audio))'));
assert(source.includes("if (audio.matches('.chatcase-audio-card audio')) return;"));
