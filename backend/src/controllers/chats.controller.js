exports.getChatHistory = async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT messages FROM chats 
         WHERE agent_id = $1 AND user_id = $2
         ORDER BY created_at DESC 
         LIMIT 1`,
        [req.params.agentId, 1] // Заглушка для user_id
      );
      
      const messages = rows[0]?.messages || [];
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };