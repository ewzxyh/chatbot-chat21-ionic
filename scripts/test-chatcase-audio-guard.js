const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'chatcase-pdf-preview.js'), 'utf8');
const bubbleTemplate = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'chatlib', 'conversation-detail', 'message', 'bubble-message', 'bubble-message.component.html'), 'utf8');
const audioComponent = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'chatlib', 'conversation-detail', 'message', 'audio', 'audio.component.ts'), 'utf8');
const audioTemplate = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'chatlib', 'conversation-detail', 'message', 'audio', 'audio.component.html'), 'utf8');
const conversationDetail = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'pages', 'conversation-detail', 'conversation-detail.page.ts'), 'utf8');

assert(!source.includes('function createAudioCard'));
assert(!source.includes('.chatcase-audio-card'));
assert(source.includes("source.indexOf('/assets/sounds/') !== -1"));
assert(source.includes('element instanceof HTMLAudioElement && !isNotificationAudio(element)'));
assert(source.includes('pauseMessageAudio(audio, true, true)'));
assert(source.includes("if (match[1] === 'audio') {\n        removeStructuredPreviewText(textNode, preview);\n        continue;"));
assert(bubbleTemplate.includes('<chat-audio  *ngIf="isAudio(message)"'));
assert(!audioTemplate.includes('[src]="'));
assert(audioTemplate.includes('preload="none"'));
assert(audioTemplate.includes('muted'));
assert(audioComponent.indexOf('audio.src = this.rawAudioUrl') > audioComponent.indexOf('playPauseAudio()'));
assert(audioComponent.indexOf('audio.muted = false') > audioComponent.indexOf('playPauseAudio()'));
assert(conversationDetail.includes("audio.removeAttribute('src')"));
