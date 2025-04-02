const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const Site = require('../models/Site');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create GridFS storage engine for file uploads
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/passchef',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Generate a random filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

// Set up multer with storage
const upload = multer({ storage });

// @route    GET /api/documents
// @desc     Get all documents (filtered by site and/or module)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const { site_id, module } = req.query;
    let query = {};
    
    // Filter by site if provided
    if (site_id) {
      query.site_id = site_id;
    }
    
    // Filter by module if provided
    if (module) {
      query.module = module;
    }
    
    const documents = await Document.find(query).sort({ created_at: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/documents/:id
// @desc     Get document by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST /api/documents/external
// @desc     Create a new document record for external URL
// @access   Private
router.post('/external', auth, async (req, res) => {
  try {
    const {
      site_id,
      name,
      type,
      description,
      url,
      module,
      tags
    } = req.body;
    
    // Verify site exists
    const site = await Site.findById(site_id);
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Create new document
    const newDocument = new Document({
      site_id,
      name,
      type,
      description,
      is_external: true,
      url,
      module: module || 'wifi',
      tags,
      created_by: req.user.id
    });
    
    const document = await newDocument.save();
    
    // Add event to site history
    site.addEvent('document_added', req.user.id, `New document added: ${name} (external link)`);
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST /api/documents/upload
// @desc     Upload a new document file
// @access   Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    const {
      site_id,
      name,
      type,
      description,
      module,
      tags
    } = req.body;
    
    // Verify site exists
    const site = await Site.findById(site_id);
    if (!site) {
      return res.status(404).json({ msg: 'Site not found' });
    }
    
    // Create new document
    const newDocument = new Document({
      site_id,
      name: name || req.file.originalname,
      type,
      description,
      is_external: false,
      file_info: {
        filename: req.file.filename,
        file_id: req.file.id,
        mime_type: req.file.mimetype,
        size: req.file.size
      },
      module: module || 'wifi',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      created_by: req.user.id
    });
    
    const document = await newDocument.save();
    
    // Add event to site history
    site.addEvent('document_added', req.user.id, `New document uploaded: ${newDocument.name}`);
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST /api/documents/:id/comment
// @desc     Add a comment to a document
// @access   Private
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }
    
    // Add comment
    document.comments.push({
      text,
      user: req.user.id,
      timestamp: new Date()
    });
    
    document.updated_at = new Date();
    document.updated_by = req.user.id;
    
    await document.save();
    
    res.json(document.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route    DELETE /api/documents/:id
// @desc     Delete a document
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Get site info for event logging before deleting document
    const site_id = document.site_id;
    const docName = document.name;
    
    // If it's a stored file, remove from GridFS (placeholder for actual implementation)
    if (!document.is_external && document.file_info && document.file_info.file_id) {
      // TODO: Implement file deletion from GridFS
      // const gfs = new mongoose.mongo.GridFSBucket(...);
      // gfs.delete(document.file_info.file_id);
    }
    
    await document.deleteOne();
    
    // Log event to site history
    const site = await Site.findById(site_id);
    if (site) {
      site.addEvent('document_added', req.user.id, `Document removed: ${docName}`);
    }
    
    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 