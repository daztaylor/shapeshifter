const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const validateRules = require('../utils/validateRules');

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ updatedAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates', message: error.message });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template', message: error.message });
  }
});

// Create new template
router.post('/', async (req, res) => {
  try {
    const { name, description, rules, thumbnail } = req.body;
    
    if (!name || !rules) {
      return res.status(400).json({ error: 'Missing required parameters: name and rules' });
    }
    
    // Validate rules
    const validatedRules = validateRules(rules);
    
    // Create template
    const template = new Template({
      name,
      description,
      rules: validatedRules,
      thumbnail
    });
    
    await template.save();
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template', message: error.message });
  }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    const { name, description, rules, thumbnail } = req.body;
    
    // Validate rules if provided
    let validatedRules;
    if (rules) {
      validatedRules = validateRules(rules);
    }
    
    // Update template
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(validatedRules && { rules: validatedRules }),
        ...(thumbnail && { thumbnail })
      },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template', message: error.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template', message: error.message });
  }
});

module.exports = router;
