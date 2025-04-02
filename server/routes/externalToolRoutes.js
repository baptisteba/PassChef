const express = require('express');
const router = express.Router();
const ExternalTool = require('../models/ExternalTool');
const Site = require('../models/Site');
const { auth } = require('../middleware/auth');

// @route    GET /api/external-tools
// @desc     Get all external tools (filtered by site if provided)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const { site_id } = req.query;
    let query = {};
    
    // Filter by site if provided
    if (site_id) {
      query.site_id = site_id;
    }
    
    const externalTools = await ExternalTool.find(query).sort({ name: 1 });
    res.json(externalTools);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/external-tools/:id
// @desc     Get external tool by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const externalTool = await ExternalTool.findById(req.params.id);
    
    if (!externalTool) {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    
    res.json(externalTool);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/external-tools
// @desc     Create a new external tool
// @access   Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      site_id,
      name,
      url,
      icon,
      description
    } = req.body;
    
    // Verify site exists
    const site = await Site.findById(site_id);
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Create new external tool
    const newTool = new ExternalTool({
      site_id,
      name,
      url,
      icon,
      description,
      created_by: req.user.id
    });
    
    const externalTool = await newTool.save();
    
    // Add event to site history
    site.addEvent('external_tool_added', req.user.id, `New external tool added: ${name}`);
    
    res.json(externalTool);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/external-tools/:id
// @desc     Update an external tool
// @access   Private
router.put('/:id', auth, async (req, res) => {
  try {
    const externalTool = await ExternalTool.findById(req.params.id);
    
    if (!externalTool) {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    
    const {
      name,
      url,
      icon,
      description
    } = req.body;
    
    // Update fields
    if (name) externalTool.name = name;
    if (url) externalTool.url = url;
    if (icon) externalTool.icon = icon;
    if (description) externalTool.description = description;
    
    externalTool.updated_at = new Date();
    externalTool.updated_by = req.user.id;
    
    await externalTool.save();
    
    // Add event to site history
    const site = await Site.findById(externalTool.site_id);
    if (site) {
      site.addEvent('external_tool_updated', req.user.id, `External tool updated: ${externalTool.name}`);
    }
    
    res.json(externalTool);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/external-tools/:id
// @desc     Delete an external tool
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const externalTool = await ExternalTool.findById(req.params.id);
    
    if (!externalTool) {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    
    // Get site info for event logging before deleting tool
    const site_id = externalTool.site_id;
    const toolName = externalTool.name;
    
    await externalTool.deleteOne();
    
    // Log event to site history
    const site = await Site.findById(site_id);
    if (site) {
      site.addEvent('external_tool_deleted', req.user.id, `External tool deleted: ${toolName}`);
    }
    
    res.json({ msg: 'External tool removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 