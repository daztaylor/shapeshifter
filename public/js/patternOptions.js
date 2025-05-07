// Pattern-specific options
const patternOptionsConfig = {
  grid: [
    { id: 'rows', label: 'Rows', type: 'number', min: 1, max: 20, value: 4 },
    { id: 'cols', label: 'Columns', type: 'number', min: 1, max: 20, value: 4 },
    { id: 'sizeVariation', label: 'Size Variation', type: 'range', min: 0, max: 1, step: 0.1, value: 0.3 },
    { id: 'enableRotation', label: 'Enable Rotation', type: 'checkbox', value: false },
    { id: 'sparsity', label: 'Sparsity', type: 'range', min: 0, max: 0.9, step: 0.1, value: 0 },
    { 
      id: 'shapeDistribution', 
      label: 'Shape Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'row', label: 'By Row' },
        { value: 'column', label: 'By Column' }
      ],
      value: 'random'
    },
    { 
      id: 'colorDistribution', 
      label: 'Color Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'row', label: 'By Row' },
        { value: 'column', label: 'By Column' }
      ],
      value: 'random'
    }
  ],
  
  radial: [
    { id: 'count', label: 'Number of Shapes', type: 'number', min: 3, max: 36, value: 8 },
    { id: 'radius', label: 'Radius', type: 'number', min: 50, max: 400, value: 200 },
    { id: 'sizeVariation', label: 'Size Variation', type: 'range', min: 0, max: 1, step: 0.1, value: 0.3 },
    { 
      id: 'rotationType', 
      label: 'Rotation Type', 
      type: 'select',
      options: [
        { value: 'none', label: 'None' },
        { value: 'radial', label: 'Radial' },
        { value: 'tangent', label: 'Tangent' },
        { value: 'random', label: 'Random' }
      ],
      value: 'none'
    },
    { id: 'startAngle', label: 'Start Angle (deg)', type: 'number', min: 0, max: 360, value: 0 },
    { 
      id: 'shapeDistribution', 
      label: 'Shape Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' }
      ],
      value: 'random'
    },
    { 
      id: 'colorDistribution', 
      label: 'Color Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'radius', label: 'By Radius' }
      ],
      value: 'random'
    }
  ],
  
  random: [
    { id: 'count', label: 'Number of Shapes', type: 'number', min: 5, max: 100, value: 20 },
    { id: 'minSize', label: 'Minimum Size', type: 'number', min: 10, max: 100, value: 20 },
    { id: 'maxSize', label: 'Maximum Size', type: 'number', min: 20, max: 200, value: 80 },
    { id: 'enableRotation', label: 'Enable Rotation', type: 'checkbox', value: true },
    { id: 'avoidOverlap', label: 'Avoid Overlapping', type: 'checkbox', value: false },
    { id: 'minDistance', label: 'Minimum Distance', type: 'number', min: 0, max: 50, value: 10 },
    { 
      id: 'sizeDistribution', 
      label: 'Size Distribution', 
      type: 'select',
      options: [
        { value: 'uniform', label: 'Uniform' },
        { value: 'normal', label: 'Normal' },
        { value: 'bimodal', label: 'Bimodal' }
      ],
      value: 'uniform'
    }
  ],
  
  wave: [
    { id: 'count', label: 'Number of Shapes', type: 'number', min: 5, max: 50, value: 15 },
    { id: 'waves', label: 'Number of Waves', type: 'number', min: 1, max: 10, value: 2 },
    { id: 'waveHeight', label: 'Wave Height', type: 'number', min: 20, max: 300, value: 100 },
    { id: 'phaseShift', label: 'Phase Shift', type: 'range', min: 0, max: 6.28, step: 0.1, value: 0 },
    { 
      id: 'rotationType', 
      label: 'Rotation Type', 
      type: 'select',
      options: [
        { value: 'none', label: 'None' },
        { value: 'wave', label: 'Follow Wave' },
        { value: 'random', label: 'Random' }
      ],
      value: 'none'
    },
    { 
      id: 'shapeDistribution', 
      label: 'Shape Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'wave', label: 'By Wave Height' }
      ],
      value: 'random'
    },
    { 
      id: 'colorDistribution', 
      label: 'Color Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'progress', label: 'By Progress' },
        { value: 'wave', label: 'By Wave Height' }
      ],
