"use strict";

// ========================================
// BACKEND CONFIGURATION
// ========================================

const API_ROOT =
  "https://earth-beat-backend-production.up.railway.app/api/earth";

const $ = (id) => document.getElementById(id);

const canvas = $("scope");
const ctx = canvas.getContext("2d");

const playButton = $("play");
const stopButton = $("stop");
const modeSelect = $("mode");
const volumeSlider = $("volume");
const dataInput = $("dataValue");
const statusText = $("apiStatus");

// ========================================
// SIGNAL CONFIGURATION
// ========================================

const modes = {
  temperature: {
    title: "Temperature signal",
    color: "#ffc53d",
    colorLabel: "Amber",
    source: "NASA DATA"
  },

  rainfall: {
    title: "Rainfall signal",
    color: "#42d5ff",
    colorLabel: "Blue",
    source: "MANUAL VALUE",
    label: "RAINFALL (mm)",
    hint: "Enter a rainfall amount in millimeters (0 or higher).",
    min: "0",
    max: null,
    step: "1",
    defaultValue: "45"
  },

  vegetation: {
    title: "Vegetation signal",
    color: "#8dfc50",
    colorLabel: "Green",
    source: "MANUAL VALUE",
    label: "VEGETATION (NDVI)",
    hint: "Enter NDVI between -1 and 1 (e.g. 0.65).",
    min: "-1",
    max: "1",
    step: "0.01",
    defaultValue: "0.65"
  }
};

const savedValues = {
  rainfall: "45",
  vegetation: "0.65"
};

// ========================================
// APPLICATION STATE
// ========================================

let displayedFrame = null;
let activeAudioBuffer = null;

let soundSource = null;
let soundContext = null;
let volumeGain = null;

let isPlaying = false;

let loadSequence = 0;
let frameSequence = 0;

let pendingRequest = null;

let currentPlaybackStart = 0;
let drawClock = 0;
let inputTimer = null;

// ========================================
// STATUS HANDLING
// ========================================

function setStatus(message, state = "") {
  statusText.textContent = message;
  statusText.className = `api-status ${state}`.trim();
}

// ========================================
// INPUT VALIDATION
// ========================================

function currentInputValue() {
  const value = dataInput.value.trim();
  const number = Number(value);

  if (!value || !Number.isFinite(number)) {
    throw new Error("Enter a valid numeric value.");
  }

  if (modeSelect.value === "rainfall" && number < 0) {
    throw new Error("Rainfall must be 0 mm or higher.");
  }

  if (
    modeSelect.value === "vegetation" &&
    (number < -1 || number > 1)
  ) {
    throw new Error("Vegetation NDVI must be between -1 and 1.");
  }

  return number;
}

// ========================================
// BACKEND DATA API
// ========================================

function getFrameUrl() {
  switch (modeSelect.value) {

    case "temperature":
      return `${API_ROOT}/temperature/latest`;

    case "rainfall":
      return (
        `${API_ROOT}/rainfall?rainfallMm=` +
        encodeURIComponent(currentInputValue())
      );

    case "vegetation":
      return (
        `${API_ROOT}/vegetation?ndvi=` +
        encodeURIComponent(currentInputValue())
      );

    default:
      throw new Error("Unknown signal mode.");
  }
}

// ========================================
// BACKEND AUDIO API
// ========================================

function getAudioUrl(frame, signal) {

  if (signal === "temperature") {
    return (
      `${API_ROOT}/temperature/audio` +
      `?year=${frame.year}&month=${frame.month}`
    );
  }

  if (signal === "rainfall") {
    return (
      `${API_ROOT}/rainfall/audio?rainfallMm=` +
      encodeURIComponent(frame.value)
    );
  }

  return (
    `${API_ROOT}/vegetation/audio?ndvi=` +
    encodeURIComponent(frame.value)
  );
}

// ========================================
// HTTP REQUEST HANDLING
// ========================================

async function request(url, asAudio = false, signal) {

  const response = await fetch(url, {
    signal,
    cache: "no-store"
  });

  if (!response.ok) {

    let errorMessage = "";

    try {
      const body = await response.json();

      errorMessage =
        body.detail ||
        body.message ||
        body.error ||
        "";

    } catch {
      // Non-JSON error body
    }

    const fallback = response.status === 503
      ? "NASA dataset is not ready. Check MySQL and NASA import logs."
      : `Backend returned HTTP ${response.status}.`;

    throw new Error(errorMessage || fallback);
  }

  return asAudio
    ? response.arrayBuffer()
    : response.json();
}

// ========================================
// FORMAT SIGNAL VALUES
// ========================================

function formatValue(frame, signal) {

  if (signal === "temperature") {
    return `${Number(frame.temperatureAnomalyC).toFixed(2)} °C`;
  }

  if (signal === "rainfall") {
    return `${Number(frame.value).toFixed(2)} mm`;
  }

  return `${Number(frame.value).toFixed(2)} NDVI`;
}

