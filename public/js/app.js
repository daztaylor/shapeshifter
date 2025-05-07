document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const generateBtn = document.getElementById('generate-btn');
  const downloadBtn = document.getElementById('download-btn');
  const saveBtn = document.getElementById('save-btn');
  const svgContainer = document.getElementById('svg-container');
  const compositionSelect = document.getElementById('composition');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const seedInput = document.getElementById('seed');
  const randomSeedBtn = document.getElementById('random-seed-btn');
  const patternOptionsContainer = document.querySelector('.pattern-options');
  const saveTemplateBtn = document.getElementById('save-template-btn');
  const saveTemplateModal = document.getElementById('save-template-modal');
  const saveTemplateConfirm = document.getElementById('save-template-confirm');
  const saveTemplateCancel = document.getElementById('save-template-cancel');
  
  // State
  let brandConfig = null;
  let selectedColors = [];
  let selectedShapes = [];
  let currentSVG = '';
  let currentRules = {};
  
  // Initialize application
  async function initApp() {
    try {
      // Load brand configuration
      brandConfig = await fetchConfig();
      
      // Populate shapes
      populateShapes(brandConfig.shapes);
      
      // Populate colors
      populateColors(brandConfig.colors);
      
      // Load templates
      loadTemplates();
      
      // Initialize pattern options for default composition
      updatePatternOptions(compositionSelect.value);
      
      // Set random seed
      generateRandomSeed();
    } catch (error) {
      console.error('Error initializing app:', error);
      showNotification('Error loading application configuration', 'error');
    }
  }
  
  // Fetch brand configuration
  async function fetchConfig() {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to load configuration');
    }
    return response.json();
  }
  
  // Populate shape options
  function populateShapes(shapes) {
    const container = document.getElementById('shapes-container');
    container.innerHTML = '';
    
    shapes.forEach(shape => {
      const shapeElement = document.createElement('div');
      shapeElement.className = 'shape-option';
      shapeElement.dataset.shape = shape.name;
      shapeElement.textContent = shape.name;
      
      // Select first few shapes by default
      if (['circle', 'rect', 'triangle', 'hexagon'].includes(shape.name)) {
        shapeElement.classList.add('selected');
        selectedShapes.push(shape.name);
      }
      
      shapeElement.addEventListener('click', () => {
        shapeElement.classList.toggle('selected');
        
        if (shapeElement.classList.contains('selected')) {
          selectedShapes.push(shape.name);
        } else {
          selectedShapes = selectedShapes.filter(s => s !== shape.name);
        }
      });
      
      container.appendChild(shapeElement);
    });
  }
  
  // Populate color options
  function populateColors(colors) {
    const container = document.getElementById('colors-container');
    container.innerHTML = '';
    
    colors.forEach(color => {
      const colorElement = document.createElement('div');
      colorElement.className = 'color-option';
      colorElement.dataset.color = color.value;
      colorElement.style.backgroundColor = color.value;
      colorElement.title = color.name;
      
      // Select all colors by default
      colorElement.classList.add('selected');
      selectedColors.push(color.value);
      
      colorElement.addEventListener('click', () => {
        colorElement.classList.toggle('selected');
        
        if (colorElement.classList.contains('selected')) {
          selectedColors.push(color.value);
        } else {
          selectedColors = selectedColors.filter(c => c !== color.value);
        }
      });
      
      container.appendChild(colorElement);
    });
  }
  
  // Generate SVG
  async function generateSVG() {
    try {
      // Collect rules based on UI state
      const rules = collectRules();
      currentRules = rules;
      
      // Show loading state
      svgContainer.innerHTML = '<div class="svg-placeholder">Generating SVG...</div>';
      
      // Call API to generate SVG
      const response = await fetch('/api/svg/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rules })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate SVG');
      }
      
      // Get SVG as text
      currentSVG = await response.text();
      
      // Display SVG
      svgContainer.innerHTML = currentSVG;
      
      // Enable download and save buttons
      downloadBtn.disabled = false;
      saveBtn.disabled = false;
      saveTemplateBtn.disabled = false;
      
      // Show success notification
      showNotification('SVG generated successfully', 'success');
    } catch (error) {
      console.error('Error generating SVG:', error);
      showNotification('Error generating SVG', 'error');
    }
  }
  
  // Collect rules from UI
  function collectRules() {
    const composition = compositionSelect.value;
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const seed = parseInt(seedInput.value);
    
    // Base rules
    const rules = {
      composition,
      width,
      height,
      seed,
      shapes: [...selectedShapes],
      colors: [...selectedColors]
    };
    
    // Add pattern-specific options
    const patternOptions = collectPatternOptions(composition);
    Object.assign(rules, patternOptions);
    
    return rules;
  }
  
  // Download SVG
  function downloadSVG() {
    if (!currentSVG) return;
    
    // Create a blob from the SVG
    const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `svg-design-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Release the blob URL
    URL.revokeObjectURL(url);
    
    showNotification('SVG downloaded', 'success');
  }
  
  // Save SVG to server
  async function saveSVG() {
    if (!currentSVG) return;
    
    try {
      // Call API to save SVG
      const response = await fetch('/api/svg/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          svg: currentSVG,
          filename: `design-${Date.now()}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save SVG');
      }
      
      const data = await response.json();
      
      showNotification('SVG saved to server', 'success');
    } catch (error) {
      console.error('Error saving SVG:', error);
      showNotification('Error saving SVG', 'error');
    }
  }
  
  // Generate a random seed
  function generateRandomSeed() {
    seedInput.value = Math.floor(Math.random() * 999999) + 1;
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.add('active');
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('active');
    }, 3000);
  }
  
  // Event Listeners
  generateBtn.addEventListener('click', generateSVG);
  downloadBtn.addEventListener('click', downloadSVG);
  saveBtn.addEventListener('click', saveSVG);
  randomSeedBtn.addEventListener('click', generateRandomSeed);
  
  compositionSelect.addEventListener('change', () => {
    updatePatternOptions(compositionSelect.value);
  });
  
  // Save template
  saveTemplateBtn.addEventListener('click', () => {
    saveTemplateModal.classList.add('active');
  });
  
  saveTemplateConfirm.addEventListener('click', async () => {
    const name = document.getElementById('template-name').value.trim();
    const description = document.getElementById('template-description').value.trim();
    
    if (!name) {
      showNotification('Please enter a template name', 'warning');
      return;
    }
    
    try {
      // Save template to server
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          rules: currentRules,
          thumbnail: '' // In a real implementation, you would generate a thumbnail
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save template');
      }
      
      // Close modal
      saveTemplateModal.classList.remove('active');
      
      // Clear form
      document.getElementById('template-name').value = '';
      document.getElementById('template-description').value = '';
      
      // Reload templates
      loadTemplates();
      
      showNotification('Template saved', 'success');
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification('Error saving template', 'error');
    }
  });
  
  saveTemplateCancel.addEventListener('click', () => {
    saveTemplateModal.classList.remove('active');
  });
  
  // Initialize app
  initApp();
});
