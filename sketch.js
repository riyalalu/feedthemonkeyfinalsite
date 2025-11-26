// VALIDATION MONKEY - FIXED SEAMLESS BURST
// 1920x1080 Layout
// Features: Visible Circular Particles, Smooth Shrink, Intensifying Lines

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

// Layer 4 Smooth Scaling
let currentLayer4Scale = 1.0;
let targetLayer4Scale = 1.0;

// Line effect variables
let flowingLines = [];

// SCALING & LAYOUT
let logicWidth = 1080;
let logicHeight = 1350;
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;

// SOUND DESIGN
let baseOsc1, baseOsc2, baseOsc3, baseOsc4;
let tensionOsc;
let catchOsc;
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
  // 1. Create 16:9 Container
  let cnv = createCanvas(1920, 1080);
  cnv.parent('sketch-container');
  
  // 2. Scaling Logic
  scaleFactor = height / logicHeight; 
  let scaledContentWidth = logicWidth * scaleFactor;
  offsetX = (width - scaledContentWidth) / 2;
  offsetY = (height - (logicHeight * scaleFactor)) / 2;

  noCursor();
  
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
  quoteSpawnTimer = millis() + 5500;
  
  setupSound();
}

function setupSound() {
  baseOsc1 = new p5.Oscillator('sawtooth'); 
  baseOsc1.freq(midiToFreq(48)); 
  baseOsc1.amp(0);
  baseOsc1.start();
  
  baseOsc2 = new p5.Oscillator('sawtooth');
  baseOsc2.freq(midiToFreq(52)); 
  baseOsc2.amp(0);
  baseOsc2.start();
  
  baseOsc3 = new p5.Oscillator('sawtooth');
  baseOsc3.freq(midiToFreq(55)); 
  baseOsc3.amp(0);
  baseOsc3.start();
  
  baseOsc4 = new p5.Oscillator('sawtooth');
  baseOsc4.freq(midiToFreq(59)); 
  baseOsc4.amp(0);
  baseOsc4.start();
  
  tensionOsc = new p5.Oscillator('square');
  tensionOsc.amp(0);
  tensionOsc.start();
  
  catchOsc = new p5.Oscillator('triangle');
  catchOsc.amp(0);
  catchOsc.start();
  
  console.log('Sound setup complete');
}

function startAudio() {
  if (!audioStarted) {
    userStartAudio();
    baseOsc1.amp(0.11, 2); 
    baseOsc2.amp(0.07, 2); 
    baseOsc3.amp(0.09, 2); 
    baseOsc4.amp(0.06, 2); 
    audioStarted = true;
    console.log("Audio started");
  }
}

function getLogicalMouse() {
  return {
    x: (mouseX - offsetX) / scaleFactor,
    y: (mouseY - offsetY) / scaleFactor
  };
}

function draw() {
  background(0);
  
  // SCALED DRAWING CONTEXT
  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);
  
  noTint();
  
  if (waitingToSpawn && millis() >= quoteSpawnTimer) {
    spawnQuote();
    waitingToSpawn = false;
  }
  
  // 1. Background
  image(backgroundImg, 0, 0, logicWidth, logicHeight);
  
  // 2. Lines
  drawFlowingLines();
  
  // 3. Layer 3 (Static)
  image(layer3Img, 0, 0, logicWidth, logicHeight);
  
  // 4. Layer 4 (Shrinks 3% smoothly)
  push();
    translate(logicWidth / 2, logicHeight / 2);
    imageMode(CENTER);
    currentLayer4Scale = lerp(currentLayer4Scale, targetLayer4Scale, 0.1);
    image(layer4Img, 0, 0, logicWidth * currentLayer4Scale, logicHeight * currentLayer4Scale);
  pop();
  
  // 5. Layer 5 (Static)
  image(layer5Img, 0, 0, logicWidth, logicHeight);
  
  if (!burstTriggered) {
    updateMonkeyTransition();
    drawMonkeyFace();
  }
  
  let m = getLogicalMouse();
  
  if (currentQuote && !burstTriggered) {
    if (audioStarted) {
      handleProximitySound(m.x, m.y);
    }
    
    if (!isDraggingQuote) {
      currentQuote.x += 12 * quoteDirection;
      
      if (quoteDirection === 1 && currentQuote.x > logicWidth + 200) {
        currentQuote.x = -200;
      } else if (quoteDirection === -1 && currentQuote.x < -200) {
        currentQuote.x = logicWidth + 200;
      }
    }
    
    drawQuote(currentQuote, m.x, m.y);
  }
  
  updateAndDrawParticles();
  
  pop(); 
  
  drawCustomCursor();
}

// ----------------------------------------------------
// FIXED CIRCULAR BURST LOGIC
// ----------------------------------------------------
function createBurstParticles() {
  let cols = 15;
  let rows = 15;
  let pieceWidth = monkey.currentWidth / cols;
  let pieceHeight = monkey.currentHeight / rows;
  let circleSize = min(pieceWidth, pieceHeight);
  
  playBurstSound();
  
  // Top-Left of Monkey in Logic World
  let startX = monkey.currentX - (monkey.currentWidth / 2);
  let startY = monkey.currentY - (monkey.currentHeight / 2);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      
      // Screen Position (Logic Coordinates)
      let pX = startX + (col * pieceWidth) + (pieceWidth / 2);
      let pY = startY + (row * pieceHeight) + (pieceHeight / 2);
      
      // Slicing Coordinates (Source Image)
      let texX = map(col, 0, cols, 0, monkeyFaceImg.width);
      let texY = map(row, 0, rows, 0, monkeyFaceImg.height);
      let texW = monkeyFaceImg.width / cols;
      let texH = monkeyFaceImg.height / rows;
      
      // Grab the texture NOW to ensure it exists
      let particleTexture = monkeyFaceImg.get(texX, texY, texW, texH);
      
      let angle = atan2(pY - monkey.currentY, pX - monkey.currentX);
      let speed = random(10, 25);
      
      particles.push({
        x: pX,
        y: pY,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed - random(5, 12),
        size: circleSize,
        texture: particleTexture, // Use the pre-sliced texture
        width: pieceWidth,
        height: pieceHeight,
        alpha: 255,
        rotation: random(TWO_PI),
        rotationSpeed: random(-0.2, 0.2),
        life: 255,
        onGround: false
      });
    }
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    if (!p.onGround) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.8;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      
      if (p.y >= logicHeight - p.size / 2) {
        p.y = logicHeight - p.size / 2;
        p.vy *= -0.4;
        p.vx *= 0.7;
        
        if (abs(p.vy) < 1 && abs(p.vx) < 1) {
          p.onGround = true;
        }
      }
      
      if (p.x < p.size / 2 || p.x > logicWidth - p.size / 2) {
        p.vx *= -0.6;
        p.x = constrain(p.x, p.size / 2, logicWidth - p.size / 2);
      }
    }
    
    if (p.onGround) {
      p.life -= 2;
    } else {
      p.life -= 0.5;
    }
    
    p.alpha = p.life;
    
    if (p.life > 0) {
      push();
      translate(p.x, p.y);
      rotate(p.rotation);
      tint(255, p.alpha);
      
      // Use standard canvas clipping on the sliced texture
      let ctx = drawingContext;
      ctx.save();
      ctx.beginPath();
      // Draw circle path
      ctx.arc(0, 0, p.size / 2, 0, TWO_PI);
      ctx.clip();
      
      // Draw texture centered in the circle
      imageMode(CENTER);
      image(p.texture, 0, 0, p.width, p.height);
      
      ctx.restore();
      pop();
    } else {
      particles.splice(i, 1);
    }
  }
}

function intensifyLines() {
  for (let line of flowingLines) {
    line.speed = line.speed * 1.10;
    line.angle += random(-0.1, 0.1);
    line.thickness = min(line.thickness * 1.10, 12);
  }
}

function handleProximitySound(lx, ly) {
  if (!currentQuote) return;
  
  let distance = dist(lx, ly, currentQuote.x, currentQuote.y);
  
  if (distance < proximityThreshold) {
    let intensity = map(distance, proximityThreshold, 0, 0, 1);
    intensity = constrain(intensity, 0, 1);
    
    baseOsc1.amp(0.11 + intensity * 0.08, 0.1);
    baseOsc2.amp(0.07 + intensity * 0.05, 0.1);
    baseOsc3.amp(0.09 + intensity * 0.06, 0.1);
    baseOsc4.amp(0.06 + intensity * 0.08, 0.1);
    
    let pulseInterval = int(400 - intensity * 350); 
    if (millis() - lastTensionTime > pulseInterval) {
      playTensionPulse(intensity); 
      lastTensionTime = millis();
    }
  } else {
    baseOsc1.amp(0.11, 0.2); 
    baseOsc2.amp(0.07, 0.2); 
    baseOsc3.amp(0.09, 0.2); 
    baseOsc4.amp(0.06, 0.2); 
  }
}

function playTensionPulse(intensity) {
  let tempOsc = new p5.Oscillator('sawtooth');
  tempOsc.freq(midiToFreq(60)); 
  tempOsc.start();
  let pulseVolume = 0.15 + intensity * 0.15; 
  tempOsc.amp(pulseVolume, 0.02); 
  tempOsc.amp(0, 0.15); 
  setTimeout(() => { tempOsc.stop(); }, 200);
}

function playCatchSound() {
  baseOsc1.amp(0.08, 1.5); 
  baseOsc2.amp(0.05, 1.5); 
  baseOsc3.amp(0.07, 1.5); 
  baseOsc4.amp(0.04, 1.5); 
  catchOsc.freq(midiToFreq(55)); 
  catchOsc.amp(0.08, 0.2); 
  catchOsc.amp(0, 1.5); 
}

