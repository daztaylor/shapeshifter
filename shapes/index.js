// Import shape modules
const concentricCircles1 = require('./concentricCircles1');
const concentricCircles2 = require('./concentricCircles2');
const concentricCircles3 = require('./concentricCircles3');
// Add more shape imports here

// Create shape registry - comment out shapes to disable them
const shapes = [
  concentricCircles1,
  concentricCircles2,
  concentricCircles3,
  // Add more shapes here
];

// Create shape map for quick lookup
const shapeMap = {};
shapes.forEach(shape => {
  shapeMap[shape.name] = shape.generate;
});

// Export the shape information
module.exports = {
  // List of all registered shapes (for configuration)
  shapeList: shapes.map(shape => ({
    name: shape.name,
    description: shape.description
  })),
  
  // Map of shape generators (for SVG generation)
  shapeMap: shapeMap
};