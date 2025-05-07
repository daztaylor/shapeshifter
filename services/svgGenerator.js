const path = require('path');
const fs = require('fs');

// Load brand configuration
let brandConfig;
try {
  const configPath = process.env.BRAND_CONFIG_PATH || path.join(__dirname, '../config/brandConfig.json');
  brandConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('Error loading brand configuration:', error);
  process.exit(1);
}

/**
 * Generate an SVG based on specified rules
 * @param {Object} rules - Generation rules
 * @returns {string} Generated SVG
 */
function generateSVG(rules) {
  // Apply defaults from brand config
  rules.width = rules.width || brandConfig.defaultDimensions.width;
  rules.height = rules.height || brandConfig.defaultDimensions.height;
  
  // Create SVG header
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rules.width} ${rules.height}" width="${rules.width}" height="${rules.height}">`;
  
  // Add metadata
  svg += `
  <metadata>
    <generator>SVG Generator v1.0</generator>
    <generatedAt>${new Date().toISOString()}</generatedAt>
  </metadata>
  `;
  
  // Apply composition rules
  const compositionHandlers = {
    grid: generateGridPattern,
    radial: generateRadialPattern,
    random: generateRandomPattern,
    wave: generateWavePattern,
    spiral: generateSpiralPattern,
    cluster: generateClusterPattern,
    fractal: generateFractalPattern
  };
  
  const compositionType = rules.composition || 'grid';
  
  if (compositionHandlers[compositionType]) {
    svg += compositionHandlers[compositionType](rules);
  } else {
    // Default to grid if composition not recognized
    svg += generateGridPattern(rules);
  }
  
  // Close SVG tag
  svg += '</svg>';
  
  return svg;
}