// ========================================
// DISPLAY BACKEND DATA
// ========================================

function displayFrame(frame, signal) {

  displayedFrame = frame;

  $("signal").textContent = formatValue(frame, signal);

  $("pitch").textContent = `${frame.frequencyHz} Hz`;

  $("color").textContent = modes[signal].colorLabel;

  $("sourceTag").textContent = modes[signal].source;

  if (signal === "temperature") {

    setStatus(
      `NASA GISTEMP • ${frame.date} • ` +
      `${frame.frequencyHz} Hz • API connected`,
      "ready"
    );

  } else {

    setStatus(
      `${modes[signal].title} • ` +
      `${formatValue(frame, signal)} • ` +
      `API connected (manual input)`,
      "ready"
    );
  }
}

// ========================================
// REFRESH BACKEND SIGNAL
// ========================================

async function refreshFrame() {

  const id = ++frameSequence;
  const signal = modeSelect.value;

  displayedFrame = null;

  $("signal").textContent = "--";
  $("pitch").textContent = "--";

  setStatus("Loading signal data from backend...");

  try {

    const frame = await request(getFrameUrl());

    if (
      id !== frameSequence ||
      signal !== modeSelect.value
    ) {
      return null;
    }

    displayFrame(frame, signal);

    return frame;

  } catch (error) {

    if (id !== frameSequence) {
      return null;
    }

    setStatus(
      `API unavailable: ${error.message}`,
      "error"
    );

    return null;
  }
}

// ========================================
// STOP AUDIO SOURCE
// ========================================

function stopSource() {

  if (!soundSource) {
    return;
  }

  try {
    soundSource.stop();
  } catch {
    // Source may already be stopped
  }

  soundSource.disconnect();
  soundSource = null;
}

// ========================================
// STOP PLAYBACK
// ========================================

function stopPlayback({ showReadyStatus = false } = {}) {

  ++loadSequence;

  if (pendingRequest) {
    pendingRequest.abort();
    pendingRequest = null;
  }

  stopSource();

  isPlaying = false;

  playButton.disabled = false;
  playButton.textContent = "▶ START SOUND";

  if (showReadyStatus && displayedFrame) {
    setStatus(
      "Stopped • Press START SOUND to play backend audio."
    );
  }
}

// ========================================
// WEB AUDIO INITIALIZATION
// ========================================

function setupAudio() {

  if (!soundContext) {

    const BrowserAudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!BrowserAudioContext) {
      throw new Error(
        "This browser does not support Web Audio."
      );
    }

    soundContext = new BrowserAudioContext();

    volumeGain = soundContext.createGain();

    volumeGain.connect(soundContext.destination);
  }

  volumeGain.gain.setTargetAtTime(
    Number(volumeSlider.value) * 6,
    soundContext.currentTime,
    0.02
  );

  return soundContext.resume();
}

// ========================================
// START BACKEND AUDIO
// ========================================

async function startPlayback() {

  if (isPlaying) {
    stopPlayback({ showReadyStatus: true });
    return;
  }

  const signal = modeSelect.value;

  let audioResume;

  try {

    audioResume = setupAudio();

    getFrameUrl();

  } catch (error) {

    setStatus(error.message, "error");

    return;
  }

  stopPlayback();

  const id = ++loadSequence;

  const controller = new AbortController();

  pendingRequest = controller;

  playButton.disabled = true;
  playButton.textContent = "LOADING...";

  setStatus(
    "Requesting WAV audio from Spring Boot..."
  );

  try {

    await audioResume;

    // Fetch signal metadata
    const frame = await request(
      getFrameUrl(),
      false,
      controller.signal
    );

    if (
      id !== loadSequence ||
      signal !== modeSelect.value
    ) {
      return;
    }

    displayFrame(frame, signal);

    // Fetch WAV audio from Railway backend
    const wav = await request(
      getAudioUrl(frame, signal),
      true,
      controller.signal
    );

    if (
      id !== loadSequence ||
      signal !== modeSelect.value
    ) {
      return;
    }

    // Decode WAV into AudioBuffer
    const buffer = await soundContext.decodeAudioData(wav);

    if (
      id !== loadSequence ||
      signal !== modeSelect.value
    ) {
      return;
    }

    stopSource();

    activeAudioBuffer = buffer;

    soundSource = soundContext.createBufferSource();

    soundSource.buffer = buffer;
    soundSource.loop = true;

    soundSource.connect(volumeGain);

    soundSource.start();

    currentPlaybackStart = soundContext.currentTime;

    isPlaying = true;

    playButton.textContent = "■ PLAYING";

    setStatus(
      `${signal === "temperature" ? "NASA month" : "Manual value"} • ` +
      `Playing backend-generated WAV ` +
      `(${Math.round(buffer.duration * 1000)} ms, looping)`,
      "ready"
    );

  } catch (error) {

    if (
      id !== loadSequence ||
      error.name === "AbortError"
    ) {
      return;
    }

    stopSource();

    isPlaying = false;

    setStatus(
      `Cannot play backend sound: ${error.message}`,
      "error"
    );

  } finally {

    if (id === loadSequence) {

      pendingRequest = null;

      playButton.disabled = false;

      if (!isPlaying) {
        playButton.textContent = "▶ START SOUND";
      }
    }
  }
}

