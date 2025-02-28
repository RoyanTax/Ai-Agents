// backend/src/controllers/agents.controller.js
const { uploadImage } = require('../services/storage.service');
const pool = require('../config/db');

exports.createAgent = async (req, res) => {
  try {
    const { name, prompt, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Avatar is required' });
    }

    const avatarUrl = await uploadImage(req.file);
    
    const { rows } = await pool.query(
      `INSERT INTO agents (name, prompt, description, avatar_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, prompt, description, avatarUrl]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgents = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM agents');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};