exports.generateAIResponse = async ({ prompt, history }) => {
    const messages = [
      { role: 'system', content: prompt },
      ...history,
    ];
  
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages.slice(-6), // Последние 6 сообщений
        temperature: 0.7,
      })
    });
  
    const data = await response.json();
    return data.choices[0].message.content;
  };