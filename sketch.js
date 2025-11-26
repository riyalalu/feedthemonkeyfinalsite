// VALIDATION MONKEY - With p5.sound Library
// Canvas: 1080w x 1350h

let backgroundImg;
let layer3Img;
let layer4Img;
let layer5Img;
let monkeyFaceImg;
let quoteImages = [];
let monkey;
let currentQuote = null;
let particles = [];
let burstTriggered = false;
let isDraggingQuote = false;
let quoteSpawnTimer = 0;
let waitingToSpawn = false;
let quoteDirection = 1;

// Recording variables
let recorder;
let recordedChunks = [];
let isRecording = false;
let recordButton;

// Line effect variables
let flowingLines = [];
let numLines = 80;

// Slider controls
let sliderNumLines;
let sliderThickness;
let sliderMinLength;
let sliderMaxLength;
let sliderCurviness;

// SOUND DESIGN - p5.sound
let baseOsc1, baseOsc2, baseOsc3, baseOsc4; // Continuous chord oscillators
let tensionOsc;
let catchOsc;
let etherealOscs = [];
let audioStarted = false;
let proximityThreshold = 250;
let lastTensionTime = 0;

// GitHub Raw URLs
const BACKGROUND_URL = 'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinal/41065c579e748ff1c4cedea257e7f1fe0f0b1bd5/monkey%201.png';
const LAYER3_URL = 'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinal2/806acf231580bc463245b08c7b4ea13aa1d09c37/monkey%202.png';
const LAYER4_URL = 'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinal2/806acf231580bc463245b08c7b4ea13aa1d09c37/monkey%202%20copy.png';
const LAYER5_URL = 'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinal2/806acf231580bc463245b08c7b4ea13aa1d09c37/monkey%202%20copy%202.png';
const MONKEY_FACE_URL = 'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/monkey%203.png';

const QUOTE_URLS = [
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2010.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2011.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2012.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2013.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2014.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2015.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2016.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2017.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2018.png',
  'https://raw.githubusercontent.com/riyalalu/feedthemonkeyfinalfinal/04cda1d490c0633a37aa03b6c9bca4e1ee3daf92/Artboard%2019.png'
];

function preload() {
  backgroundImg = loadImage(BACKGROUND_URL);
  layer3Img = loadImage(LAYER3_URL);
  layer4Img = loadImage(LAYER4_URL);
  layer5Img = loadImage(LAYER5_URL);
  monkeyFaceImg = loadImage(MONKEY_FACE_URL);
  
  for (let url of QUOTE_URLS) {
    quoteImages.push(loadImage(url));
  }
}

function setup() {
  createCanvas(1080, 1350);
  noCursor();
  
  createRecordButton();
  createSliders();
  
  monkey = {
    currentX: 512,
    currentY: 802,
    currentWidth: 309,
    currentHeight: 218,
    targetX: 512,
    targetY: 802,
    targetWidth: 309,
    targetHeight: 218,
    startX: 512,
    startY: 802,
    startWidth: 309,
    startHeight: 218,
    endX: 512,
    endY: 678,
    endWidth: 660,
    endHeight: 467,
    validationsReceived: 0,
    maxValidations: 10
  };
  
  initializeLines();
  
  waitingToSpawn = true;
  quoteSpawnTimer = millis() + 5500; // 5.5 seconds to adjust to the experience
  
  setupSound();
}

function setupSound() {
  // Create continuous base chord - C Major 7 in C3 octave with SAWTOOTH
  // Varied volumes for richer, more dimensional sound
  
  baseOsc1 = new p5.Oscillator('sawtooth'); // Changed from sine
  baseOsc1.freq(midiToFreq(48)); // C3 (was C2/36)
  baseOsc1.amp(0);
  baseOsc1.start();
  
  baseOsc2 = new p5.Oscillator('sawtooth');
  baseOsc2.freq(midiToFreq(52)); // E3 (was E2/40)
  baseOsc2.amp(0);
  baseOsc2.start();
  
  baseOsc3 = new p5.Oscillator('sawtooth');
  baseOsc3.freq(midiToFreq(55)); // G3 (was G2/43)
  baseOsc3.amp(0);
  baseOsc3.start();
  
  baseOsc4 = new p5.Oscillator('sawtooth');
  baseOsc4.freq(midiToFreq(59)); // B3 (was B2/47)
  baseOsc4.amp(0);
  baseOsc4.start();
  
  // Tension oscillator
  tensionOsc = new p5.Oscillator('square');
  tensionOsc.amp(0);
  tensionOsc.start();
  
  // Catch oscillator
  catchOsc = new p5.Oscillator('triangle');
  catchOsc.amp(0);
  catchOsc.start();
  
  console.log('Sound setup complete');
}

