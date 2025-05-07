const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get brand configuration
router.get('/', async (req, res) => {
  try {
    const configPath = process.env.BRAND_CONFIG_PATH || './config/brandConfig.json';
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    
    res.json(config);
  } catch (error) {
    console.error('Error loading brand configuration:', error);
    res.status(500).json({ error: 'Failed to load brand configuration', message: error.message });
  }
});

// Update brand configuration (admin only)
router.put('/', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Missing required parameter: config' });
    }
    
    // Validate config structure
    if (!config.colors || !config.shapes || !config.layouts) {
      return res.status(400).json({ error: 'Invalid config structure' });
    }
    
    // Save configuration
    const configPath = process.env.BRAND_CONFIG_PATH || './config/brandConfig.json';
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    console.error('Error updating brand configuration:', error);
    res.status(500).json({ error: 'Failed to update brand configuration', message: error.message });
  }
});

module.exports = router;
