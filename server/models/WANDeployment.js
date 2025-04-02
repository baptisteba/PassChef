const mongoose = require('mongoose');

const WANDeploymentSchema = new mongoose.Schema({
  site_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  link_type: {
    type: String,
    enum: ['FTTO', 'FTTH', 'Starlink', 'ADSL', 'VDSL', 'OTHER', 'Other'],
    required: true
  },
  bandwidth: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['ordered', 'active', 'canceled', 'inactive'],
    default: 'ordered'
  },
  subscribed_by_site: {
    type: Boolean,
    default: false,
    description: "Whether the connection is subscribed by the site directly (not by our company)"
  },
  order_date: {
    type: Date
  },
  activation_date: {
    type: Date
  },
  cancellation_date: {
    type: Date
  },
  contract_details: {
    reference: {
      type: String,
      trim: true
    },
    start_date: {
      type: Date
    },
    end_date: {
      type: Date
    },
    renewal_type: {
      type: String,
      enum: ['automatic', 'manual', 'none'],
      default: 'automatic'
    },
    monthly_cost: {
      type: Number
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    notes: {
      type: String
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
  // Tracking changes to the WAN deployment
  history: [{
    field: {
      type: String,
      required: true
    },
    old_value: {
      type: mongoose.Schema.Types.Mixed
    },
    new_value: {
      type: mongoose.Schema.Types.Mixed
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add a history entry when a field is changed
WANDeploymentSchema.methods.addHistoryEntry = function(field, oldValue, newValue, userId) {
  this.history.push({
    field,
    old_value: oldValue,
    new_value: newValue,
    changed_by: userId,
    timestamp: new Date()
  });
  this.updated_at = new Date();
  return this.save();
};

module.exports = mongoose.model('WANDeployment', WANDeploymentSchema); 