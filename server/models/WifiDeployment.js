const mongoose = require('mongoose');

const WifiDeploymentSchema = new mongoose.Schema({
  site_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'blocked'],
    default: 'planning'
  },
  start_date: {
    type: Date
  },
  completion_date: {
    type: Date
  },
  notes: {
    type: String
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  // Comments about the deployment
  comments: [{
    text: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    importance: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Tasks related to the deployment
  tasks: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'blocked'],
      default: 'not_started'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    due_date: {
      type: Date
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add a comment to the deployment
WifiDeploymentSchema.methods.addComment = function(text, userId) {
  this.comments.push({
    text,
    user: userId,
    timestamp: new Date()
  });
  this.updated_at = new Date();
  return this.save();
};

// Add a task to the deployment
WifiDeploymentSchema.methods.addTask = function(taskData, userId) {
  this.tasks.push({
    ...taskData,
    created_by: userId,
    created_at: new Date(),
    updated_at: new Date()
  });
  this.updated_at = new Date();
  return this.save();
};

module.exports = mongoose.model('WifiDeployment', WifiDeploymentSchema); 