function playEtherealSound() {
  let midiSequence = [48, 52, 55, 52, 48]; 
  let volumes = [0.10, 0.12, 0.14, 0.12, 0.10]; 
  midiSequence.forEach((note, i) => {
    let osc = new p5.Oscillator('sine');
    osc.freq(midiToFreq(note));
    osc.start();
    setTimeout(() => {
      osc.amp(volumes[i], 0.6); 
      setTimeout(() => {
        osc.amp(0, 1.8); 
        setTimeout(() => osc.stop(), 1800);
      }, 800);
    }, i * 150); 
  });
  setTimeout(() => {
    baseOsc1.amp(0.11, 3); 
    baseOsc2.amp(0.07, 3); 
    baseOsc3.amp(0.09, 3); 
    baseOsc4.amp(0.06, 3); 
  }, 500);
}

function playBurstSound() {
  let noiseOsc = new p5.Oscillator('white');
  noiseOsc.start();
  noiseOsc.amp(0.4, 0.001); 
  noiseOsc.amp(0, 0.3); 
  setTimeout(() => noiseOsc.stop(), 300);
  
  let bassOsc = new p5.Oscillator('sawtooth');
  bassOsc.freq(midiToFreq(24)); 
  bassOsc.start();
  bassOsc.amp(0.45, 0.01); 
  bassOsc.amp(0, 2.5); 
  setTimeout(() => bassOsc.stop(), 2500);
  
  let buildUp = [48, 52, 55, 52, 48]; 
  buildUp.forEach((note, i) => {
    let osc = new p5.Oscillator('sawtooth'); 
    osc.freq(midiToFreq(note));
    osc.start();
    
    setTimeout(() => {
      osc.amp(0.20 + i * 0.05, 0.05); 
      setTimeout(() => {
        osc.amp(0, 0.15);
        setTimeout(() => osc.stop(), 150);
      }, 100);
    }, i * 30); 
  });
  
  setTimeout(() => {
    let explosionChord = [36, 40, 43, 48, 52, 55, 60, 64, 67, 72, 76, 79, 50, 62];
    explosionChord.forEach((note, i) => {
      let osc = new p5.Oscillator('sine');
      osc.freq(midiToFreq(note));
      osc.start();
      let delay = i * 15; 
      setTimeout(() => {
        osc.amp(0.35, 0.01); 
        osc.amp(0, 3.5); 
        setTimeout(() => osc.stop(), 3500);
      }, delay);
    });
  }, 150); 
  
  setTimeout(() => {
    let sparkleNotes = [84, 88, 91, 96]; 
    sparkleNotes.forEach((note, i) => {
      let osc = new p5.Oscillator('sine');
      osc.freq(midiToFreq(note));
      osc.start();
      setTimeout(() => {
        osc.amp(0.25, 0.2); 
        osc.amp(0, 2.0); 
        setTimeout(() => osc.stop(), 2000);
      }, i * 40);
    });
  }, 200);
  
  baseOsc1.amp(0.30, 0.02); 
  baseOsc2.amp(0.25, 0.02);
  baseOsc3.amp(0.28, 0.02);
  baseOsc4.amp(0.20, 0.02);
  
  setTimeout(() => {
    baseOsc1.amp(0.11, 3.5); 
    baseOsc2.amp(0.07, 3.5);
    baseOsc3.amp(0.09, 3.5);
    baseOsc4.amp(0.06, 3.5);
  }, 800);
}

function drawCustomCursor() {
  let m = getLogicalMouse();
  
  push();
  textAlign(CENTER, CENTER);
  textSize(40);
  
  if (isDraggingQuote) {
    let d = dist(m.x, m.y, monkey.currentX, monkey.currentY);
    let isFeeding = d < 225;
    
    if (!isFeeding) {
      text('✋', mouseX, mouseY); 
    }
  } else {
    text('👆', mouseX, mouseY); 
  }
  
  pop();
}

function initializeLines() {
  let lineCount = 150; 
  flowingLines = [];
  
  let minLen = 50;
  let maxLen = 400;
  let thickness = 2;
  
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
  let centerX = logicWidth / 2;
  let centerY = logicHeight / 2;
  
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
    x: quoteDirection === 1 ? -200 : logicWidth + 200,
    y: logicHeight * 0.3 - 160,
    width: quoteImg ? quoteImg.width : 200,
    height: quoteImg ? quoteImg.height : 80,
    offsetX: 0,
    offsetY: 0
  };
}

function drawQuote(q, lx, ly) {
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

function mousePressed() {
  startAudio();
  
  let m = getLogicalMouse();
  
  if (!currentQuote) return;
  
  let d = dist(m.x, m.y, currentQuote.x, currentQuote.y);
  
  if (d < currentQuote.width / 2) {
    isDraggingQuote = true;
    currentQuote.offsetX = currentQuote.x - m.x;
    currentQuote.offsetY = currentQuote.y - m.y;
    
    if (audioStarted) {
      playCatchSound();
    }
  }
}

function mouseDragged() {
  let m = getLogicalMouse();
  if (isDraggingQuote && currentQuote) {
    currentQuote.x = m.x + currentQuote.offsetX;
    currentQuote.y = m.y + currentQuote.offsetY;
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
        
        targetLayer4Scale = max(0, 1.0 - (monkey.validationsReceived * 0.03));
        intensifyLines();
        
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