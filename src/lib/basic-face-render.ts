/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Persona } from './types';

type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
  persona?: 'Agent Zero' | 'Agent Zara';
};

// Helper to constrain a value
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale, // Controls eyelid openness (0 = closed, 1 = open)
    mouthScale, // Controls mouth openness (0 = closed, 1 = open)
    color, // Iris color
    persona,
  } = props;
  const { width, height } = ctx.canvas;
  const isGwani = persona === 'Agent Zero';

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // --- Head (More organic shape) ---
  const headPadding = width / 20;
  const headRadiusX = (width / 2) - headPadding;
  const headRadiusY = (height / 2) - headPadding;
  const headCenterX = width / 2;
  const headCenterY = height / 2;
  
  // Create realistic skin tone gradient with subtle lighting
  const headGradient = ctx.createRadialGradient(
    headCenterX - headRadiusX * 0.2, 
    headCenterY - headRadiusY * 0.3, 
    0, 
    headCenterX, 
    headCenterY, 
    headRadiusX * 1.5
  );
  headGradient.addColorStop(0, '#f5d5c0'); // Highlight
  headGradient.addColorStop(0.5, '#e8b89a'); // Mid-tone
  headGradient.addColorStop(1, '#c89570'); // Shadow

  // Draw head with natural proportions
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.ellipse(headCenterX, headCenterY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add subtle cheek highlights
  ctx.fillStyle = 'rgba(255, 200, 180, 0.3)';
  ctx.beginPath();
  ctx.ellipse(headCenterX - headRadiusX * 0.4, headCenterY + headRadiusY * 0.15, headRadiusX * 0.15, headRadiusY * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(headCenterX + headRadiusX * 0.4, headCenterY + headRadiusY * 0.15, headRadiusX * 0.15, headRadiusY * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Eyes (More detailed and realistic) ---
  const eyeOffsetY = height * -0.12;
  const eyeOffsetX = width * 0.2;
  const eyeRadiusXBase = width * 0.07;
  const eyeRadiusYBase = width * 0.04;
  const irisRadius = eyeRadiusXBase * 0.55;
  const pupilRadius = irisRadius * 0.4;

  const drawEye = (centerX: number, centerY: number, isLeft: boolean, isGwani: boolean) => {
    ctx.save();
    
    // Agent Zero has wider, slightly narrower eyes. Agent Zara has rounder eyes.
    const eyeRadiusX = isGwani ? eyeRadiusXBase * 1.1 : eyeRadiusXBase;
    const eyeRadiusY = isGwani ? eyeRadiusYBase * 0.9 : eyeRadiusYBase;
    
    // Eye socket shadow for depth
    ctx.fillStyle = 'rgba(180, 140, 110, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - eyeRadiusY * 0.2, eyeRadiusX * 1.3, eyeRadiusY * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Sclera (white part) with slight off-white
    ctx.fillStyle = '#faf8f5';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle vein texture
    ctx.strokeStyle = 'rgba(255, 200, 200, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX - eyeRadiusX * 0.6, centerY);
    ctx.lineTo(centerX - eyeRadiusX * 0.3, centerY - eyeRadiusY * 0.3);
    ctx.stroke();

    // Iris with gradient
    const irisGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, irisRadius
    );
    const irisColor = color || '#4a90e2';
    irisGradient.addColorStop(0, irisColor);
    irisGradient.addColorStop(0.6, irisColor);
    irisGradient.addColorStop(1, '#2c5f8f');
    
    ctx.fillStyle = irisGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Iris texture lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * pupilRadius * 1.2,
        centerY + Math.sin(angle) * pupilRadius * 1.2
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * irisRadius * 0.9,
        centerY + Math.sin(angle) * irisRadius * 0.9
      );
      ctx.stroke();
    }

    // Pupil with soft edge
    const pupilJiggleX = (mouthScale > 0.1) ? (Math.random() - 0.5) * 0.5 : 0;
    const pupilJiggleY = (mouthScale > 0.1) ? (Math.random() - 0.5) * 0.5 : 0;

    const pupilGradient = ctx.createRadialGradient(
      centerX + pupilJiggleX, centerY + pupilJiggleY, 0,
      centerX + pupilJiggleX, centerY + pupilJiggleY, pupilRadius
    );
    pupilGradient.addColorStop(0, '#000');
    pupilGradient.addColorStop(0.8, '#000');
    pupilGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = pupilGradient;
    ctx.beginPath();
    ctx.arc(centerX + pupilJiggleX, centerY + pupilJiggleY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Multiple specular highlights for realism
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(centerX + pupilJiggleX - pupilRadius * 0.3, centerY + pupilJiggleY - pupilRadius * 0.4, pupilRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX + pupilJiggleX + pupilRadius * 0.5, centerY + pupilJiggleY + pupilRadius * 0.3, pupilRadius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyelid with realistic skin fold
    const closedness = 1 - clamp(eyeScale, 0, 1);
    // Eyelid stays at top and extends downward slightly for blinking
    const lidTopY = centerY - eyeRadiusY * 1.3; // Fixed top position - much higher
    const lidBottomY = lidTopY + eyeRadiusY * 0.15 + (closedness * eyeRadiusY * 0.8); // Tiny by default, small blink movement
    
    const skinGradient = ctx.createLinearGradient(centerX, lidTopY, centerX, lidBottomY);
    skinGradient.addColorStop(0, '#e8b89a');
    skinGradient.addColorStop(1, '#d9a884');
    
    // Define the curve for the bottom of the eyelid based on eye openness
    const eyelidCurveControlY = lidBottomY - (eyeRadiusY * 0.7 * eyeScale);
    
    // Upper eyelid - stays at top, extends down slightly for blinking
    ctx.fillStyle = skinGradient;
    ctx.beginPath();
    // Top edge stays fixed
    ctx.moveTo(centerX - eyeRadiusX * 1.15, lidTopY);
    ctx.quadraticCurveTo(centerX, lidTopY - eyeRadiusY * 0.3, centerX + eyeRadiusX * 1.15, lidTopY);
    // Bottom edge extends down slightly and curves
    ctx.lineTo(centerX + eyeRadiusX * 1.15, lidBottomY);
    ctx.quadraticCurveTo(centerX, eyelidCurveControlY, centerX - eyeRadiusX * 1.15, lidBottomY);
    ctx.closePath();
    ctx.fill();
    
    // Eyelid crease
    ctx.strokeStyle = 'rgba(120, 80, 60, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - eyeRadiusX * 1.0, lidTopY - eyeRadiusY * 0.4);
    ctx.quadraticCurveTo(centerX, lidTopY - eyeRadiusY * 0.6, centerX + eyeRadiusX * 1.0, lidTopY - eyeRadiusY * 0.4);
    ctx.stroke();
    
    // Eyelashes
    ctx.strokeStyle = 'rgba(60, 40, 30, 0.9)';
    ctx.lineWidth = isGwani ? 1.2 : 1.5; // Agent Zero has slightly thinner lashes
    ctx.lineCap = 'round';
    const lashCount = isGwani ? 10 : 12;
    const lashSpan = eyeRadiusX * 2.2; // Reduced span to keep inside socket

    const curveStartX = centerX - lashSpan / 2;
    const curveEndX = centerX + lashSpan / 2;
    const curveControlX = centerX;
    
    for (let i = 0; i < lashCount; i++) {
      const t = i / (lashCount - 1);

      const startX = Math.pow(1 - t, 2) * curveStartX + 2 * (1 - t) * t * curveControlX + Math.pow(t, 2) * curveEndX;
      const startY = Math.pow(1 - t, 2) * lidBottomY + 2 * (1 - t) * t * eyelidCurveControlY + Math.pow(t, 2) * lidBottomY;
      
      const lashLength = eyeRadiusY * (isGwani ? 0.4 : 0.5); 

      // This function creates the fanned-out shape but pulls the ends back in
      const baseAngle = (t - 0.5) * 2.8;
      const curveBack = -Math.pow((t - 0.5) * 2, 5) * 0.8;
      const angleFactor = baseAngle + curveBack;
      
      const lengthFactor = 1.0 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.6;
      
      const edgeFactor = Math.abs(t - 0.5) * 2; // 0 at center, 1 at edges
      const verticalAngleFactor = 1 - (edgeFactor * 2.0); // 1 (up) at center, -> -1 (down) at edges

      const endX = startX + angleFactor * lashLength;
      const endY = startY - (lashLength * lengthFactor * verticalAngleFactor);

      const cpX = startX + (endX - startX) * 0.4;
      const cpY = startY + (lashLength * lengthFactor * 0.8);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const leftEyeX = headCenterX - eyeOffsetX;
  const rightEyeX = headCenterX + eyeOffsetX;
  const eyeY = headCenterY + eyeOffsetY;

  drawEye(leftEyeX, eyeY, true, isGwani);
  drawEye(rightEyeX, eyeY, false, isGwani);

  // --- Eyebrows (More natural and expressive) ---
  const eyebrowOffsetY = eyeRadiusYBase * 2.5;
  const eyebrowHeight = eyeRadiusYBase * 0.5;
  
  const drawEyebrow = (centerX: number, isLeft: boolean, isGwani: boolean) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(80, 60, 50, 0.9)';
    ctx.lineCap = 'round';

    const sign = isLeft ? -1 : 1;
    
    const eyebrowWidth = eyeRadiusXBase * (isGwani ? 2.0 : 1.6); // Agent Zero's eyebrows are longer

    // P0 is the inner point (near nose), P2 is the outer tail
    // Agent Zero has a flatter arch
    // Eyebrows are brought inward and closer together, not stretched out to the sides.
    const P0 = { x: centerX - (eyebrowWidth * 0.6 * sign), y: eyeY - eyebrowOffsetY };
    const P1 = { x: centerX - (eyebrowWidth * 0.1 * sign), y: eyeY - eyebrowOffsetY - eyebrowHeight * (isGwani ? 0.4 : 1.0) - (mouthScale * eyebrowHeight * 0.3) };
    const P2 = { x: centerX + (eyebrowWidth * 0.4 * sign), y: eyeY - eyebrowOffsetY + eyebrowHeight * 0.2 };
    
    const hairCount = isGwani ? 30 : 25; // Agent Zero's eyebrows are fuller
    const hairLength = eyebrowHeight * 1.8;

    // A simple pseudo-random generator to create natural variation without flickering
    const pseudoRandom = (seed: number) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 0; i < hairCount; i++) {
        const t = i / (hairCount - 1);
        
        let midX = Math.pow(1 - t, 2) * P0.x + 2 * (1 - t) * t * P1.x + Math.pow(t, 2) * P2.x;
        let midY = Math.pow(1 - t, 2) * P0.y + 2 * (1 - t) * t * P1.y + Math.pow(t, 2) * P2.y;
        
        // For the first 25% of the eyebrow, add vertical randomness to the hair roots to create a softer, less sharp start.
        if (t < 0.25) {
            const roundnessFactor = (1 - (t / 0.25)); // This creates a curve, fading from 1 to 0.
        }

        // Make the inner hairs more vertical, and outer hairs more horizontal.
        const angle = (Math.PI / 2.1) - (t * Math.PI / 2.8);
        
        // Use a deterministic pseudo-random value based on hair index 'i' to prevent flickering
        const hairRand = pseudoRandom(i);
        const currentHairLength = hairLength * (1 - t * 0.5) * (0.8 + hairRand * 0.4);
        
        const endHairX = midX + Math.cos(angle) * currentHairLength * (isLeft ? -1 : 1);
        const endHairY = midY - Math.sin(angle) * currentHairLength;

        ctx.lineWidth = Math.max(0.5, (1 + pseudoRandom(i + 100) * (isGwani ? 1.5 : 1.2)) * (1 - t * 0.7));
        ctx.globalAlpha = Math.max(0.1, (0.4 + pseudoRandom(i + 200) * 0.2) * (1 - t * 0.5));
        
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(endHairX, endHairY);
        ctx.stroke();
    }
    ctx.restore();
  };

  drawEyebrow(leftEyeX, true, isGwani);
  drawEyebrow(rightEyeX, false, isGwani);


  // --- Nose (More detailed and realistic) ---
  const noseY = headCenterY + height * 0.05;
  const noseWidth = width * (isGwani ? 0.06 : 0.055); // Slightly wider nose for Agent Zero
  
  // Nose bridge shadow
  ctx.strokeStyle = 'rgba(180, 140, 110, 0.4)';
  ctx.lineWidth = width * (isGwani ? 0.022 : 0.018); // Wider bridge for Agent Zero
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headCenterX, eyeY + eyeRadiusYBase * 2);
  ctx.lineTo(headCenterX, noseY + height * 0.02);
  ctx.stroke();
  
  // Nose tip highlight
  ctx.fillStyle = 'rgba(255, 245, 235, 0.4)';
  ctx.beginPath();
  // Flatter, wider tip for Agent Zero
  ctx.ellipse(headCenterX, noseY + height * 0.025, noseWidth * (isGwani ? 0.45 : 0.4), noseWidth * (isGwani ? 0.28 : 0.3), 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Nostrils
  ctx.fillStyle = 'rgba(120, 80, 60, 0.6)';
  ctx.beginPath();
  ctx.ellipse(headCenterX - noseWidth * 0.6, noseY + height * 0.035, noseWidth * 0.25, noseWidth * 0.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(headCenterX + noseWidth * 0.6, noseY + height * 0.035, noseWidth * 0.25, noseWidth * 0.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Mouth (Revised for better animation and appearance) ---
  const mouthY = headCenterY + height * 0.22;
  const mouthWidth = width * 0.28;
  const lipAnimationFactor = clamp(mouthScale, 0, 1.5);
  
  const lipSeparation = height * 0.06 * lipAnimationFactor; 
  const smileFactor = height * 0.01;

  const lipGradient = ctx.createLinearGradient(headCenterX, mouthY - 15, headCenterX, mouthY + 15);
  if (isGwani) {
    // Lighter, less saturated, more natural tones for Agent Zero
    lipGradient.addColorStop(0, '#e0bba8');
    lipGradient.addColorStop(0.5, '#c89f8d');
    lipGradient.addColorStop(1, '#b08a7f');
  } else {
    // Original Agent Zara colors
    lipGradient.addColorStop(0, '#e58c7c');
    lipGradient.addColorStop(0.5, '#c9655d');
    lipGradient.addColorStop(1, '#a14e4e');
  }

  // Mouth Cavity
  if (lipSeparation > 1) {
    const mouthCavityPath = new Path2D();
    mouthCavityPath.moveTo(headCenterX - mouthWidth / 2, mouthY);
    mouthCavityPath.bezierCurveTo(
      headCenterX - mouthWidth / 4, mouthY - lipSeparation / 2,
      headCenterX + mouthWidth / 4, mouthY - lipSeparation / 2,
      headCenterX + mouthWidth / 2, mouthY
    );
    mouthCavityPath.bezierCurveTo(
      headCenterX + mouthWidth / 4, mouthY + lipSeparation / 2,
      headCenterX - mouthWidth / 4, mouthY + lipSeparation / 2,
      headCenterX - mouthWidth / 2, mouthY
    );
    mouthCavityPath.closePath();
    
    const cavityGradient = ctx.createRadialGradient(headCenterX, mouthY, 0, headCenterX, mouthY, lipSeparation);
    cavityGradient.addColorStop(0, '#5a2020');
    cavityGradient.addColorStop(1, '#2a0808');
    ctx.fillStyle = cavityGradient;
    ctx.fill(mouthCavityPath);

    ctx.save();
    ctx.clip(mouthCavityPath);

    // Tongue
    const tongueHeight = lipSeparation * 0.9;
    const tongueY = mouthY + lipSeparation / 2 - tongueHeight * 0.4;
    const tongueWidth = mouthWidth * 0.7;
    const tongueGradient = ctx.createLinearGradient(headCenterX, tongueY - tongueHeight/2, headCenterX, tongueY + tongueHeight/2);
    tongueGradient.addColorStop(0, '#d88c9a');
    tongueGradient.addColorStop(1, '#c75d6a');
    ctx.fillStyle = tongueGradient;
    ctx.beginPath();
    ctx.ellipse(headCenterX, tongueY, tongueWidth / 2, tongueHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headCenterX, tongueY - tongueHeight * 0.4);
    ctx.lineTo(headCenterX, tongueY + tongueHeight * 0.4);
    ctx.stroke();

    // Gums
    ctx.fillStyle = '#d16d6d';
    const gumHeight = Math.max(1.5, lipSeparation * 0.1);
    ctx.fillRect(headCenterX - mouthWidth / 2, mouthY - lipSeparation / 2, mouthWidth, gumHeight);
    if (lipSeparation > 10) {
        ctx.fillRect(headCenterX - mouthWidth / 2, mouthY + lipSeparation / 2 - gumHeight, mouthWidth, gumHeight);
    }
    
    // Teeth
    const teethHeight = height * 0.025;
    const teethWidth = mouthWidth * 0.9;
    const teethGradient = ctx.createLinearGradient(0, mouthY - teethHeight, 0, mouthY + teethHeight);
    teethGradient.addColorStop(0, '#ffffff');
    teethGradient.addColorStop(0.5, '#f5f0e1');
    teethGradient.addColorStop(1, '#f0e8d8');
    ctx.fillStyle = teethGradient;
    ctx.strokeStyle = 'rgba(150, 100, 100, 0.15)';
    ctx.lineWidth = 1;

    const upperTeethY = mouthY - lipSeparation / 2 + gumHeight;
    ctx.fillRect(headCenterX - teethWidth / 2, upperTeethY, teethWidth, teethHeight);
    const lowerTeethY = mouthY + lipSeparation / 2 - gumHeight - teethHeight;
    ctx.fillRect(headCenterX - teethWidth / 2, lowerTeethY, teethWidth, teethHeight);
    
    const numTeeth = isGwani ? 7 : 8; // Agent Zero has slightly wider-appearing teeth
    ctx.lineWidth = isGwani ? 1.2 : 1; // Agent Zero has slightly more defined teeth lines

    const toothWidth = teethWidth / numTeeth;
    for (let i = 1; i < numTeeth; i++) {
        const lineX = headCenterX - teethWidth / 2 + i * toothWidth;
        ctx.beginPath();
        ctx.moveTo(lineX, upperTeethY);
        ctx.lineTo(lineX, upperTeethY + teethHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lineX, lowerTeethY);
        ctx.lineTo(lineX, lowerTeethY + teethHeight);
        ctx.stroke();
    }
    ctx.restore();
  }

  ctx.fillStyle = lipGradient;
  ctx.strokeStyle = 'rgba(140, 70, 60, 0.5)';
  ctx.lineWidth = 1.2;

  // Upper Lip
  const upperLipCurve1 = isGwani ? 1.5 : 2.5;
  const upperLipCurve2 = isGwani ? 2.0 : 3.5;
  const upperLipCurve3 = isGwani ? 1.8 : 3.0;
  ctx.beginPath();
  ctx.moveTo(headCenterX - mouthWidth / 2, mouthY);
  ctx.bezierCurveTo(
    headCenterX - mouthWidth / 3, mouthY - smileFactor * (upperLipCurve1 + lipAnimationFactor * 1.5),
    headCenterX - mouthWidth / 6, mouthY - smileFactor * (upperLipCurve2 + lipAnimationFactor * 2.0),
    headCenterX, mouthY - smileFactor * (upperLipCurve3 + lipAnimationFactor * 2.0)
  );
  ctx.bezierCurveTo(
    headCenterX + mouthWidth / 6, mouthY - smileFactor * (upperLipCurve2 + lipAnimationFactor * 2.0),
    headCenterX + mouthWidth / 3, mouthY - smileFactor * (upperLipCurve1 + lipAnimationFactor * 1.5),
    headCenterX + mouthWidth / 2, mouthY
  );
  ctx.bezierCurveTo(
    headCenterX + mouthWidth / 4, mouthY - lipSeparation / 2,
    headCenterX - mouthWidth / 4, mouthY - lipSeparation / 2,
    headCenterX - mouthWidth / 2, mouthY
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower Lip
  const lowerLipCurve = isGwani ? 2.5 : 4.0;
  ctx.beginPath();
  ctx.moveTo(headCenterX - mouthWidth / 2, mouthY);
  ctx.bezierCurveTo(
    headCenterX - mouthWidth / 3, mouthY + smileFactor * (lowerLipCurve + lipAnimationFactor * 2.5),
    headCenterX + mouthWidth / 3, mouthY + smileFactor * (lowerLipCurve + lipAnimationFactor * 2.5),
    headCenterX + mouthWidth / 2, mouthY
  );
  ctx.bezierCurveTo(
    headCenterX + mouthWidth / 4, mouthY + lipSeparation / 2,
    headCenterX - mouthWidth / 4, mouthY + lipSeparation / 2,
    headCenterX - mouthWidth / 2, mouthY
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}