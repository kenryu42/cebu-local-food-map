// Generate the Cebuano phrase clips in public/audio/phrases/ with ElevenLabs.
//
//   ELEVENLABS_API_KEY=... node scripts/generate-phrase-audio.ts
//
// Only phrases that are new or whose text changed are generated. Every new clip must decode
// (ffprobe), and is read back through speech-to-text. Speech-to-text ignores language_code=ceb and
// guesses the language of one- or two-word clips (Palihug comes back in Malayalam script), so a
// differing transcript is a prompt to listen to that clip, not a failure. Afterwards
// this run's generations and transcripts are deleted from ElevenLabs and checked to be gone;
// the MP3s stay in the repo. Clips for phrases that no longer exist are removed.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { phraseGroups } from '../src/data.ts';

const API = 'https://api.elevenlabs.io/v1';
const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'D8TuWQEXN52BAdnzubRD'; // "Jake - Casual", a Cebuano voice from the voice library
const MODEL_ID = 'eleven_v4';
const OUT_DIR = new URL('../public/audio/phrases/', import.meta.url).pathname;
const MANIFEST = join(OUT_DIR, 'manifest.json');

if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set');
  process.exit(1);
}

interface Manifest { voice: string; model: string; clips: Record<string, string> }
const previous: Manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : { voice: VOICE_ID, model: MODEL_ID, clips: {} };
const sameVoice = previous.voice === VOICE_ID && previous.model === MODEL_ID;

const phrases = phraseGroups.flatMap(group => group.phrases);
const todo = phrases.filter(p =>
  !sameVoice || previous.clips[p.id] !== p.phrase || !existsSync(join(OUT_DIR, `${p.id}.mp3`)));

mkdirSync(OUT_DIR, { recursive: true });
const headers = { 'xi-api-key': KEY };
const historyIds: string[] = [];
const transcriptIds: string[] = [];
const mismatches: string[] = [];
const clips: Record<string, string> = sameVoice ? { ...previous.clips } : {};

// Letters only, so punctuation and capitals don't count as a mismatch
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');

try {
  for (const { id, phrase } of todo) {
    const response = await fetch(`${API}/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: phrase,
        model_id: MODEL_ID,
        language_code: 'ceb',
        voice_settings: { stability: 0.6, similarity_boost: 0.75 }
      })
    });
    if (!response.ok) throw new Error(`TTS ${id}: HTTP ${response.status} ${await response.text()}`);
    const historyId = response.headers.get('history-item-id');
    if (historyId) historyIds.push(historyId);
    else console.warn(`  ${id}: no history-item-id (request ${response.headers.get('request-id')}); clean up by hand`);

    const file = join(OUT_DIR, `${id}.mp3`);
    const audio = Buffer.from(await response.arrayBuffer());
    writeFileSync(file, audio);

    const duration = Number(execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file
    ]).toString().trim());
    if (!(duration > 0.2)) throw new Error(`${id}: clip does not decode (duration ${duration})`);

    const form = new FormData();
    form.append('model_id', 'scribe_v2');
    form.append('language_code', 'ceb');
    form.append('file', new Blob([audio], { type: 'audio/mpeg' }), `${id}.mp3`);
    const stt = await fetch(`${API}/speech-to-text`, { method: 'POST', headers, body: form });
    if (!stt.ok) throw new Error(`STT ${id}: HTTP ${stt.status} ${await stt.text()}`);
    const { text, transcription_id: transcriptId } = await stt.json() as { text: string; transcription_id?: string };
    if (transcriptId) transcriptIds.push(transcriptId);

    const heard = normalize(text) === normalize(phrase) ? 'match' : 'MISMATCH';
    if (heard === 'MISMATCH') mismatches.push(`${id}: wrote "${phrase}", heard "${text}"`);
    clips[id] = phrase;
    console.log(`  ${id}  ${duration.toFixed(2)}s  heard "${text}"  ${heard}`);
  }
} finally {
  // Delete this run's remote generations and transcripts, then confirm each is gone
  const leftovers: string[] = [];
  for (const id of historyIds) {
    await fetch(`${API}/history/${id}`, { method: 'DELETE', headers });
    const check = await fetch(`${API}/history/${id}`, { headers });
    const body = await check.text();
    const gone = check.status === 404 || (check.status === 400 && body.includes('was not found'));
    if (!gone) leftovers.push(`history ${id} (HTTP ${check.status})`);
  }
  for (const id of transcriptIds) {
    await fetch(`${API}/speech-to-text/transcripts/${id}`, { method: 'DELETE', headers });
    const check = await fetch(`${API}/speech-to-text/transcripts/${id}`, { headers });
    if (check.status !== 404) leftovers.push(`transcript ${id} (HTTP ${check.status})`);
  }
  console.log(`remote cleanup: ${historyIds.length} generations and ${transcriptIds.length} transcripts deleted` +
    (leftovers.length ? `; NOT confirmed gone: ${leftovers.join(', ')}` : ', all confirmed gone'));
  writeFileSync(MANIFEST, JSON.stringify({ voice: VOICE_ID, model: MODEL_ID, clips }, null, 2) + '\n');
}

// Remove clips for phrases that were deleted from data.ts
const keep = new Set(phrases.map(p => `${p.id}.mp3`));
for (const file of readdirSync(OUT_DIR)) {
  if (file.endsWith('.mp3') && !keep.has(file)) {
    rmSync(join(OUT_DIR, file));
    delete clips[file.replace(/\.mp3$/, '')];
    console.log(`  removed ${file}`);
  }
}
writeFileSync(MANIFEST, JSON.stringify({ voice: VOICE_ID, model: MODEL_ID, clips }, null, 2) + '\n');

console.log(`${todo.length} generated, ${phrases.length - todo.length} already current`);
if (mismatches.length) {
  console.log(`listen to these ${mismatches.length} clip(s); speech-to-text heard something else:\n  ${mismatches.join('\n  ')}`);
}
