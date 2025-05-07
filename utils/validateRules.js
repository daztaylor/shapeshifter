const fs = require('fs');
const path = require('path');

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
 * Validate rules against brand guidelines
 * @param {Object} rules - Input rules
 * @returns {Object} Validated rules
 */
function validateRules(rules) {
  const validatedRules = { ...rules };
  
  // Validate dimensions
  validatedRules.width = rules.width || brandConfig.defaultDimensions.width;
  validatedRules.height = rules.height || brandConfig.defaultDimensions.height;
  
  // Validate composition
  const validLayouts = brandConfig.layouts.map(layout => layout.name);
  if (!validLayouts.includes(validatedRules.composition)) {
    validatedRules.composition = validLayouts[0]; // Default to first layout
  }
  
  // Validate shapes
  const validShapes = brandConfig.shapes.map(shape => shape.name);
  
  if (Array.isArray(validatedRules.shapes)) {
    validatedRules.shapes = validatedRules.shapes.filter(shape => 
      validShapes.includes(shape)
    );
    
    // If no valid shapes remain, use default shapes
    if (validatedRules.shapes.length === 0) {
      validatedRules.shapes = [validShapes[0], validShapes[1]]; // First two shapes
    }
  } else {
    // Default to all shapes if none provided
    validatedRules.shapes = validShapes;
  }
  
  // Validate colors
  const validColors = brandConfig.colors.map(color => color.value);
  
  if (Array.isArray(validatedRules.colors)) {
    validatedRules.colors = validatedRules.colors.filter(color => 
      validColors.includes(color)
    );
    
    // If no valid colors remain, use default colors
    if (validatedRules.colors.length === 0) {
      validatedRules.colors = [validColors[0], validColors[1]]; // First two colors
    }
  } else {
    // Default to all colors if none provided
    validatedRules.colors = validColors;
  }
  
  // Validate size constraints
  if (validatedRules.minSize) {
    validatedRules.minSize = Math.max(
      brandConfig.sizeConstraints.minSize,
      Math.min(brandConfig.sizeConstraints.maxSize, validatedRules.minSize)
    );
  }
  
  if (validatedRules.maxSize) {
    validatedRules.maxSize = Math.max(
      validatedRules.minSize || brandConfig.sizeConstraints.minSize,
      Math.min(brandConfig.sizeConstraints.maxSize, validatedRules.maxSize)
    );
  }
  
  return validatedRules;
}

module.exports = validateRules;