function startAudio() {
  if (!audioStarted) {
    userStartAudio();
    
    // Fade in base chord with VARIED VOLUMES - slightly quieter
    // Root (C) and Fifth (G) louder, thirds (E, B) softer
    baseOsc1.amp(0.11, 2); // C3 - ROOT (was 0.14)
    baseOsc2.amp(0.07, 2); // E3 - Third (was 0.09)
    baseOsc3.amp(0.09, 2); // G3 - Fifth (was 0.12)
    baseOsc4.amp(0.06, 2); // B3 - Seventh (was 0.08)
    
    audioStarted = true;
    console.log("Audio started - C3 sawtooth base chord with varied volumes!");
  }
}

function draw() {
  noTint();
  
  if (waitingToSpawn && millis() >= quoteSpawnTimer) {
    spawnQuote();
    waitingToSpawn = false;
  }
  
  image(backgroundImg, 0, 0, width, height);
  drawFlowingLines();
  image(layer3Img, 0, 0, width, height);
  image(layer4Img, 0, 0, width, height);
  image(layer5Img, 0, 0, width, height);
  
  if (!burstTriggered) {
    updateMonkeyTransition();
    drawMonkeyFace();
  }
  
  if (currentQuote && !burstTriggered) {
    // Handle proximity-based sound intensity
    if (audioStarted) {
      handleProximitySound();
    }
    
    if (!isDraggingQuote) {
      currentQuote.x += 12 * quoteDirection;
      
      if (quoteDirection === 1 && currentQuote.x > width + 200) {
        currentQuote.x = -200;
      } else if (quoteDirection === -1 && currentQuote.x < -200) {
        currentQuote.x = width + 200;
      }
    }
    
    drawQuote(currentQuote);
  }
  
  updateAndDrawParticles();
  drawCustomCursor();
}

function handleProximitySound() {
  if (!currentQuote) return;
  
  let distance = dist(mouseX, mouseY, currentQuote.x, currentQuote.y);
  
  if (distance < proximityThreshold) {
    // Close to quote - INTENSE TENSION BUILD-UP
    let intensity = map(distance, proximityThreshold, 0, 0, 1);
    intensity = constrain(intensity, 0, 1);
    
    // GRADUALLY increase base volume - keeping varied levels
    baseOsc1.amp(0.11 + intensity * 0.08, 0.1); // C - Root
    baseOsc2.amp(0.07 + intensity * 0.05, 0.1); // E - Third
    baseOsc3.amp(0.09 + intensity * 0.06, 0.1); // G - Fifth
    baseOsc4.amp(0.06 + intensity * 0.08, 0.1); // B - Seventh (gains most intensity)
    
    // INCREASINGLY INTENSE pulses - faster and louder
    let pulseInterval = int(400 - intensity * 350); // Goes from 400ms to 50ms (very fast!)
    if (millis() - lastTensionTime > pulseInterval) {
      playTensionPulse(intensity); // Pass intensity for louder pulses
      lastTensionTime = millis();
    }
  } else {
    // Far from quote - calm base sound (varied volumes)
    baseOsc1.amp(0.11, 0.2); // C
    baseOsc2.amp(0.07, 0.2); // E
    baseOsc3.amp(0.09, 0.2); // G
    baseOsc4.amp(0.06, 0.2); // B
  }
}

function playTensionPulse(intensity) {
  // HIGHER frequency in same chord as base - C4 (octave up), MUCH LOUDER
  // Using sawtooth for density/thickness
  let tempOsc = new p5.Oscillator('sawtooth');
  tempOsc.freq(midiToFreq(60)); // C4 - octave above base C3
  tempOsc.start();
  
  // MUCH LOUDER and increases with intensity
  let pulseVolume = 0.15 + intensity * 0.15; // Goes from 0.15 to 0.30 (very loud!)
  tempOsc.amp(pulseVolume, 0.02); // Fast attack
  tempOsc.amp(0, 0.15); // Quick decay
  
  // Stop oscillator after pulse
  setTimeout(() => {
    tempOsc.stop();
  }, 200);
}