// ========================================
// CHANGE SIGNAL MODE
// ========================================

function updateMode() {

  clearTimeout(inputTimer);

  ++frameSequence;

  stopPlayback();

  activeAudioBuffer = null;

  const signal = modeSelect.value;
  const config = modes[signal];

  $("modeTitle").textContent = config.title;

  $("color").textContent = config.colorLabel;

  $("sourceTag").textContent = config.source;

  $("inputGroup").hidden = signal === "temperature";

  if (signal !== "temperature") {

    $("dataLabel").textContent = config.label;

    $("dataHint").textContent = config.hint;

    dataInput.min = config.min;

    if (config.max === null) {
      dataInput.removeAttribute("max");
    } else {
      dataInput.max = config.max;
    }

    dataInput.step = config.step;

    dataInput.value = savedValues[signal];
  }

  refreshFrame();
}

// ========================================
// BUTTON EVENT LISTENERS
// ========================================

playButton.addEventListener(
  "click",
  startPlayback
);

stopButton.addEventListener("click", () => {
  stopPlayback({ showReadyStatus: true });
});

modeSelect.addEventListener(
  "change",
  updateMode
);

// ========================================
// VOLUME CONTROL
// ========================================

volumeSlider.addEventListener("input", () => {

  if (volumeGain && soundContext) {

    volumeGain.gain.setTargetAtTime(
      Number(volumeSlider.value) * 6,
      soundContext.currentTime,
      0.02
    );
  }
});

// ========================================
// MANUAL SIGNAL INPUT
// ========================================

dataInput.addEventListener("input", () => {

  const signal = modeSelect.value;

  if (signal === "temperature") {
    return;
  }

  savedValues[signal] = dataInput.value;

  ++frameSequence;

  stopPlayback();

  activeAudioBuffer = null;

  clearTimeout(inputTimer);

  inputTimer = setTimeout(
    refreshFrame,
    350
  );
});

// ========================================
// RESET
// ========================================

$("reset").addEventListener("click", () => {

  savedValues.rainfall =
    modes.rainfall.defaultValue;

  savedValues.vegetation =
    modes.vegetation.defaultValue;

  modeSelect.value = "temperature";

  updateMode();
});

// ========================================
// CANVAS WAVEFORM VISUALIZATION
// ========================================

function frameCanvas() {

  const { width, height } = canvas;

  ctx.fillStyle = "#010918";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  // Background grid
  ctx.strokeStyle = "#12355b";
  ctx.lineWidth = 1;

  for (let y = 50; y < height; y += 50) {

    ctx.beginPath();

    ctx.moveTo(0, y);
    ctx.lineTo(width, y);

    ctx.stroke();
  }

  if (activeAudioBuffer) {

    // Actual PCM samples from backend WAV
    const pcm =
      activeAudioBuffer.getChannelData(0);

    const windowSamples = Math.min(
      pcm.length,
      Math.round(
        activeAudioBuffer.sampleRate * 0.06
      )
    );

    const maxStart = Math.max(
      0,
      pcm.length - windowSamples
    );

    const offset = isPlaying
      ? (
          Math.floor(
            (soundContext.currentTime - currentPlaybackStart) *
            activeAudioBuffer.sampleRate
          ) % Math.max(1, maxStart + 1)
        )
      : 0;

    ctx.beginPath();

    for (let x = 0; x < width; x++) {

      const index =
        offset +
        Math.min(
          windowSamples - 1,
          Math.floor(
            x / width * windowSamples
          )
        );

      const y =
        height / 2 -
        pcm[index] * height * 1.05;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineWidth = 2.5;

    ctx.strokeStyle =
      modes[modeSelect.value].color;

    ctx.stroke();

  } else {

    // Placeholder waveform visualization
    ctx.beginPath();

    for (let x = 0; x < width; x++) {

      const y =
        height / 2 +
        30 * Math.sin(
          x * 0.025 + drawClock
        );

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineWidth = 2;

    ctx.strokeStyle =
      modes[modeSelect.value].color;

    ctx.stroke();

    drawClock += 0.01;
  }

  requestAnimationFrame(frameCanvas);
}

// ========================================
// INITIALIZE APPLICATION
// ========================================

updateMode();

requestAnimationFrame(frameCanvas);