/**
 * Generate a grid pattern of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateGridPattern(rules) {
  const rows = rules.rows || 4;
  const cols = rules.cols || 4;
  const cellWidth = rules.width / cols;
  const cellHeight = rules.height / rows;
  const padding = rules.padding || 0.2; // padding as percentage of cell size
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  let result = '';
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate center of cell
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      
      // Skip some cells if sparsity is defined
      if (rules.sparsity && random() < rules.sparsity) {
        continue;
      }
      
      // Select shape type based on distribution or randomly
      let shapeIndex;
      if (rules.shapeDistribution === 'sequence') {
        shapeIndex = (row * cols + col) % rules.shapes.length;
      } else if (rules.shapeDistribution === 'row') {
        shapeIndex = row % rules.shapes.length;
      } else if (rules.shapeDistribution === 'column') {
        shapeIndex = col % rules.shapes.length;
      } else {
        shapeIndex = Math.floor(random() * rules.shapes.length);
      }
      
      const shapeType = rules.shapes[shapeIndex];
      
      // Select color based on distribution or randomly
      let colorIndex;
      if (rules.colorDistribution === 'sequence') {
        colorIndex = (row * cols + col) % rules.colors.length;
      } else if (rules.colorDistribution === 'row') {
        colorIndex = row % rules.colors.length;
      } else if (rules.colorDistribution === 'column') {
        colorIndex = col % rules.colors.length;
      } else {
        colorIndex = Math.floor(random() * rules.colors.length);
      }
      
      const color = rules.colors[colorIndex];
      
      // Determine size
      const maxSize = Math.min(cellWidth, cellHeight) * (1 - padding);
      const minSize = maxSize * 0.4;
      const sizeVariation = rules.sizeVariation !== undefined ? rules.sizeVariation : 0.3;
      const baseSize = (maxSize + minSize) / 2;
      const size = baseSize + (random() - 0.5) * maxSize * sizeVariation;
      
      // Determine rotation if enabled
      const rotation = rules.enableRotation ? 360 * random() : 0;
      
      // Generate shape
      result += generateShape(shapeType, x, y, size, color, random, rotation);
    }
  }
  
  return result;
}

/**
 * Generate a radial pattern of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateRadialPattern(rules) {
  const count = rules.count || 8;
  const centerX = rules.centerX || rules.width / 2;
  const centerY = rules.centerY || rules.height / 2;
  const minRadius = rules.minRadius || 0;
  const maxRadius = rules.maxRadius || Math.min(rules.width, rules.height) * 0.4;
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  let result = '';
  
  // Add center shape if specified
  if (rules.centerShape) {
    const shapeType = rules.centerShape;
    const color = rules.centerColor || rules.colors[0];
    const size = rules.centerSize || maxRadius * 0.3;
    
    result += generateShape(shapeType, centerX, centerY, size, color, random, 0);
  }
  
  for (let i = 0; i < count; i++) {
    // Calculate position on circle
    const angle = rules.startAngle ? rules.startAngle + (2 * Math.PI * i) / count : (2 * Math.PI * i) / count;
    
    // Calculate radius (can be fixed or varied)
    let radius;
    if (rules.radiusDistribution === 'linear') {
      // Linear increase from min to max
      radius = minRadius + (maxRadius - minRadius) * (i / (count - 1));
    } else if (rules.radiusDistribution === 'exponential') {
      // Exponential increase
      const factor = Math.log(maxRadius / minRadius) / (count - 1);
      radius = minRadius * Math.exp(factor * i);
    } else {
      // Fixed or random
      radius = rules.radius || (minRadius + (maxRadius - minRadius) * (rules.randomRadius ? random() : 0.8));
    }
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Select shape type
    let shapeIndex;
    if (rules.shapeDistribution === 'sequence') {
      shapeIndex = i % rules.shapes.length;
    } else {
      shapeIndex = Math.floor(random() * rules.shapes.length);
    }
    
    const shapeType = rules.shapes[shapeIndex];
    
    // Select color
    let colorIndex;
    if (rules.colorDistribution === 'sequence') {
      colorIndex = i % rules.colors.length;
    } else if (rules.colorDistribution === 'radius') {
      // Color based on radius (inner to outer)
      colorIndex = Math.floor((radius - minRadius) / (maxRadius - minRadius) * rules.colors.length);
    } else {
      colorIndex = Math.floor(random() * rules.colors.length);
    }
    
    const color = rules.colors[colorIndex % rules.colors.length];
    
    // Determine size
    const sizeVariation = rules.sizeVariation !== undefined ? rules.sizeVariation : 0.3;
    const baseSize = rules.size || radius * 0.4;
    const minSize = baseSize * (1 - sizeVariation);
    const maxSize = baseSize * (1 + sizeVariation);
    const size = rules.sizeByRadius 
      ? baseSize * (radius / maxRadius) 
      : minSize + random() * (maxSize - minSize);
    
    // Calculate rotation - can be radially aligned, random, or fixed
    let rotation;
    if (rules.rotationType === 'radial') {
      // Point towards or away from center
      rotation = angle * (180 / Math.PI) + (rules.rotationOffset || 0);
    } else if (rules.rotationType === 'tangent') {
      // Tangent to the circle
      rotation = angle * (180 / Math.PI) + 90 + (rules.rotationOffset || 0);
    } else if (rules.rotationType === 'random') {
      rotation = 360 * random();
    } else {
      rotation = rules.rotation || 0;
    }
    
    // Generate shape
    result += generateShape(shapeType, x, y, size, color, random, rotation);
  }
  
  return result;
}

/**
 * Generate a random distribution of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateRandomPattern(rules) {
  const count = rules.count || 20;
  const padding = rules.padding || 50; // Padding from edges
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  let result = '';
  
  // Create collision detection if needed
  const useCollisionDetection = rules.avoidOverlap === true;
  const placedShapes = [];
  
  // Number of placement attempts before giving up on a shape
  const maxAttempts = rules.maxPlacementAttempts || 50;
  
  for (let i = 0; i < count; i++) {
    // Select shape type
    const shapeIndex = Math.floor(random() * rules.shapes.length);
    const shapeType = rules.shapes[shapeIndex];
    
    // Select color
    const colorIndex = Math.floor(random() * rules.colors.length);
    const color = rules.colors[colorIndex];
    
    // Determine size range
    const minSize = rules.minSize || 20;
    const maxSize = rules.maxSize || 80;
    
    // Determine size distribution
    let size;
    if (rules.sizeDistribution === 'uniform') {
      size = minSize + random() * (maxSize - minSize);
    } else if (rules.sizeDistribution === 'normal') {
      // Approximate normal distribution
      const u1 = random();
      const u2 = random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      // Map from standard normal to desired range
      const mean = (maxSize + minSize) / 2;
      const std = (maxSize - minSize) / 6; // 99.7% of values within range
      size = Math.max(minSize, Math.min(maxSize, mean + z * std));
    } else if (rules.sizeDistribution === 'bimodal') {
      // Bimodal: either small or large
      size = random() < 0.5 ? 
        minSize + random() * (maxSize - minSize) * 0.3 : // Small
        maxSize - random() * (maxSize - minSize) * 0.3;  // Large
    } else {
      size = minSize + random() * (maxSize - minSize);
    }
    
    // Random rotation
    const rotation = rules.enableRotation ? 360 * random() : 0;
    
    // Calculate position, with collision detection if enabled
    let x, y;
    let attempts = 0;
    let validPosition = false;
    
    do {
      // Generate random position
      x = padding + random() * (rules.width - 2 * padding);
      y = padding + random() * (rules.height - 2 * padding);
      
      // Check for collisions if needed
      if (!useCollisionDetection) {
        validPosition = true;
      } else {
        validPosition = true;
        
        // Check against all previously placed shapes
        for (const shape of placedShapes) {
          const distance = Math.hypot(x - shape.x, y - shape.y);
          const minDistance = (size / 2) + (shape.size / 2) + (rules.minDistance || 5);
          
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
      }
      
      attempts++;
    } while (!validPosition && attempts < maxAttempts);
    
    // Only add shape if a valid position was found
    if (validPosition) {
      // Store shape for collision detection
      if (useCollisionDetection) {
        placedShapes.push({ x, y, size });
      }
      
      // Generate shape
      result += generateShape(shapeType, x, y, size, color, random, rotation);
    }
  }
  
  return result;
}

/**
 * Generate a wave pattern of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateWavePattern(rules) {
  const count = rules.count || 15;
  const waves = rules.waves || 2;
  const waveHeight = rules.waveHeight || Math.min(rules.height / 4, 100);
  const paddingX = rules.paddingX || 50;
  const centerY = rules.centerY || rules.height / 2;
  const phaseShift = rules.phaseShift || 0;
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  let result = '';
  
  for (let i = 0; i < count; i++) {
    // Calculate position on wave
    const progress = i / (count - 1);
    const x = paddingX + progress * (rules.width - 2 * paddingX);
    
    // Calculate wave offset using sine
    const waveOffset = Math.sin(phaseShift + progress * Math.PI * 2 * waves);
    const y = centerY + waveOffset * waveHeight;
    
    // Select shape type
    let shapeIndex;
    if (rules.shapeDistribution === 'sequence') {
      shapeIndex = i % rules.shapes.length;
    } else if (rules.shapeDistribution === 'wave') {
      // Shape changes with wave height
      shapeIndex = Math.floor((waveOffset + 1) / 2 * rules.shapes.length);
    } else {
      shapeIndex = Math.floor(random() * rules.shapes.length);
    }
    
    const shapeType = rules.shapes[shapeIndex];
    
    // Select color
    let colorIndex;
    if (rules.colorDistribution === 'sequence') {
      colorIndex = i % rules.colors.length;
    } else if (rules.colorDistribution === 'progress') {
      // Color changes along the wave
      colorIndex = Math.floor(progress * rules.colors.length);
    } else if (rules.colorDistribution === 'wave') {
      // Color changes with wave height
      colorIndex = Math.floor((waveOffset + 1) / 2 * rules.colors.length);
    } else {
      colorIndex = Math.floor(random() * rules.colors.length);
    }
    
    const color = rules.colors[colorIndex % rules.colors.length];
    
    // Determine size
    const minSize = rules.minSize || 20;
    const maxSize = rules.maxSize || 60;
    
    let size;
    if (rules.sizeDistribution === 'wave') {
      // Size changes with wave height
      size = minSize + ((waveOffset + 1) / 2) * (maxSize - minSize);
    } else if (rules.sizeDistribution === 'progress') {
      // Size changes along the wave
      size = minSize + progress * (maxSize - minSize);
    } else {
      // Random size
      size = minSize + random() * (maxSize - minSize);
    }
    
    // Determine rotation
    let rotation;
    if (rules.rotationType === 'wave') {
      // Rotate based on wave slope
      const slope = Math.cos(phaseShift + progress * Math.PI * 2 * waves);
      rotation = Math.atan(slope * waveHeight / (rules.width / count)) * (180 / Math.PI);
    } else if (rules.rotationType === 'random') {
      rotation = 360 * random();
    } else {
      rotation = rules.rotation || 0;
    }
    
    // Generate shape
    result += generateShape(shapeType, x, y, size, color, random, rotation);
  }
  
  return result;
}

/**
 * Generate a spiral pattern of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateSpiralPattern(rules) {
  const count = rules.count || 30;
  const centerX = rules.centerX || rules.width / 2;
  const centerY = rules.centerY || rules.height / 2;
  const startRadius = rules.startRadius || 20;
  const spacing = rules.spacing || 15;
  const rotation = rules.rotation || 0; // rotation of entire spiral
  const turns = rules.turns || 3; // number of complete rotations
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  let result = '';
  
  for (let i = 0; i < count; i++) {
    // Calculate spiral position
    const progress = i / count; // 0 to 1
    const angle = 2 * Math.PI * turns * progress + (rotation * Math.PI / 180);
    const radius = startRadius + spacing * angle / (2 * Math.PI);
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Select shape type
    let shapeIndex;
    if (rules.shapeDistribution === 'sequence') {
      shapeIndex = i % rules.shapes.length;
    } else if (rules.shapeDistribution === 'radius') {
      shapeIndex = Math.floor(progress * rules.shapes.length);
    } else {
      shapeIndex = Math.floor(random() * rules.shapes.length);
    }
    
    const shapeType = rules.shapes[shapeIndex];
    
    // Select color
    let colorIndex;
    if (rules.colorDistribution === 'sequence') {
      colorIndex = i % rules.colors.length;
    } else if (rules.colorDistribution === 'radius') {
      colorIndex = Math.floor(progress * rules.colors.length);
    } else {
      colorIndex = Math.floor(random() * rules.colors.length);
    }
    
    const color = rules.colors[colorIndex % rules.colors.length];
    
    // Determine size
    const minSize = rules.minSize || 10;
    const maxSize = rules.maxSize || 40;
    
    let size;
    if (rules.sizeDistribution === 'decreasing') {
      // Size decreases from center outward
      size = maxSize - progress * (maxSize - minSize);
    } else if (rules.sizeDistribution === 'increasing') {
      // Size increases from center outward
      size = minSize + progress * (maxSize - minSize);
    } else {
      // Random size
      size = minSize + random() * (maxSize - minSize);
    }
    
    // Determine rotation
    let shapeRotation;
    if (rules.rotationType === 'spiral') {
      // Orient along the spiral
      shapeRotation = angle * (180 / Math.PI) + (rules.rotationOffset || 0);
    } else if (rules.rotationType === 'random') {
      shapeRotation = 360 * random();
    } else {
      shapeRotation = rules.shapeRotation || 0;
    }
    
    // Generate shape
    result += generateShape(shapeType, x, y, size, color, random, shapeRotation);
  }
  
  return result;
}

/**
 * Generate a cluster pattern of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateClusterPattern(rules) {
  const clusterCount = rules.clusterCount || 3;
  const shapesPerCluster = rules.shapesPerCluster || 10;
  const clusterRadius = rules.clusterRadius || 100;
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  let result = '';
  
  // Generate cluster centers
  const clusters = [];
  for (let i = 0; i < clusterCount; i++) {
    // Generate cluster position with padding from edges
    const padding = clusterRadius;
    const x = padding + random() * (rules.width - 2 * padding);
    const y = padding + random() * (rules.height - 2 * padding);
    
    clusters.push({
      x,
      y,
      // Assign a dominant shape and color to each cluster if specified
      dominantShape: rules.clusterShapes ? rules.shapes[i % rules.shapes.length] : null,
      dominantColor: rules.clusterColors ? rules.colors[i % rules.colors.length] : null
    });
  }
  
  // Generate shapes for each cluster
  for (let c = 0; c < clusters.length; c++) {
    const cluster = clusters[c];
    
    for (let i = 0; i < shapesPerCluster; i++) {
      // Determine shape position within cluster
      const distance = random() * clusterRadius;
      const angle = random() * 2 * Math.PI;
      
      const x = cluster.x + distance * Math.cos(angle);
      const y = cluster.y + distance * Math.sin(angle);
      
      // Select shape type
      let shapeType;
      if (rules.clusterShapes) {
        // Use dominant shape for this cluster with occasional variation
        shapeType = random() < 0.8 ? 
          cluster.dominantShape : 
          rules.shapes[Math.floor(random() * rules.shapes.length)];
      } else {
        shapeType = rules.shapes[Math.floor(random() * rules.shapes.length)];
      }
      
      // Select color
      let color;
      if (rules.clusterColors) {
        // Use dominant color for this cluster with occasional variation
        color = random() < 0.8 ? 
          cluster.dominantColor : 
          rules.colors[Math.floor(random() * rules.colors.length)];
      } else {
        color = rules.colors[Math.floor(random() * rules.colors.length)];
      }
      
      // Determine size
      const minSize = rules.minSize || 10;
      const maxSize = rules.maxSize || 50;
      
      let size;
      if (rules.sizeDistribution === 'distance') {
        // Size based on distance from cluster center
        size = maxSize - (distance / clusterRadius) * (maxSize - minSize);
      } else {
        // Random size
        size = minSize + random() * (maxSize - minSize);
      }
      
      // Random rotation
      const rotation = rules.enableRotation ? 360 * random() : 0;
      
      // Generate shape
      result += generateShape(shapeType, x, y, size, color, random, rotation);
    }
  }
  
  return result;
}

/**
 * Generate a fractal-like pattern of shapes
 * @param {Object} rules - Generation rules
 * @returns {string} SVG elements
 */