function playCatchSound() {
  // SLOW DESCENT - like breathing again
  // Base chord descends to calm (varied volumes)
  baseOsc1.amp(0.08, 1.5); // C (was 0.11)
  baseOsc2.amp(0.05, 1.5); // E (was 0.07)
  baseOsc3.amp(0.07, 1.5); // G (was 0.09)
  baseOsc4.amp(0.04, 1.5); // B (was 0.06)
  
  // Mellow release tone - G3 triangle wave
  catchOsc.freq(midiToFreq(55)); // G3
  catchOsc.amp(0.08, 0.2); // Gentle fade in
  catchOsc.amp(0, 1.5); // Long, slow fade out - relief
}

function playEtherealSound() {
  // ETHEREAL - Smooth blend that ascends then descends
  // C3 -> E3 -> G3 -> E3 -> C3 (goes up then back down smoothly)
  let midiSequence = [48, 52, 55, 52, 48]; // C3, E3, G3, E3, C3
  let volumes = [0.10, 0.12, 0.14, 0.12, 0.10]; // Peak in middle
  
  midiSequence.forEach((note, i) => {
    let osc = new p5.Oscillator('sine');
    osc.freq(midiToFreq(note));
    osc.start();
    
    // Smooth, overlapping fade in/out
    setTimeout(() => {
      osc.amp(volumes[i], 0.6); // Slower fade in (0.6s)
      // Overlapping fade out
      setTimeout(() => {
        osc.amp(0, 1.8); // Very slow, smooth fade out
        setTimeout(() => osc.stop(), 1800);
      }, 800);
    }, i * 150); // More overlap between notes
  });
  
  // Also gently return base chord to normal (varied volumes - quieter)
  setTimeout(() => {
    baseOsc1.amp(0.11, 3); // C
    baseOsc2.amp(0.07, 3); // E
    baseOsc3.amp(0.09, 3); // G
    baseOsc4.amp(0.06, 3); // B
  }, 500);
}

function drawCustomCursor() {
  push();
  textAlign(CENTER, CENTER);
  textSize(40);
  
  if (isDraggingQuote) {
    text('✋', mouseX, mouseY);
  } else {
    text('👆', mouseX, mouseY);
  }
  
  pop();
}

function createRecordButton() {
  recordButton = createButton('🔴 Start Recording (60fps)');
  recordButton.position(width + 250, 20);
  recordButton.style('padding', '10px 20px');
  recordButton.style('font-size', '16px');
  recordButton.style('background-color', '#ff4444');
  recordButton.style('color', 'white');
  recordButton.style('border', 'none');
  recordButton.style('border-radius', '5px');
  recordButton.style('cursor', 'pointer');
  recordButton.mousePressed(toggleRecording);
}

function toggleRecording() {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

function startRecording() {
  const canvas = document.querySelector('canvas');
  const stream = canvas.captureStream(60);
  
  const options = {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 12000000 // 12 Mbps (was 16)
  };
  
  recorder = new MediaRecorder(stream, options);
  recordedChunks = [];
  
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  
  recorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-monkey-recording.webm';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  recorder.start();
  isRecording = true;
  recordButton.html('⏹️ Stop Recording');
  recordButton.style('background-color', '#333');
  console.log('Recording started at 60fps, 12Mbps');
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    isRecording = false;
    recordButton.html('🔴 Start Recording (60fps)');
    recordButton.style('background-color', '#ff4444');
    console.log('Recording stopped');
  }
}

function createSliders() {
  let startY = height + 20;
  let spacing = 60;
  
  createP('Number of Lines').position(20, startY).style('color', 'white');
  sliderNumLines = createSlider(50, 300, 150, 1);
  sliderNumLines.position(20, startY + 25);
  sliderNumLines.style('width', '200px');
  sliderNumLines.input(regenerateLines);
  
  createP('Line Thickness').position(20, startY + spacing).style('color', 'white');
  sliderThickness = createSlider(0.5, 5, 2, 0.1);
  sliderThickness.position(20, startY + spacing + 25);
  sliderThickness.style('width', '200px');
  sliderThickness.input(regenerateLines);
  
  createP('Min Line Length').position(20, startY + spacing * 2).style('color', 'white');
  sliderMinLength = createSlider(20, 200, 50, 1);
  sliderMinLength.position(20, startY + spacing * 2 + 25);
  sliderMinLength.style('width', '200px');
  sliderMinLength.input(regenerateLines);
  
  createP('Max Line Length').position(20, startY + spacing * 3).style('color', 'white');
  sliderMaxLength = createSlider(100, 600, 400, 1);
  sliderMaxLength.position(20, startY + spacing * 3 + 25);
  sliderMaxLength.style('width', '200px');
  sliderMaxLength.input(regenerateLines);
  
  createP('Line Speed (Quote: 12)').position(20, startY + spacing * 4).style('color', 'white');
  sliderCurviness = createSlider(1, 10, 6, 0.5);
  sliderCurviness.position(20, startY + spacing * 4 + 25);
  sliderCurviness.style('width', '200px');
}

