/**
 * Generate a simple, calming notification sound
 * Creates a gentle sine wave tone suitable for a mental health app
 */

const fs = require('fs');
const path = require('path');

// WAV file parameters
const SAMPLE_RATE = 44100;
const DURATION = 0.8; // seconds - short and gentle
const FREQUENCY = 523.25; // C5 note - calming middle-high tone
const FREQUENCY2 = 659.25; // E5 note - pleasant harmony
const VOLUME = 0.3; // Soft volume (0-1)

function generateNotificationSound() {
  const numSamples = Math.floor(SAMPLE_RATE * DURATION);
  const buffer = Buffer.alloc(44 + numSamples * 2); // Header + 16-bit samples

  // WAV Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4); // File size - 8
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1 size
  buffer.writeUInt16LE(1, 20); // Audio format (PCM)
  buffer.writeUInt16LE(1, 22); // Num channels (mono)
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // Sample rate
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32); // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40); // Data size

  // Generate audio samples - gentle two-tone chime with fade
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Envelope: quick attack, gradual decay
    const attackTime = 0.05;
    const decayStart = 0.1;
    let envelope;

    if (t < attackTime) {
      envelope = t / attackTime; // Attack
    } else if (t < decayStart) {
      envelope = 1.0; // Sustain briefly
    } else {
      envelope = Math.exp(-3 * (t - decayStart)); // Exponential decay
    }

    // Two harmonious sine waves for a pleasant chime
    const wave1 = Math.sin(2 * Math.PI * FREQUENCY * t);
    const wave2 = Math.sin(2 * Math.PI * FREQUENCY2 * t) * 0.5;
    const wave3 = Math.sin(2 * Math.PI * FREQUENCY * 2 * t) * 0.2; // Octave harmonic

    const sample = (wave1 + wave2 + wave3) * envelope * VOLUME;

    // Convert to 16-bit integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  // Save the file
  const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  const outputPath = path.join(soundsDir, 'notification.wav');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath}`);
  console.log(`Duration: ${DURATION}s, Sample Rate: ${SAMPLE_RATE}Hz`);
}

generateNotificationSound();
