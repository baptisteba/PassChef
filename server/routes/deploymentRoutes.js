const express = require('express');
const router = express.Router();
const WifiDeployment = require('../models/WifiDeployment');
const Site = require('../models/Site');
const { auth } = require('../middleware/auth');

// @route    GET /api/deployments/:id
// @desc     Get deployment by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id)
      .populate('created_by', 'name email')
      .populate('comments.user', 'name email')
      .populate('tasks.created_by', 'name email')
      .populate('tasks.assigned_to', 'name email');
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    res.json(deployment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    GET /api/deployments/:id/comments
// @desc     Get comments for a deployment
// @access   Private
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id)
      .populate('comments.user', 'name email');
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    res.json(deployment.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/deployments/:id/comments
// @desc     Add a comment to a deployment
// @access   Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text, importance } = req.body;
    
    if (!text) {
      return res.status(400).json({ msg: 'Text is required' });
    }
    
    const deployment = await WifiDeployment.findById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    const newComment = {
      text,
      user: req.user.id,
      importance: importance || 'info',
      timestamp: new Date()
    };
    
    deployment.comments.unshift(newComment);
    await deployment.save();
    
    // Return the new comment with populated user data
    const populatedDeployment = await WifiDeployment.findById(req.params.id)
      .populate('comments.user', 'name email');
    
    res.json(populatedDeployment.comments[0]);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).send('Server error: ' + err.message);
  }
});

// @route    GET /api/deployments/:id/tasks
// @desc     Get tasks for a deployment
// @access   Private
router.get('/:id/tasks', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id)
      .populate('tasks.created_by', 'name email')
      .populate('tasks.assigned_to', 'name email');
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    res.json(deployment.tasks);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/deployments/:id/tasks
// @desc     Add a task to a deployment
// @access   Private
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }
    
    const deployment = await WifiDeployment.findById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    const newTask = {
      title,
      description,
      status: status || 'not_started',
      priority: priority || 'medium',
      assigned_to,
      due_date,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    deployment.tasks.unshift(newTask);
    await deployment.save();
    
    // Return the new task with populated user data
    const populatedDeployment = await WifiDeployment.findById(req.params.id)
      .populate('tasks.created_by', 'name email')
      .populate('tasks.assigned_to', 'name email');
    
    res.json(populatedDeployment.tasks[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PATCH /api/deployments/:id/tasks/:taskId
// @desc     Update a task
// @access   Private
router.patch('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    // Find the task
    const taskIndex = deployment.tasks.findIndex(task => task._id.toString() === req.params.taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Update task fields
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    
    if (title) deployment.tasks[taskIndex].title = title;
    if (description !== undefined) deployment.tasks[taskIndex].description = description;
    if (status) deployment.tasks[taskIndex].status = status;
    if (priority) deployment.tasks[taskIndex].priority = priority;
    if (assigned_to !== undefined) deployment.tasks[taskIndex].assigned_to = assigned_to;
    if (due_date !== undefined) deployment.tasks[taskIndex].due_date = due_date;
    
    deployment.tasks[taskIndex].updated_at = new Date();
    
    await deployment.save();
    
    // Return the updated task with populated user data
    const populatedDeployment = await WifiDeployment.findById(req.params.id)
      .populate('tasks.created_by', 'name email')
      .populate('tasks.assigned_to', 'name email');
    
    res.json(populatedDeployment.tasks[taskIndex]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment or task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/deployments/:id/tasks/:taskId
// @desc     Delete a task
// @access   Private
router.delete('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    // Remove the task
    deployment.tasks = deployment.tasks.filter(task => task._id.toString() !== req.params.taskId);
    
    await deployment.save();
    
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment or task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/deployments/:id
// @desc     Delete a deployment and its associated resources
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    // Check if user is authorized (for example, if they created it or are admin)
    // This is a placeholder - implement proper authorization logic
    if (deployment.created_by.toString() !== req.user.id) {
      // In a real app, we might want to check for admin role as well
      return res.status(401).json({ msg: 'Not authorized to delete this deployment' });
    }
    
    // Find the site to add an event
    const site = await Site.findById(deployment.site_id);
    if (site) {
      // Add event to site history
      site.events.push({
        action: 'wifi_deployment_deleted',
        user: req.user.id,
        details: `WiFi deployment deleted: ${deployment.name}`,
        timestamp: new Date()
      });
      await site.save();
    }
    
    // Delete the deployment
    await deployment.deleteOne();
    
    res.json({ msg: 'Deployment deleted successfully' });
  } catch (err) {
    console.error('Error deleting deployment:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    res.status(500).send('Server error: ' + err.message);
  }
});

// @route    PATCH /api/deployments/:id
// @desc     Update a deployment
// @access   Private
router.patch('/:id', auth, async (req, res) => {
  try {
    const deployment = await WifiDeployment.findById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    
    // Check if user is authorized
    if (deployment.created_by.toString() !== req.user.id) {
      // Add admin check in real app
      return res.status(401).json({ msg: 'Not authorized to update this deployment' });
    }
    
    const { name, status, notes } = req.body;
    
    // Update fields
    if (name) deployment.name = name;
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
    if (notes !== undefined) deployment.notes = notes;
    
    deployment.updated_at = new Date();
    
    await deployment.save();
    
    // Find the site to add an event
    const site = await Site.findById(deployment.site_id);
    if (site) {
      // Add event to site history
      site.events.push({
        action: 'wifi_deployment_updated',
        user: req.user.id,
        details: `WiFi deployment updated: ${deployment.name}`,
        timestamp: new Date()
      });
      await site.save();
    }
    
    res.json(deployment);
  } catch (err) {
    console.error('Error updating deployment:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deployment not found' });
    }
    res.status(500).send('Server error: ' + err.message);
  }
});

module.exports = router; 