function regenerateLines() {
  flowingLines = [];
  initializeLines();
}

function initializeLines() {
  let lineCount = sliderNumLines ? sliderNumLines.value() : 150;
  flowingLines = [];
  
  let minLen = sliderMinLength ? sliderMinLength.value() : 50;
  let maxLen = sliderMaxLength ? sliderMaxLength.value() : 400;
  let thickness = sliderThickness ? sliderThickness.value() : 2;
  
  for (let i = 0; i < lineCount; i++) {
    let angle;
    if (random() > 0.5) {
      angle = random(TWO_PI);
    } else {
      let clusterCenter = random(TWO_PI);
      angle = clusterCenter + random(-0.5, 0.5);
    }
    
    let startRadius = random(50, 600);
    let length = random(minLen, maxLen);
    let lineThickness = thickness * random(0.2, 3.0);
    let opacity = random(50, 255);
    
    flowingLines.push({
      angle: angle,
      startRadius: startRadius,
      length: length,
      offset: random(0, 150),
      speed: 6,
      thickness: lineThickness,
      opacity: opacity
    });
  }
}

function drawFlowingLines() {
  push();
  strokeCap(PROJECT);
  
  let centerX = width / 2;
  let centerY = height / 2;
  
  for (let speedLine of flowingLines) {
    speedLine.offset += speedLine.speed;
    if (speedLine.offset > speedLine.length) {
      speedLine.offset = 0;
    }
    
    stroke(0, speedLine.opacity);
    strokeWeight(speedLine.thickness);
    
    let currentStart = speedLine.startRadius + speedLine.length - speedLine.offset;
    let currentEnd = currentStart + speedLine.length;
    
    let x1 = centerX + cos(speedLine.angle) * currentStart;
    let y1 = centerY + sin(speedLine.angle) * currentStart;
    let x2 = centerX + cos(speedLine.angle) * currentEnd;
    let y2 = centerY + sin(speedLine.angle) * currentEnd;
    
    line(x1, y1, x2, y2);
  }
  
  pop();
}

function updateMonkeyTransition() {
  let smoothness = 0.1;
  monkey.currentX = lerp(monkey.currentX, monkey.targetX, smoothness);
  monkey.currentY = lerp(monkey.currentY, monkey.targetY, smoothness);
  monkey.currentWidth = lerp(monkey.currentWidth, monkey.targetWidth, smoothness);
  monkey.currentHeight = lerp(monkey.currentHeight, monkey.targetHeight, smoothness);
}

function updateMonkeyTargets() {
  let progress = monkey.validationsReceived / monkey.maxValidations;
  monkey.targetX = lerp(monkey.startX, monkey.endX, progress);
  monkey.targetY = lerp(monkey.startY, monkey.endY, progress);
  monkey.targetWidth = lerp(monkey.startWidth, monkey.endWidth, progress);
  monkey.targetHeight = lerp(monkey.startHeight, monkey.endHeight, progress);
}

function drawMonkeyFace() {
  push();
  imageMode(CENTER);
  image(monkeyFaceImg, monkey.currentX, monkey.currentY, 
        monkey.currentWidth, monkey.currentHeight);
  pop();
}

function spawnQuote() {
  if (monkey.validationsReceived >= 10) return;
  
  let quoteImg = quoteImages[monkey.validationsReceived];
  quoteDirection = (monkey.validationsReceived % 2 === 0) ? 1 : -1;
  
  currentQuote = {
    imageIndex: monkey.validationsReceived,
    x: quoteDirection === 1 ? -200 : width + 200,
    y: height * 0.3 - 160,
    width: quoteImg ? quoteImg.width : 200,
    height: quoteImg ? quoteImg.height : 80,
    offsetX: 0,
    offsetY: 0
  };
}

