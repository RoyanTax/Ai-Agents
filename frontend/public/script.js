let currentView = 'agents';

async function showView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}View`);
    });
    
    if(viewName === 'agents') {
        await loadAgents();
    }
}

async function loadAgents() {
    try {
        const response = await fetch('http://localhost:3000/api/agents');
        const agents = await response.json();
        renderAgents(agents);
    } catch (error) {
        console.error('Error loading agents:', error);
    }
}

function renderAgents(agents) {
    const container = document.getElementById('agentsList');
    container.innerHTML = agents.map(agent => `
        <div class="agent-card">
            <img src="${agent.avatar_url}" alt="${agent.name}">
            <h3>${agent.name}</h3>
            <p>${agent.description}</p>
            <div class="prompt">${agent.prompt.substring(0, 50)}...</div>
        </div>
    `).join('');
}

let currentChatAgent = null;

// Открытие чата
function openChat(agentId, agentName, avatarUrl) {
  currentChatAgent = { id: agentId, name: agentName, avatar: avatarUrl };
  
  document.body.innerHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <img src="${avatarUrl}" class="agent-avatar">
        <h3>${agentName}</h3>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input">
        <input type="text" id="messageInput" placeholder="Напишите сообщение...">
        <button onclick="sendMessage()">Отправить</button>
      </div>
    </div>
    <button class="back-button" onclick="showView('agents')">← Назад</button>
  `;

  loadChatHistory();
}

// Загрузка истории
async function loadChatHistory() {
  try {
    const response = await fetch(`http://localhost:3000/api/chats/${currentChatAgent.id}`);
    const { messages } = await response.json();
    
    const container = document.getElementById('chatMessages');
    container.innerHTML = messages.map(msg => `
      <div class="message ${msg.role}">
        ${msg.role === 'assistant' ? 
          `<img src="${currentChatAgent.avatar}">` : 
          '<div class="user-icon">👤</div>'}
        <div class="content">${msg.content}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Ошибка загрузки чата:', error);
  }
}

// Отправка сообщения
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;

  try {
    await fetch(`http://localhost:3000/api/chats/${currentChatAgent.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    input.value = '';
    await loadChatHistory();
  } catch (error) {
    console.error('Ошибка отправки:', error);
  }
}

// Обновление рендера агентов
function renderAgents(agents) {
  const container = document.getElementById('agentsList');
  container.innerHTML = agents.map(agent => `
    <div class="agent-card" onclick="openChat(${agent.id}, '${agent.name}', '${agent.avatar_url}')">
      <img src="${agent.avatar_url}" alt="${agent.name}">
      <h3>${agent.name}</h3>
      <p>${agent.description}</p>
    </div>
  `).join('');
}

document.getElementById('agentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('agentName').value);
    formData.append('prompt', document.getElementById('rolePrompt').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('avatar', document.getElementById('avatar').files[0]);

    try {
        const response = await fetch('http://localhost:3000/api/agents', {
            method: 'POST',
            body: formData
        });
        
        if(response.ok) {
            alert('Agent created successfully!');
            showView('agents');
        }
    } catch (error) {
        console.error('Error creating agent:', error);
    }
});

// Initial load
showView('agents');