// Load templates from server
async function loadTemplates() {
  try {
    const response = await fetch('/api/templates');
    
    if (!response.ok) {
      throw new Error('Failed to load templates');
    }
    
    const templates = await response.json();
    renderTemplates(templates);
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

// Render templates in UI
function renderTemplates(templates) {
  const container = document.getElementById('templates-container');
  
  if (!templates || templates.length === 0) {
    container.innerHTML = '<div class="template-empty">No templates saved yet</div>';
    return;
  }
  
  container.innerHTML = '';
  
  templates.forEach(template => {
    const templateEl = document.createElement('div');
    templateEl.className = 'template-item';
    templateEl.dataset.id = template._id;
    
    const thumbnail = document.createElement('div');
    thumbnail.className = 'template-thumbnail';
    
    // If template has a thumbnail, use it, otherwise show placeholder
    if (template.thumbnail) {
      thumbnail.innerHTML = template.thumbnail;
    } else {
      // Create a simple colored rectangle as placeholder
      thumbnail.style.backgroundColor = template.rules.colors[0] || '#ccc';
    }
    
    const info = document.createElement('div');
    info.className = 'template-info';
    info.textContent = template.name;
    
    templateEl.appendChild(thumbnail);
    templateEl.appendChild(info);
    
    // Add click handler to apply template
    templateEl.addEventListener('click', () => applyTemplate(template));
    
    container.appendChild(templateEl);
  });
}

// Apply template
function applyTemplate(template) {
  // Update UI based on template rules
  const rules = template.rules;
  
  // Update composition
  const compositionSelect = document.getElementById('composition');
  compositionSelect.value = rules.composition;
  
  // Update pattern options
  updatePatternOptions(rules.composition);
  
  // Apply pattern-specific options
  const options = patternOptionsConfig[rules.composition] || [];
  options.forEach(option => {
    const element = document.getElementById(option.id);
    if (!element) return;
    
    if (rules[option.id] !== undefined) {
      if (option.type === 'checkbox') {
        element.checked = rules[option.id];
      } else {
        element.value = rules[option.id];
      }
    }
  });
  
  // Update width and height
  if (rules.width) document.getElementById('width').value = rules.width;
  if (rules.height) document.getElementById('height').value = rules.height;
  
  // Update seed
  if (rules.seed) document.getElementById('seed').value = rules.seed;
  
  // Update shapes
  const shapeElements = document.querySelectorAll('.shape-option');
  shapeElements.forEach(el => {
    const shape = el.dataset.shape;
    if (rules.shapes && rules.shapes.includes(shape)) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
  
  // Update colors
  const colorElements = document.querySelectorAll('.color-option');
  colorElements.forEach(el => {
    const color = el.dataset.color;
    if (rules.colors && rules.colors.includes(color)) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
  
  // Update selected shapes and colors arrays
  window.selectedShapes = [...rules.shapes];
  window.selectedColors = [...rules.colors];
  
  // Show notification
  showNotification(`Template '${template.name}' applied`, 'success');
}
