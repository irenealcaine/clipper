# Clipper

Web app to cut any video or audio into a 10-second clip. Videos are converted to vertical 9:16 format, ready for social media; audio is exported as a 10-second MP3.

## Features

- Upload a video by drag and drop or file picker.
- Upload an audio file in its own section to cut it without the video flow.
- See the audio waveform to choose where to cut.
- Cut several audio fragments at once: drag each one over the song waveform (mouse or keyboard) and each fragment shows its own waveform, its start/end marks and its own save button, downloading `clip-1.mp3`, `clip-2.mp3`, etc.
- Preview the video and choose the exact 10-second segment by dragging a sliding timeline window.
- Choose the crop zone by dragging a 9:16 frame over the preview (keyboard accessible).
- Process the video on the server with ffmpeg: 10-second cut, 9:16 crop and scale to 1080x1920.
- Process audio on the server with ffmpeg: 10-second cut exported as MP3 (192 kbps).
- Preview and download the resulting video clip as MP4.
- Installable as a Progressive Web App.

## Tech stack

- Frontend: React, Vite.
- Styling: plain CSS (dark "darkroom" theme, mobile-first) with design tokens in `src/styles/variables.css`. Typography: Syne and Archivo (Google Fonts).
- Package manager: pnpm.
- Icons: [react-icons](https://react-icons.github.io/react-icons/) (Font Awesome 6 set).
- Video and audio processing: [video-processor](../video-processor) backend (`POST /cut` and `POST /cut-audio`) using ffmpeg.

## Project structure

```text
clipper/
├── public/
│   ├── apple-touch-icon.png
│   ├── clipper.svg
│   ├── icon-192.png
│   ├── icon-512-maskable.png
│   ├── icon-512.png
│   ├── manifest.json
│   └── sw.js
└── src/
    ├── components/   Uploaders, video and audio editors, waveform, crop and segment selectors, result, footer
    ├── constants/    Clip duration, aspect ratio and API URL
    ├── hooks/        Shared drag and drop logic for the uploaders
    ├── services/     API client for the /cut and /cut-audio endpoints
    ├── styles/       Global styles and design tokens (variables.css)
    └── utils/        Audio waveform peaks, time formatting and media metadata reading
```

## Installation

```bash
pnpm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
VITE_API_URL=http://localhost:8080
```

`VITE_API_URL` must point to a running [video-processor](../video-processor) instance exposing the `/cut` and `/cut-audio` endpoints.

## Usage

Start the video-processor backend (it needs ffmpeg installed or its Docker image):

```bash
pnpm dev
```

Then open the app, upload a video of at least 10 seconds, choose the segment start and the crop zone, and press "Cortar video". The result can be previewed and downloaded as `clip.mp4`. To cut audio instead, use the "Sube tu audio" section: the waveform appears on load, choose how many fragments you need, drag each timeline window and press "Guardar fragmento" to download each `clip.mp3`.

## Build

```bash
pnpm build
pnpm preview
```
