const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { auth, adminOnly, authorizeGroup } = require('../middleware/auth');

// @route    GET /api/groups
// @desc     Get all groups (filtered by user permissions)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    let groups;
    
    // Admin can see all groups
    if (req.user.role === 'admin') {
      groups = await Group.find().sort({ name: 1 });
    } else {
      // For other roles, we need to get groups they have access to
      // This would usually require a more complex query joining with user permissions
      // For simplicity, we're just returning all groups for now
      groups = await Group.find().sort({ name: 1 });
      
      // TODO: Filter based on user permissions
    }
    
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/groups/:id
// @desc     Get group by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check permissions (placeholder, to be implemented)
    // if not authorized return res.status(403).json({ msg: 'Not authorized' });
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/groups
// @desc     Create a new group
// @access   Private (all authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, primary_contact, notes } = req.body;
    
    // Create new group
    const newGroup = new Group({
      name,
      primary_contact,
      notes,
      created_by: req.user.id
    });
    
    // Add creation event
    newGroup.events.push({
      action: 'created',
      user: req.user.id,
      details: 'Group created',
      timestamp: new Date()
    });
    
    const group = await newGroup.save();
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/groups/:id
// @desc     Update a group
// @access   Private (admin or authorized group_owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check permissions (placeholder, to be implemented)
    // if not authorized return res.status(403).json({ msg: 'Not authorized' });
    
    const { name, primary_contact, notes } = req.body;
    
    // Update group fields
    if (name) group.name = name;
    if (primary_contact) group.primary_contact = primary_contact;
    if (notes !== undefined) group.notes = notes;
    
    // Add update event
    group.events.push({
      action: 'updated',
      user: req.user.id,
      details: 'Group updated',
      timestamp: new Date()
    });
    
    group.updated_at = new Date();
    
    await group.save();
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/groups/:id
// @desc     Delete a group
// @access   Private (all authenticated users)
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    await group.deleteOne();
    
    res.json({ msg: 'Group removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 