value: 'random'
    },
    { 
      id: 'sizeDistribution', 
      label: 'Size Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'wave', label: 'By Wave Height' },
        { value: 'progress', label: 'By Progress' }
      ],
      value: 'random'
    }
  ],
  
  spiral: [
    { id: 'count', label: 'Number of Shapes', type: 'number', min: 5, max: 100, value: 30 },
    { id: 'startRadius', label: 'Start Radius', type: 'number', min: 10, max: 100, value: 20 },
    { id: 'spacing', label: 'Spacing', type: 'number', min: 5, max: 50, value: 15 },
    { id: 'turns', label: 'Number of Turns', type: 'number', min: 1, max: 10, value: 3 },
    { id: 'rotation', label: 'Rotation (deg)', type: 'number', min: 0, max: 360, value: 0 },
    { 
      id: 'rotationType', 
      label: 'Shape Rotation', 
      type: 'select',
      options: [
        { value: 'none', label: 'None' },
        { value: 'spiral', label: 'Follow Spiral' },
        { value: 'random', label: 'Random' }
      ],
      value: 'none'
    },
    { 
      id: 'shapeDistribution', 
      label: 'Shape Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'radius', label: 'By Radius' }
      ],
      value: 'random'
    },
    { 
      id: 'colorDistribution', 
      label: 'Color Distribution', 
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'sequence', label: 'Sequence' },
        { value: 'radius', label: 'By Radius' }
      ],
      value: 'random'
    },
    { 
      id: 'sizeDistribution', 
      label: 'Size Distribution', 
      type: 'select',
      options: [
        { value: 'uniform', label: 'Uniform' },
        { value: 'decreasing', label: 'Decreasing' },
        { value: 'increasing', label: 'Increasing' }
      ],
      value: 'uniform'
    }
  ],
  
  cluster: [
    { id: 'clusterCount', label: 'Number of Clusters', type: 'number', min: 1, max: 10, value: 3 },
    { id: 'shapesPerCluster', label: 'Shapes per Cluster', type: 'number', min: 3, max: 50, value: 10 },
    { id: 'clusterRadius', label: 'Cluster Radius', type: 'number', min: 50, max: 300, value: 100 },
    { id: 'clusterShapes', label: 'Cluster-specific Shapes', type: 'checkbox', value: true },
    { id: 'clusterColors', label: 'Cluster-specific Colors', type: 'checkbox', value: true },
    { id: 'minSize', label: 'Minimum Size', type: 'number', min: 10, max: 50, value: 20 },
    { id: 'maxSize', label: 'Maximum Size', type: 'number', min: 20, max: 100, value: 50 },
    { 
      id: 'sizeDistribution', 
      label: 'Size Distribution', 
      type: 'select',
      options: [
        { value: 'uniform', label: 'Uniform' },
        { value: 'distance', label: 'By Distance' }
      ],
      value: 'uniform'
    }
  ],
  
  fractal: [
    { id: 'maxDepth', label: 'Maximum Depth', type: 'number', min: 1, max: 6, value: 3 },
    { id: 'initialSize', label: 'Initial Size', type: 'number', min: 50, max: 400, value: 200 },
    { id: 'scaleFactor', label: 'Scale Factor', type: 'range', min: 0.3, max: 0.9, step: 0.05, value: 0.5 },
    { id: 'childCount', label: 'Children per Node', type: 'number', min: 2, max: 8, value: 3 },
    { id: 'distanceFactor', label: 'Distance Factor', type: 'range', min: 0.5, max: 1.5, step: 0.1, value: 0.8 },
    { id: 'depthShapes', label: 'Different Shape per Depth', type: 'checkbox', value: true },
    { id: 'depthColors', label: 'Different Color per Depth', type: 'checkbox', value: true }
  ]
};

// Update pattern options based on selected composition
function updatePatternOptions(composition) {
  const container = document.querySelector('.pattern-options');
  container.innerHTML = '';
  
  // Set title
  const title = document.createElement('h2');
  title.textContent = `${composition.charAt(0).toUpperCase() + composition.slice(1)} Options`;
  container.appendChild(title);
  
  // Get options for selected composition
  const options = patternOptionsConfig[composition] || [];
  
  // Create form elements for each option
  options.forEach(option => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const label = document.createElement('label');
    label.setAttribute('for', option.id);
    label.textContent = option.label;
    formGroup.appendChild(label);
    
    let input;
    
    switch (option.type) {
      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        input.id = option.id;
        input.min = option.min;
        input.max = option.max;
        input.value = option.value;
        break;
        
      case 'range':
        input = document.createElement('input');
        input.type = 'range';
        input.id = option.id;
        input.min = option.min;
        input.max = option.max;
        input.step = option.step;
        input.value = option.value;
        break;
        
      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = option.id;
        input.checked = option.value;
        break;
        
      case 'select':
        input = document.createElement('select');
        input.id = option.id;
        
        option.options.forEach(optionItem => {
          const optEl = document.createElement('option');
          optEl.value = optionItem.value;
          optEl.textContent = optionItem.label;
          if (optionItem.value === option.value) {
            optEl.selected = true;
          }
          input.appendChild(optEl);
        });
        break;
        
      default:
        input = document.createElement('input');
        input.type = 'text';
        input.id = option.id;
        input.value = option.value;
    }
    
    formGroup.appendChild(input);
    container.appendChild(formGroup);
  });
}

// Collect pattern-specific options
function collectPatternOptions(composition) {
  const options = {};
  const configOptions = patternOptionsConfig[composition] || [];
  
  configOptions.forEach(option => {
    const element = document.getElementById(option.id);
    if (!element) return;
    
    let value;
    
    switch (option.type) {
      case 'number':
      case 'range':
        value = parseFloat(element.value);
        break;
        
      case 'checkbox':
        value = element.checked;
        break;
        
      case 'select':
      default:
        value = element.value;
    }
    
    options[option.id] = value;
  });
  
  return options;
}
