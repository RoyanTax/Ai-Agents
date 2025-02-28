const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { generateAIResponse } = require('../services/deepseek.service');
const { getChatHistory, sendMessage } = require('../controllers/chats.controller');

// Получение истории чата
router.get('/:agentId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM chats 
       WHERE agent_id = $1 AND user_id = $2
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.params.agentId, 1] // Заглушка для user_id
    );
    res.json(rows[0] || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отправка сообщения
router.post('/:agentId', async (req, res) => {
  const { message } = req.body;
  
  try {
    // 1. Получаем промт агента
    const agent = await pool.query(
      'SELECT prompt FROM agents WHERE id = $1',
      [req.params.agentId]
    );

    // 2. Получаем историю сообщений
    const chat = await pool.query(
      `INSERT INTO chats (agent_id, user_id, messages)
       VALUES ($1, $2, $3)
       ON CONFLICT (agent_id, user_id) 
       DO UPDATE SET messages = chats.messages || $3
       RETURNING *`,
      [req.params.agentId, 1, JSON.stringify([{ role: 'user', content: message }])]
    );

    // 3. Генерируем ответ
    const aiResponse = await generateAIResponse({
      prompt: agent.rows[0].prompt,
      history: chat.rows[0].messages
    });

// Маршрут для получения истории чата
router.get('/:agentId', getChatHistory);
// Маршрут для отправки сообщения
router.post('/:agentId', sendMessage);

    // 4. Сохраняем ответ
    await pool.query(
      `UPDATE chats SET 
       messages = messages || $1,
       updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify([{ role: 'assistant', content: aiResponse }]), chat.rows[0].id]
    );

    res.json({ message: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;