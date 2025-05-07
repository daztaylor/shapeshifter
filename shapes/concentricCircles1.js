/**
 * Standard four-circle concentric pattern
 * Outer yellow ring, orange middle ring, dark center with white dot
 */
function generateShape(x, y, size, color, random, rotation = 0) {
    const rotationAttr = rotation ? ` transform="rotate(${rotation}, ${x}, ${y})"` : '';
    
    // Use provided colors or default to brand colors if array not provided
    let color1 = '#fec042'; // Yellow outer
    let color2 = '#f27d39'; // Orange middle
    let color3 = '#2b2d42'; // Dark inner
    let color4 = '#fff7e4'; // White center
    
    if (Array.isArray(color) && color.length > 0) {
      if (color.length >= 4) {
        [color1, color2, color3, color4] = color;
      } else if (color.length === 3) {
        [color1, color2, color3] = color;
      } else if (color.length === 2) {
        [color1, color2] = color;
        color3 = color1;
      } else {
        color1 = color2 = color3 = color4 = color[0];
      }
    } else if (typeof color === 'string') {
      color1 = color2 = color3 = color4 = color;
    }
    
    // Based on measurements from the SVG
    const r1 = size / 2;        // Outer circle (100%)
    const r2 = size * 0.391;    // Second circle (78.2%)
    const r3 = size * 0.25;     // Third circle (50%)
    const r4 = size * 0.123;    // Inner circle (24.6%)
    
    return `
      <g${rotationAttr}>
        <circle cx="${x}" cy="${y}" r="${r1}" fill="${color1}" />
        <circle cx="${x}" cy="${y}" r="${r2}" fill="${color2}" />
        <circle cx="${x}" cy="${y}" r="${r3}" fill="${color3}" />
        <circle cx="${x}" cy="${y}" r="${r4}" fill="${color4}" />
      </g>
    `;
  }
  
  module.exports = {
    name: 'concentricCircles1',
    description: 'Four concentric circles with yellow outer ring, orange middle, dark inner, white center',
    generate: generateShape
  };