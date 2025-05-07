const { optimize } = require('svgo');

/**
 * Optimize SVG for size and performance
 * @param {string} svg - Input SVG
 * @returns {string} Optimized SVG
 */
function optimizeSVG(svg) {
  // Skip optimization in development mode
  if (process.env.NODE_ENV === 'development') {
    return svg;
  }
  
  try {
    const result = optimize(svg, {
      plugins: [
        'cleanupAttrs',
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeEditorsNSData',
        'removeEmptyAttrs',
        'removeHiddenElems',
        'removeEmptyText',
        'removeEmptyContainers',
        'minifyStyles',
        'convertStyleToAttrs'
      ]
    });
    
    return result.data;
  } catch (error) {
    console.error('SVG optimization error:', error);
    // Return original SVG if optimization fails
    return svg;
  }
}

module.exports = optimizeSVG;