function generateFractalPattern(rules) {
  const centerX = rules.centerX || rules.width / 2;
  const centerY = rules.centerY || rules.height / 2;
  const maxDepth = rules.maxDepth || 4;
  const initialSize = rules.initialSize || Math.min(rules.width, rules.height) * 0.4;
  const scaleFactor = rules.scaleFactor || 0.5;
  
  // Pseudo-random number generator based on seed
  const random = createSeededRandom(rules.seed || Math.floor(Math.random() * 10000));
  
  // Recursive function to generate fractal
  function generateFractalRecursive(x, y, size, depth) {
    if (depth > maxDepth) return '';
    
    let result = '';
    
    // Select shape type for this level
    let shapeIndex;
    if (rules.depthShapes) {
      // Different shape for each depth level
      shapeIndex = depth % rules.shapes.length;
    } else {
      shapeIndex = Math.floor(random() * rules.shapes.length);
    }
    
    const shapeType = rules.shapes[shapeIndex];
    
    // Select color for this level
    let colorIndex;
    if (rules.depthColors) {
      // Different color for each depth level
      colorIndex = depth % rules.colors.length;
    } else {
      colorIndex = Math.floor(random() * rules.colors.length);
    }
    
    const color = rules.colors[colorIndex];
    
    // Generate the shape at current position
    result += generateShape(shapeType, x, y, size, color, random, 0);
    
    // Number of children
    const childCount = rules.childCount || (depth === 0 ? 5 : 3);
    
    // Generate children
    for (let i = 0; i < childCount; i++) {
      const angle = (2 * Math.PI * i) / childCount;
      const distance = size * (rules.distanceFactor || 0.8);
      
      const childX = x + distance * Math.cos(angle);
      const childY = y + distance * Math.sin(angle);
      const childSize = size * scaleFactor;
      
      // Recursively generate child pattern
      result += generateFractalRecursive(childX, childY, childSize, depth + 1);
    }
    
    return result;
  }
  
  return generateFractalRecursive(centerX, centerY, initialSize, 0);
}

