const express = require('express');
const router = express.Router();
const WANDeployment = require('../models/WANDeployment');
const Site = require('../models/Site');
const { auth } = require('../middleware/auth');

// @route    GET /api/wan
// @desc     Get all WAN deployments (filtered by site if provided)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const { site_id } = req.query;
    let query = {};
    
    // Filter by site if provided
    if (site_id) {
      query.site_id = site_id;
    }
    
    const wanDeployments = await WANDeployment.find(query).sort({ created_at: -1 });
    res.json(wanDeployments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/wan/:id
// @desc     Get WAN deployment by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const wanDeployment = await WANDeployment.findById(req.params.id);
    
    if (!wanDeployment) {
      return res.status(404).json({ msg: 'WAN deployment not found' });
    }
    
    res.json(wanDeployment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'WAN deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/wan
// @desc     Create a new WAN deployment
// @access   Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      site_id,
      provider,
      link_type,
      bandwidth,
      status,
      order_date,
      activation_date,
      contract_details
    } = req.body;
    
    // Verify site exists
    const site = await Site.findById(site_id);
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Create new WAN deployment
    const newWAN = new WANDeployment({
      site_id,
      provider,
      link_type,
      bandwidth,
      status: status || 'ordered',
      order_date,
      activation_date,
      contract_details,
      created_by: req.user.id
    });
    
    const wanDeployment = await newWAN.save();
    
    // Add event to site history
    site.addEvent('wan_updated', req.user.id, `New WAN deployment added: ${provider} ${link_type}`);
    
    res.json(wanDeployment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/wan/:id
// @desc     Update a WAN deployment
// @access   Private
router.put('/:id', auth, async (req, res) => {
  try {
    const wanDeployment = await WANDeployment.findById(req.params.id);
    
    if (!wanDeployment) {
      return res.status(404).json({ msg: 'WAN deployment not found' });
    }
    
    const {
      provider,
      link_type,
      bandwidth,
      status,
      order_date,
      activation_date,
      cancellation_date,
      contract_details
    } = req.body;
    
    // Update fields with history tracking
    if (provider && provider !== wanDeployment.provider) {
      wanDeployment.addHistoryEntry('provider', wanDeployment.provider, provider, req.user.id);
      wanDeployment.provider = provider;
    }
    
    if (link_type && link_type !== wanDeployment.link_type) {
      wanDeployment.addHistoryEntry('link_type', wanDeployment.link_type, link_type, req.user.id);
      wanDeployment.link_type = link_type;
    }
    
    if (bandwidth && bandwidth !== wanDeployment.bandwidth) {
      wanDeployment.addHistoryEntry('bandwidth', wanDeployment.bandwidth, bandwidth, req.user.id);
      wanDeployment.bandwidth = bandwidth;
    }
    
    if (status && status !== wanDeployment.status) {
      wanDeployment.addHistoryEntry('status', wanDeployment.status, status, req.user.id);
      wanDeployment.status = status;
      
      // Update activation or cancellation date based on status change
      if (status === 'active' && !wanDeployment.activation_date) {
        wanDeployment.activation_date = new Date();
      }
      
      if (status === 'canceled' && !wanDeployment.cancellation_date) {
        wanDeployment.cancellation_date = new Date();
      }
    }
    
    if (order_date) wanDeployment.order_date = order_date;
    if (activation_date) wanDeployment.activation_date = activation_date;
    if (cancellation_date) wanDeployment.cancellation_date = cancellation_date;
    if (contract_details) wanDeployment.contract_details = contract_details;
    
    wanDeployment.updated_at = new Date();
    
    await wanDeployment.save();
    
    // Update site event history
    const site = await Site.findById(wanDeployment.site_id);
    if (site) {
      site.addEvent('wan_updated', req.user.id, `WAN deployment updated: ${wanDeployment.provider} ${wanDeployment.link_type}`);
    }
    
    res.json(wanDeployment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'WAN deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/wan/:id
// @desc     Delete a WAN deployment
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const wanDeployment = await WANDeployment.findById(req.params.id);
    
    if (!wanDeployment) {
      return res.status(404).json({ msg: 'WAN deployment not found' });
    }
    
    // Get site info for event logging before deleting WAN
    const site_id = wanDeployment.site_id;
    const wanInfo = `${wanDeployment.provider} ${wanDeployment.link_type}`;
    
    await wanDeployment.deleteOne();
    
    // Log event to site history
    const site = await Site.findById(site_id);
    if (site) {
      site.addEvent('wan_updated', req.user.id, `WAN deployment removed: ${wanInfo}`);
    }
    
    res.json({ msg: 'WAN deployment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'WAN deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 