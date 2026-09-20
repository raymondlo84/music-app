# 🎤 Freestyle Forge — Beat Studio

A browser-based rap beat sequencer. No dependencies, no build step — just open `index.html` and make beats.

## Features

- **7 instrument tracks**: kick, snare, hihat, clap, rim, shaker, bass
- **16-step sequencer** with per-track on/off grid
- **6 genre presets**: Boom Bap (90 BPM), Boom (95), Trap (145), Drill (140), Lo-Fi (80), 90s Classic (92)
- **FX chain**: lowpass filter, reverb, delay, distortion — all adjustable in real time
- **Save / Load / Randomize** patterns to/from localStorage
- **Swing control** and **BPM** slider (60–200)
- **Mute / Solo / Volume** per track

## How to run

1. Clone or download this repo
2. Open `index.html` in a modern browser (Chrome / Firefox / Edge)
3. Click **PLAY** to start the sequencer
4. Toggle steps in the grid to build your beat
5. Adjust FX sliders, mute tracks, randomize, or save your pattern

No server required. No dependencies. No install.

## Audio architecture

```
[Web Audio API Synthesizers]
         │
         ▼
  ┌─────────────┐
  │  Master Gain │
  └──────┬──────┘
         ├──→ Reverb (convolver + wet/dry)
         ├──→ Delay (feedback loop + wet/dry)
         ├──→ Distortion (waveshaper)
         └──→ Lowpass Filter (Biquad)
                          │
                          ▼
                    [Analyser] → Speakers
```

## Tech

- **Vanilla JS** — ES modules (`sequencer.js`, `synth.js`, `audio_engine.js`, `ui.js`, `main.js`)
- **Web Audio API** — synthesis, scheduling, FX chain
- **No frameworks, no build tools** — pure HTML/CSS/JS

## Project structure

```
├── index.html          # Single entry point
├── css/styles.css      # All styles
├── js/
│   ├── sequencer.js    # Step scheduler, BPM/swing, play/pause
│   ├── synth.js        # Web Audio instrument synthesis
│   ├── audio_engine.js # Master gain + audio context
│   ├── ui.js           # Grid rendering, FX UI, save/load, randomize
│   └── main.js         # Bootstraps everything on DOMContentLoaded
└── .gitignore
```
