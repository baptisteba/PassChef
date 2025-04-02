const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  primary_contact: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
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
  // Tracking the event history for the group
  events: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'user_added', 'user_removed'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add an event to the group's history
GroupSchema.methods.addEvent = function(action, user, details = '') {
  this.events.push({
    action,
    user,
    details,
    timestamp: new Date()
  });
  this.updated_at = new Date();
  return this.save();
};

module.exports = mongoose.model('Group', GroupSchema); 