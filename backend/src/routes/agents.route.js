const express = require('express');
const multer = require('multer');
const { createAgent, getAgents } = require('../controllers/agents.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('avatar'), createAgent);
router.get('/', getAgents);

module.exports = router;