const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postal_code: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'France'
    }
  },
  gps_coordinates: {
    latitude: {
      type: String,
      trim: true
    },
    longitude: {
      type: String,
      trim: true
    }
  },
  onsite_contact: {
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
  // Tracking the event history for the site
  events: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'document_added', 'document_deleted', 'wan_updated', 
             'external_tool_added', 'external_tool_updated', 'external_tool_deleted',
             'wifi_deployment_created', 'wifi_deployment_updated', 'wifi_deployment_archived',
             'wifi_deployment_deleted'],
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
  }],
  external_links: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Add an event to the site's history
SiteSchema.methods.addEvent = function(action, user, details = '') {
  this.events.push({
    action,
    user,
    details,
    timestamp: new Date()
  });
  this.updated_at = new Date();
  return this.save();
};

module.exports = mongoose.model('Site', SiteSchema); 