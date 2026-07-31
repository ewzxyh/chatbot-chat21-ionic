const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'chatcase-pdf-preview.js'), 'utf8');
const bubbleTemplate = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'chatlib', 'conversation-detail', 'message', 'bubble-message', 'bubble-message.component.html'), 'utf8');

assert(!source.includes('function createAudioCard'));
assert(!source.includes('.chatcase-audio-card'));
assert(source.includes("if (match[1] === 'audio') {\n        removeStructuredPreviewText(textNode, preview);\n        continue;"));
assert(bubbleTemplate.includes('<chat-audio  *ngIf="isAudio(message)"'));