function drawQuote(q) {
  push();
  imageMode(CENTER);
  
  let morphFactor = 0;
  if (isDraggingQuote) {
    let distanceToMonkey = dist(q.x, q.y, monkey.currentX, monkey.currentY);
    let maxDistance = 400;
    let minDistance = 50;
    morphFactor = constrain(map(distanceToMonkey, maxDistance, minDistance, 0, 1), 0, 1);
  }
  
  if (morphFactor < 0.5) {
    if (quoteImages[q.imageIndex]) {
      tint(255, 255 * (1 - morphFactor * 2));
      image(quoteImages[q.imageIndex], q.x, q.y, q.width, q.height);
      noTint();
    }
  } else {
    textAlign(CENTER, CENTER);
    textSize(160);
    text('🍌', q.x, q.y);
  }
  
  pop();
}

function createBurstParticles() {
  let cols = 20;
  let rows = 20;
  let pieceWidth = monkey.currentWidth / cols;
  let pieceHeight = monkey.currentHeight / rows;
  let circleSize = min(pieceWidth, pieceHeight);
  
  // BURST SOUND - Crescendo with all notes, musical and explosive!
  playBurstSound();
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let gridX = col * pieceWidth;
      let gridY = row * pieceHeight;
      let centerX = gridX + pieceWidth / 2 - monkey.currentWidth / 2;
      let centerY = gridY + pieceHeight / 2 - monkey.currentHeight / 2;
      let angle = atan2(centerY, centerX);
      let speed = random(6, 14);
      
      let pieceGraphic = createGraphics(pieceWidth, pieceHeight);
      pieceGraphic.image(monkeyFaceImg, -gridX, -gridY);
      
      particles.push({
        x: monkey.currentX + centerX,
        y: monkey.currentY + centerY,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed - random(2, 5),
        size: circleSize,
        graphic: pieceGraphic,
        pieceWidth: pieceWidth,
        pieceHeight: pieceHeight,
        alpha: 255,
        rotation: random(TWO_PI),
        rotationSpeed: random(-0.2, 0.2),
        life: 255,
        onGround: false
      });
    }
  }
}

