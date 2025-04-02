const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // For external links
  is_external: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    trim: true
  },
  // For stored files (can use GridFS for actual file storage)
  file_info: {
    filename: {
      type: String,
      trim: true
    },
    file_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    mime_type: {
      type: String,
      trim: true
    },
    size: {
      type: Number
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  module: {
    type: String,
    enum: ['wifi', 'wan', 'particularities'],
    default: 'wifi'
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
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Comments on the document
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
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add a comment to a document
DocumentSchema.methods.addComment = function(text, userId) {
  this.comments.push({
    text,
    user: userId,
    timestamp: new Date()
  });
  this.updated_at = new Date();
  this.updated_by = userId;
  return this.save();
};

module.exports = mongoose.model('Document', DocumentSchema); 