const express = require('express');
const router = express.Router();
const Site = require('../models/Site');
const Group = require('../models/Group');
const { auth, adminOnly, authorizeGroup } = require('../middleware/auth');

// @route    GET /api/sites
// @desc     Get all sites (filtered by user permissions)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const { group_id } = req.query;
    let query = {};
    
    // Filter by group if provided
    if (group_id) {
      query.group_id = group_id;
    }
    
    // TODO: Add permission filtering based on user role
    // if user is not admin, filter only sites they have access to
    
    const sites = await Site.find(query).sort({ name: 1 });
    res.json(sites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/sites/:id
// @desc     Get site by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // TODO: Check permissions
    // if not authorized return res.status(403).json({ msg: 'Not authorized' });
    
    res.json(site);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/sites
// @desc     Create a new site
// @access   Private (all authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const {
      group_id,
      name,
      address,
      gps_coordinates,
      onsite_contact
    } = req.body;
    
    // Verify group exists
    const group = await Group.findById(group_id);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Create new site
    const newSite = new Site({
      group_id,
      name,
      address,
      gps_coordinates,
      onsite_contact,
      created_by: req.user.id
    });
    
    // Add creation event
    newSite.events.push({
      action: 'created',
      user: req.user.id,
      details: 'Site created',
      timestamp: new Date()
    });
    
    const site = await newSite.save();
    
    res.json(site);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/sites/:id