/**
 * Generate a single shape
 * @param {string} type - Shape type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Shape size
 * @param {string} color - Shape color
 * @param {Function} random - Seeded random function
 * @param {number} rotation - Rotation angle in degrees
 * @returns {string} SVG element
 */
function generateShape(type, x, y, size, color, random, rotation = 0) {
  let shape = '';
  
  // Apply rotation if specified
  const rotationAttr = rotation ? ` transform="rotate(${rotation}, ${x}, ${y})"` : '';
  
  // Generate shape based on type
  switch (type) {
    case 'circle':
      shape = `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'rect':
      shape = `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'triangle':
      const h = size * Math.sqrt(3) / 2;
      shape = `<polygon points="${x},${y - h/2} ${x - size/2},${y + h/2} ${x + size/2},${y + h/2}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'hexagon':
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size/2 * Math.cos(angle);
        const py = y + size/2 * Math.sin(angle);
        points.push(`${px},${py}`);
      }
      shape = `<polygon points="${points.join(' ')}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'star':
      const starPoints = [];
      const outerRadius = size / 2;
      const innerRadius = size / 5;
      
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / 5) * i;
        const px = x + radius * Math.cos(angle - Math.PI/2);
        const py = y + radius * Math.sin(angle - Math.PI/2);
        starPoints.push(`${px},${py}`);
      }
      
      shape = `<polygon points="${starPoints.join(' ')}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'diamond':
      shape = `<polygon points="${x},${y-size/2} ${x+size/2},${y} ${x},${y+size/2} ${x-size/2},${y}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'pentagon':
      const pentPoints = [];
      for (let i = 0; i < 5; i++) {
        const angle = (2 * Math.PI / 5) * i - Math.PI/2;
        const px = x + size/2 * Math.cos(angle);
        const py = y + size/2 * Math.sin(angle);
        pentPoints.push(`${px},${py}`);
      }
      shape = `<polygon points="${pentPoints.join(' ')}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'roundedRect':
      const radius = size / 5;
      shape = `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'ellipse':
      shape = `<ellipse cx="${x}" cy="${y}" rx="${size/2}" ry="${size/3}" fill="${color}"${rotationAttr} />`;
      break;
      
    case 'crescent':
      shape = `
        <g${rotationAttr}>
          <circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" />
          <circle cx="${x + size/4}" cy="${y}" r="${size/2}" fill="white" />
        </g>
      `;
      break;
      
    case 'cross':
      const width = size / 4;
      shape = `
        <g${rotationAttr}>
          <rect x="${x - width/2}" y="${y - size/2}" width="${width}" height="${size}" fill="${color}" />
          <rect x="${x - size/2}" y="${y - width/2}" width="${size}" height="${width}" fill="${color}" />
        </g>
      `;
      break;
      
    case 'arrow':
      const arrowWidth = size / 3;
      const arrowHeight = size / 2;
      const shaftWidth = size / 6;
      shape = `
        <g${rotationAttr}>
          <polygon points="${x},${y-arrowHeight/2} ${x+arrowWidth/2},${y-arrowHeight/2+arrowWidth/2} ${x+shaftWidth/2},${y-arrowHeight/2+arrowWidth/2} ${x+shaftWidth/2},${y+arrowHeight/2} ${x-shaftWidth/2},${y+arrowHeight/2} ${x-shaftWidth/2},${y-arrowHeight/2+arrowWidth/2} ${x-arrowWidth/2},${y-arrowHeight/2+arrowWidth/2}" fill="${color}" />
        </g>
      `;
      break;
      
    case 'heart':
      // Heart shape using paths
      const heartScale = size / 30;
      shape = `
        <g${rotationAttr}>
          <path d="M ${x} ${y + 10 * heartScale} C ${x} ${y + 7 * heartScale}, ${x - 15 * heartScale} ${y - 13 * heartScale}, ${x} ${y - 5 * heartScale} C ${x + 15 * heartScale} ${y - 13 * heartScale}, ${x} ${y + 7 * heartScale}, ${x} ${y + 10 * heartScale} Z" fill="${color}" />
        </g>
      `;
      break;
      
    case 'cloud':
      // Cloud shape using multiple circles
      shape = `
        <g${rotationAttr}>
          <circle cx="${x - size/4}" cy="${y}" r="${size/4}" fill="${color}" />
          <circle cx="${x}" cy="${y - size/6}" r="${size/4}" fill="${color}" />
          <circle cx="${x + size/4}" cy="${y}" r="${size/4}" fill="${color}" />
          <circle cx="${x}" cy="${y + size/6}" r="${size/4}" fill="${color}" />
        </g>
      `;
      break;
      
    case 'donut':
      // Donut (ring) shape using two circles
      const outerR = size / 2;
      const innerR = size / 4;
      shape = `
        <g${rotationAttr}>
          <circle cx="${x}" cy="${y}" r="${outerR}" fill="${color}" />
          <circle cx="${x}" cy="${y}" r="${innerR}" fill="white" />
        </g>
      `;
      break;
      
    default:
      // Default to circle if shape type not recognized
      shape = `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}"${rotationAttr} />`;
  }
  
  return shape;
}








