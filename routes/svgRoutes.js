const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const svgGenerator = require('../services/svgGenerator');
const optimizeSVG = require('../utils/optimizeSVG');
const validateRules = require('../utils/validateRules');

// Generate SVG based on rules
router.post('/generate', async (req, res) => {
  try {
    const { rules } = req.body;
    
    if (!rules) {
      return res.status(400).json({ error: 'Missing required parameter: rules' });
    }

    // Validate rules against brand guidelines
    const validatedRules = validateRules(rules);
    
    // Generate SVG
    const svg = svgGenerator.generateSVG(validatedRules);
    
    // Optimize SVG (optional)
    const optimizedSvg = optimizeSVG(svg);
    
    // Return SVG as response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(optimizedSvg);
  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({ error: 'Failed to generate SVG', message: error.message });
  }
});

// Save generated SVG to disk
router.post('/save', async (req, res) => {
  try {
    const { svg, filename } = req.body;
    
    if (!svg || !filename) {
      return res.status(400).json({ error: 'Missing required parameters: svg and filename' });
    }
    
    // Create a safe filename
    const safeName = `${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.svg`;
    const saveDir = process.env.SAVE_DIR || './generated';
    const filePath = path.join(saveDir, safeName);
    
    // Write SVG to file
    await fs.writeFile(filePath, svg);
    
    // Return success with file info
    res.json({
      success: true,
      filename: safeName,
      path: filePath,
      url: `/generated/${safeName}`
    });
  } catch (error) {
    console.error('Error saving SVG:', error);
    res.status(500).json({ error: 'Failed to save SVG', message: error.message });
  }
});

// Generate batch of SVGs
router.post('/batch', async (req, res) => {
  try {
    const { rulesList, count, variations } = req.body;
    
    if (!rulesList || !count) {
      return res.status(400).json({ error: 'Missing required parameters: rulesList and count' });
    }
    
    const results = [];
    const batchId = uuidv4();
    const batchDir = path.join(process.env.SAVE_DIR || './generated', batchId);
    
    // Create batch directory
    await fs.mkdir(batchDir, { recursive: true });
    
    // Generate SVGs
    for (let i = 0; i < count; i++) {
      // Select rule set (either randomly or in sequence)
      const ruleIndex = Math.floor(Math.random() * rulesList.length);
      const baseRules = rulesList[ruleIndex];
      
      // Apply variations if specified
      let rules = { ...baseRules };
      if (variations) {
        rules = svgGenerator.applyVariations(rules, variations);
      }
      
      // Validate rules
      const validatedRules = validateRules(rules);
      
      // Generate SVG
      const svg = svgGenerator.generateSVG(validatedRules);
      
      // Save to file
      const filename = `batch-${batchId}-${i + 1}.svg`;
      const filePath = path.join(batchDir, filename);
      await fs.writeFile(filePath, svg);
      
      // Add to results
      results.push({
        index: i + 1,
        filename,
        path: filePath,
        url: `/generated/${batchId}/${filename}`,
        rules: validatedRules
      });
    }
    
    res.json({
      success: true,
      batchId,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error generating batch SVGs:', error);
    res.status(500).json({ error: 'Failed to generate batch SVGs', message: error.message });
  }
});

// Get list of saved SVGs
router.get('/saved', async (req, res) => {
  try {
    const saveDir = process.env.SAVE_DIR || './generated';
    const files = await fs.readdir(saveDir);
    
    // Filter for SVG files
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    // Get file info
    const fileList = await Promise.all(svgFiles.map(async (file) => {
      const stats = await fs.stat(path.join(saveDir, file));
      
      return {
        filename: file,
        path: path.join(saveDir, file),
        url: `/generated/${file}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    }));
    
    res.json(fileList);
  } catch (error) {
    console.error('Error listing saved SVGs:', error);
    res.status(500).json({ error: 'Failed to list saved SVGs', message: error.message });
  }
});

// Get a specific saved SVG
router.get('/saved/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const saveDir = process.env.SAVE_DIR || './generated';
    const filePath = path.join(saveDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'SVG not found' });
    }
    
    // Read file and return as SVG
    const svg = await fs.readFile(filePath, 'utf8');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error retrieving saved SVG:', error);
    res.status(500).json({ error: 'Failed to retrieve SVG', message: error.message });
  }
});

module.exports = router;
