const mongoose = require('mongoose');

const ArchivedWifiDeploymentSchema = new mongoose.Schema({
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
    type: Date
  },
  updated_at: {
    type: Date
  },
  // Archival information
  archived_at: {
    type: Date,
    default: Date.now
  },
  archived_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Comments about the deployment
  comments: [{
    text: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date
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
      enum: ['not_started', 'in_progress', 'completed', 'blocked']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
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
      ref: 'User'
    },
    created_at: {
      type: Date
    },
    updated_at: {
      type: Date
    }
  }]
});

module.exports = mongoose.model('ArchivedWifiDeployment', ArchivedWifiDeploymentSchema); 