/**
 * Apply variations to rules
 * @param {Object} baseRules - Base rules
 * @param {Object} variations - Variation parameters
 * @returns {Object} Modified rules
 */
function applyVariations(baseRules, variations) {
  const rules = { ...baseRules };
  
  // Apply numeric variations
  for (const key in variations) {
    if (typeof variations[key] === 'object' && variations[key] !== null) {
      const variation = variations[key];
      
      if (typeof baseRules[key] === 'number' && variation.type) {
        const value = baseRules[key];
        
        switch (variation.type) {
          case 'range':
            // Random value within a range around the base value
            const range = variation.value || 0.2; // Default 20% variation
            const min = value * (1 - range);
            const max = value * (1 + range);
            rules[key] = min + Math.random() * (max - min);
            break;
            
          case 'increment':
            // Increment/decrement by a fixed amount
            rules[key] = value + variation.value;
            break;
            
          case 'factor':
            // Multiply by a factor
            rules[key] = value * variation.value;
            break;
        }
      }
    }
  }
  
  // Apply array variations (e.g., add/remove colors or shapes)
  if (variations.addShapes && baseRules.shapes) {
    rules.shapes = [...baseRules.shapes, ...variations.addShapes];
  }
  
  if (variations.removeShapes && baseRules.shapes) {
    rules.shapes = baseRules.shapes.filter(shape => !variations.removeShapes.includes(shape));
  }
  
  if (variations.addColors && baseRules.colors) {
    rules.shapes = [...baseRules.colors, ...variations.addColors];
  }
  
  if (variations.removeColors && baseRules.colors) {
    rules.colors = baseRules.colors.filter(color => !variations.removeColors.includes(color));
  }
  
  // Apply composition changes
  if (variations.composition) {
    rules.composition = variations.composition;
  }
  
  return rules;
}

/**
 * Create a seeded random number generator
 * @param {number} seed - Random seed
 * @returns {Function} Random number generator
 */
function createSeededRandom(seed) {
  return function() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

module.exports = {
  generateSVG,
  applyVariations
};