// @desc     Update a site
// @access   Private
router.put('/:id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // TODO: Check permissions
    
    const {
      name,
      address,
      gps_coordinates,
      onsite_contact,
      external_links
    } = req.body;
    
    // Update site fields
    if (name) site.name = name;
    if (address) site.address = address;
    if (gps_coordinates) site.gps_coordinates = gps_coordinates;
    if (onsite_contact) site.onsite_contact = onsite_contact;
    if (external_links) site.external_links = external_links;
    
    // Add update event
    site.events.push({
      action: 'updated',
      user: req.user.id,
      details: 'Site updated',
      timestamp: new Date()
    });
    
    site.updated_at = new Date();
    
    await site.save();
    
    res.json(site);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/sites/:id
// @desc     Delete a site
// @access   Private (all authenticated users)
router.delete('/:id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    await site.deleteOne();
    
    res.json({ msg: 'Site removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    GET /api/sites/:id/documents
// @desc     Get documents for a site
// @access   Private
router.get('/:id/documents', auth, async (req, res) => {
  try {
    const { module } = req.query;
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Get all documents for this site
    const Document = require('../models/Document');
    const query = { site_id: req.params.id };
    
    // Filter by module if provided
    if (module) {
      query.module = module;
    }
    
    const documents = await Document.find(query).sort({ created_at: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/sites/:id/documents
// @desc     Add document to a site
// @access   Private
router.post('/:id/documents', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const Document = require('../models/Document');
    const {
      name,
      type,
      description,
      is_external,
      url,
      module,
      tags
    } = req.body;
    
    // Create new document
    const newDocument = new Document({
      site_id: req.params.id,
      name,
      type,
      description,
      is_external: is_external || false,
      url,
      module: module || 'particularities',
      tags: tags || [],
      created_by: req.user.id
    });
    
    const document = await newDocument.save();
    
    // Add event to site history
    site.addEvent('document_added', req.user.id, `New document added: ${name}`);
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/sites/:id/external-tools
// @desc     Get external tools for a site
// @access   Private
router.get('/:id/external-tools', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Get all external tools for this site
    const ExternalTool = require('../models/ExternalTool');
    const externalTools = await ExternalTool.find({ site_id: req.params.id }).sort({ name: 1 });
    res.json(externalTools);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/sites/:id/external-tools
// @desc     Add external tool to a site
// @access   Private
router.post('/:id/external-tools', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const ExternalTool = require('../models/ExternalTool');
    const {
      name,
      url,
      icon,
      description
    } = req.body;
    
    // Create new external tool
    const newTool = new ExternalTool({
      site_id: req.params.id,
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

// @route    DELETE /api/sites/:id/external-tools/:tool_id
// @desc     Delete external tool from a site
// @access   Private
router.delete('/:id/external-tools/:tool_id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const ExternalTool = require('../models/ExternalTool');
    const externalTool = await ExternalTool.findOne({ 
      _id: req.params.tool_id, 
      site_id: req.params.id 
    });
    
    if (!externalTool) {
      return res.status(404).json({ msg: 'External tool not found' });
    }
    
    // Get tool name for the event log
    const toolName = externalTool.name;
    
    await externalTool.deleteOne();
    
    // Add event to site history
    site.addEvent('external_tool_deleted', req.user.id, `External tool deleted: ${toolName}`);
    
    res.json({ msg: 'External tool removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/sites/:id/wan-connections
// @desc     Get WAN connections for a site
// @access   Private
router.get('/:id/wan-connections', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Get all WAN connections for this site
    const WANDeployment = require('../models/WANDeployment');
    const wanConnections = await WANDeployment.find({ site_id: req.params.id }).sort({ created_at: -1 });
    res.json(wanConnections);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/sites/:id/wan-connections
// @desc     Add WAN connection to a site
// @access   Private
router.post('/:id/wan-connections', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WANDeployment = require('../models/WANDeployment');
    const {
      provider,
      link_type,
      bandwidth,
      status,
      order_date,
      activation_date,
      contract_details,
      subscribed_by_site
    } = req.body;
    
    // Create new WAN connection
    const newWAN = new WANDeployment({
      site_id: req.params.id,
      provider,
      link_type,
      bandwidth,
      status: status || 'ordered',
      order_date,
      activation_date,
      contract_details,
      subscribed_by_site,
      created_by: req.user.id
    });
    
    const wanConnection = await newWAN.save();
    
    // Add event to site history
    site.addEvent('wan_updated', req.user.id, `New WAN connection added: ${provider} ${link_type}`);
    
    res.json(wanConnection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/sites/:id/wan-connections/:wan_id
// @desc     Update WAN connection for a site
// @access   Private
router.put('/:id/wan-connections/:wan_id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WANDeployment = require('../models/WANDeployment');
    const wanConnection = await WANDeployment.findOne({ 
      _id: req.params.wan_id, 
      site_id: req.params.id 
    });
    
    if (!wanConnection) {
      return res.status(404).json({ msg: 'WAN connection not found' });
    }
    
    const {
      provider,
      link_type,
      bandwidth,
      status,
      subscribed_by_site
    } = req.body;
    
    // Update fields
    if (provider) wanConnection.provider = provider;
    if (link_type) wanConnection.link_type = link_type;
    if (bandwidth) wanConnection.bandwidth = bandwidth;
    if (status) wanConnection.status = status;
    if (subscribed_by_site !== undefined) wanConnection.subscribed_by_site = subscribed_by_site;
    
    wanConnection.updated_at = new Date();
    
    await wanConnection.save();
    
    // Add event to site history
    site.addEvent('wan_updated', req.user.id, `WAN connection updated: ${provider} ${link_type}`);
    
    res.json(wanConnection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/sites/:id/wan-connections/:wan_id
// @desc     Delete WAN connection from a site
// @access   Private
router.delete('/:id/wan-connections/:wan_id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WANDeployment = require('../models/WANDeployment');
    const wanConnection = await WANDeployment.findOne({ 
      _id: req.params.wan_id, 
      site_id: req.params.id 
    });
    
    if (!wanConnection) {
      return res.status(404).json({ msg: 'WAN connection not found' });
    }
    
    // Get WAN info for the event log
    const wanInfo = `${wanConnection.provider} ${wanConnection.link_type}`;
    
    await wanConnection.deleteOne();
    
    // Add event to site history
    site.addEvent('wan_updated', req.user.id, `WAN connection deleted: ${wanInfo}`);
    
    res.json({ msg: 'WAN connection removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/sites/:id/wifi-deployment
// @desc     Get wifi deployments for a site
// @access   Private
router.get('/:id/wifi-deployment', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WifiDeployment = require('../models/WifiDeployment');
    const deployments = await WifiDeployment.find({ site_id: req.params.id })
      .populate('created_by', 'name email')
      .sort({ created_at: -1 });
    
    res.json(deployments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    GET /api/sites/:id/wifi-deployment/:deploymentId
// @desc     Get a specific wifi deployment
// @access   Private
router.get('/:id/wifi-deployment/:deploymentId', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WifiDeployment = require('../models/WifiDeployment');
    const deployment = await WifiDeployment.findById(req.params.deploymentId)
      .populate('created_by', 'name email');
    
    if (!deployment) {
      return res.status(404).json({ msg: 'WiFi deployment not found' });
    }
    
    // Verify this deployment belongs to this site
    if (deployment.site_id.toString() !== req.params.id) {
      return res.status(400).json({ msg: 'Deployment does not belong to this site' });
    }
    
    res.json(deployment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site or deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/sites/:id/wifi-deployment
// @desc     Create a new wifi deployment for a site
// @access   Private
router.post('/:id/wifi-deployment', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WifiDeployment = require('../models/WifiDeployment');
    
    // Remove check for existing deployment - now multiple deployments are allowed
    
    const { status, notes, name } = req.body;
    
    // Create new deployment
    const newDeployment = new WifiDeployment({
      site_id: req.params.id,
      name,
      status: status || 'planning',
      notes,
      created_by: req.user.id
    });
    
    // Set start date if status is in_progress
    if (status === 'in_progress') {
      newDeployment.start_date = new Date();
    }
    
    const deployment = await newDeployment.save();
    
    // Add event to site history
    site.events.push({
      action: 'wifi_deployment_created',
      user: req.user.id,
      details: `WiFi deployment created: ${name}`,
      timestamp: new Date()
    });
    await site.save();
    
    res.json(deployment);
  } catch (err) {
    console.error('Error creating WiFi deployment:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid data: ' + err.message });
    }
    res.status(500).send('Server error: ' + err.message);
  }
});

// @route    PATCH /api/sites/:id/wifi-deployment/:deploymentId
// @desc     Update wifi deployment status
// @access   Private
router.patch('/:id/wifi-deployment/:deploymentId', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WifiDeployment = require('../models/WifiDeployment');
    const deployment = await WifiDeployment.findById(req.params.deploymentId);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'WiFi deployment not found' });
    }
    
    // Verify this deployment belongs to this site
    if (deployment.site_id.toString() !== req.params.id) {
      return res.status(400).json({ msg: 'Deployment does not belong to this site' });
    }
    
    const { status, notes, completion_date } = req.body;
    
    // Update deployment fields
    if (status) {
      deployment.status = status;
      // If changing to in_progress and no start date, set it
      if (status === 'in_progress' && !deployment.start_date) {
        deployment.start_date = new Date();
      }
      // If changing to completed and no completion date, set it
      if (status === 'completed' && !deployment.completion_date) {
        deployment.completion_date = new Date();
      }
    }
    
    if (notes !== undefined) {
      deployment.notes = notes;
    }
    
    if (completion_date !== undefined) {
      deployment.completion_date = completion_date;
    }
    
    deployment.updated_at = new Date();
    
    await deployment.save();
    
    // Add event to site history
    site.events.push({
      action: 'wifi_deployment_updated',
      user: req.user.id,
      details: `WiFi deployment status updated to ${status || 'updated'}`,
      timestamp: new Date()
    });
    await site.save();
    
    res.json(deployment);
  } catch (err) {
    console.error('Error updating WiFi deployment:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid data: ' + err.message });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site or deployment not found' });
    }
    res.status(500).send('Server error: ' + err.message);
  }
});

// @route    POST /api/sites/:id/wifi-deployment/:deploymentId/archive
// @desc     Archive a wifi deployment
// @access   Private
router.post('/:id/wifi-deployment/:deploymentId/archive', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    const WifiDeployment = require('../models/WifiDeployment');
    const deployment = await WifiDeployment.findById(req.params.deploymentId);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'WiFi deployment not found' });
    }
    
    // Verify this deployment belongs to this site
    if (deployment.site_id.toString() !== req.params.id) {
      return res.status(400).json({ msg: 'Deployment does not belong to this site' });
    }
    
    // Archive by removing but save to archived collection
    const ArchivedWifiDeployment = require('../models/ArchivedWifiDeployment');
    const archivedDeployment = new ArchivedWifiDeployment(deployment.toObject());
    archivedDeployment.archived_at = new Date();
    archivedDeployment.archived_by = req.user.id;
    
    await archivedDeployment.save();
    await deployment.deleteOne();
    
    // Add event to site history
    site.events.push({
      action: 'wifi_deployment_archived',
      user: req.user.id,
      details: 'WiFi deployment archived',
      timestamp: new Date()
    });
    await site.save();
    
    res.json({ msg: 'Deployment archived' });
  } catch (err) {
    console.error('Error archiving WiFi deployment:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid data: ' + err.message });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Site or deployment not found' });
    }
    res.status(500).send('Server error: ' + err.message);
  }
});

module.exports = router; 