function playBurstSound() {
  // ULTIMATE BURST - Chaotic + Cinematic + MASSIVE
  // Multi-layered explosion with noise, bass, harmonics, and chaos
  
  // LAYER 1: NOISE EXPLOSION (immediate chaos)
  let noiseOsc = new p5.Oscillator('white');
  noiseOsc.start();
  noiseOsc.amp(0.4, 0.001); // INSTANT loud noise
  noiseOsc.amp(0, 0.3); // Quick fade to reveal music
  setTimeout(() => noiseOsc.stop(), 300);
  
  // LAYER 2: BASS BOMB (sub-bass thump)
  let bassOsc = new p5.Oscillator('sawtooth');
  bassOsc.freq(midiToFreq(24)); // C1 - SUPER LOW
  bassOsc.start();
  bassOsc.amp(0.45, 0.01); // MASSIVE volume, instant attack
  bassOsc.amp(0, 2.5); // Long rumble
  setTimeout(() => bassOsc.stop(), 2500);
  
  // LAYER 3: Quick crescendo build (same as feeding but FASTER)
  let buildUp = [48, 52, 55, 52, 48]; // C3, E3, G3, E3, C3
  buildUp.forEach((note, i) => {
    let osc = new p5.Oscillator('sawtooth'); // Changed to sawtooth for aggression
    osc.freq(midiToFreq(note));
    osc.start();
    
    // Fast, aggressive crescendo
    setTimeout(() => {
      osc.amp(0.20 + i * 0.05, 0.05); // Building intensity
      setTimeout(() => {
        osc.amp(0, 0.15);
        setTimeout(() => osc.stop(), 150);
      }, 100);
    }, i * 30); // VERY fast stagger (was 50ms)
  });
  
  // LAYER 4: MASSIVE HARMONIC EXPLOSION (multiple octaves + dissonance)
  setTimeout(() => {
    // Main chord: C Major across 3 octaves + some dissonant notes for chaos
    let explosionChord = [
      36, 40, 43, // Low octave (C2, E2, G2)
      48, 52, 55, // Mid octave (C3, E3, G3)
      60, 64, 67, // High octave (C4, E4, G4)
      72, 76, 79, // Super high (C5, E5, G5) - sparkle
      50, 62      // DISSONANT NOTES (D3, D4) - adds chaos
    ];
    
    explosionChord.forEach((note, i) => {
      let osc = new p5.Oscillator('sine');
      osc.freq(midiToFreq(note));
      osc.start();
      
      // Staggered attack for richness
      let delay = i * 15; // Very slight stagger
      setTimeout(() => {
        osc.amp(0.35, 0.01); // VERY LOUD, instant attack
        osc.amp(0, 3.5); // Long, epic decay
        setTimeout(() => osc.stop(), 3500);
      }, delay);
    });
    
  }, 150); // After noise burst
  
  // LAYER 5: HIGH SPARKLE (bright shimmer on top)
  setTimeout(() => {
    let sparkleNotes = [84, 88, 91, 96]; // C6, E6, G6, C7 - VERY HIGH
    sparkleNotes.forEach((note, i) => {
      let osc = new p5.Oscillator('sine');
      osc.freq(midiToFreq(note));
      osc.start();
      
      setTimeout(() => {
        osc.amp(0.25, 0.2); // Gentle fade in
        osc.amp(0, 2.0); // Sparkly decay
        setTimeout(() => osc.stop(), 2000);
      }, i * 40);
    });
  }, 200);
  
  // LAYER 6: Base chord SURGES dramatically
  baseOsc1.amp(0.30, 0.02); // HUGE surge
  baseOsc2.amp(0.25, 0.02);
  baseOsc3.amp(0.28, 0.02);
  baseOsc4.amp(0.20, 0.02);
  
  // Then slowly, cinematically returns to normal
  setTimeout(() => {
    baseOsc1.amp(0.11, 3.5); // Long, epic return
    baseOsc2.amp(0.07, 3.5);
    baseOsc3.amp(0.09, 3.5);
    baseOsc4.amp(0.06, 3.5);
  }, 800);
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    if (!p.onGround) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      
      if (p.y >= height - p.size / 2) {
        p.y = height - p.size / 2;
        p.vy *= -0.3;
        p.vx *= 0.7;
        p.rotationSpeed *= 0.5;
        
        if (abs(p.vy) < 0.5 && abs(p.vx) < 0.5) {
          p.onGround = true;
          p.vy = 0;
          p.vx = 0;
          p.rotationSpeed = 0;
        }
      }
      
      if (p.x < p.size / 2 || p.x > width - p.size / 2) {
        p.vx *= -0.5;
        p.x = constrain(p.x, p.size / 2, width - p.size / 2);
      }
    }
    
    if (p.onGround) {
      p.life -= 0.5;
    } else {
      p.life -= 1;
    }
    
    p.alpha = p.life;
    
    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    tint(255, p.alpha);
    imageMode(CENTER);
    
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(0, 0, p.size / 2, 0, TWO_PI);
    drawingContext.clip();
    image(p.graphic, 0, 0, p.pieceWidth, p.pieceHeight);
    drawingContext.restore();
    
    pop();
    
    if (p.life <= 0) {
      p.graphic.remove();
      particles.splice(i, 1);
    }
  }
}

function mousePressed() {
  // Start audio on first interaction
  startAudio();
  
  if (!currentQuote) return;
  
  let d = dist(mouseX, mouseY, currentQuote.x, currentQuote.y);
  
  if (d < currentQuote.width / 2) {
    isDraggingQuote = true;
    currentQuote.offsetX = currentQuote.x - mouseX;
    currentQuote.offsetY = currentQuote.y - mouseY;
    
    // Play catch sound
    if (audioStarted) {
      playCatchSound();
    }
  }
}

function mouseDragged() {
  if (isDraggingQuote && currentQuote) {
    currentQuote.x = mouseX + currentQuote.offsetX;
    currentQuote.y = mouseY + currentQuote.offsetY;
  }
}

function mouseReleased() {
  if (isDraggingQuote && currentQuote) {
    let d = dist(currentQuote.x, currentQuote.y, monkey.currentX, monkey.currentY);
    let hitRadius = max(monkey.currentWidth, monkey.currentHeight) / 2;
    
    if (d < hitRadius + 50) {
      if (monkey.validationsReceived < monkey.maxValidations) {
        monkey.validationsReceived++;
        updateMonkeyTargets();
        
        // Play ethereal feeding sound
        if (audioStarted) {
          playEtherealSound();
        }
        
        if (monkey.validationsReceived === monkey.maxValidations && !burstTriggered) {
          burstTriggered = true;
          currentQuote = null;
          createBurstParticles();
        } else {
          currentQuote = null;
          waitingToSpawn = true;
          quoteSpawnTimer = millis() + 2000;
        }
      }
    }
    
    isDraggingQuote = false;
  }
}