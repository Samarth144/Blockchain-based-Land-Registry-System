document.addEventListener('DOMContentLoaded', function () {
    setupAIChat();

    document.getElementById('analyzeDocumentForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        const resultDiv = document.getElementById('documentAnalysisResult');
        const contentDiv = document.getElementById('analysisResultsContent');
        resultDiv.style.display = 'block';
        contentDiv.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Analyzing document...</p>
            </div>
        `;

        fetch("http://localhost:8000/api/document/analyze", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            contentDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i> Document analysis completed successfully!
                </div>
                <h6>AI Result:</h6>
                <p>${data.response}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            contentDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Failed to analyze document.
                </div>
            `;
        });
    });

    loadQueryHistory();
});

function setupAIChat() {
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiQueryInput');
    const chatContainer = document.getElementById('chatContainer');

    if (!chatForm || !chatInput || !chatContainer) return;

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const question = chatInput.value.trim();
        if (!question) return;

        addChatMessage('user', question);
        chatInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message ai-message typing';
        typingIndicator.innerHTML = `
            <div class="message-header">
                <strong>Land Registry AI</strong>
            </div>
            <div class="message-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatContainer.appendChild(typingIndicator);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // ✅ Send prompt to backend DeepSeek API
        fetch("http://localhost:8000/api/deepseek/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatPrompt: question,
                conversationId: "user-session", // optional
                documentType: null,
                questions: []
            })
        })
        .then(response => response.text())
        .then(answer => {
            document.querySelector('.typing')?.remove();
            addChatMessage('ai', answer);
            addToQueryHistory(question);
        })
        .catch(error => {
            document.querySelector('.typing')?.remove();
            addChatMessage('ai', "❌ Error: Failed to fetch AI response.");
            console.error(error);
        });
    });
}

function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-header">
            <strong>${sender === 'user' ? 'You' : 'Land Registry AI'}</strong>
            <small class="text-muted">${formatDateTime(new Date().toISOString())}</small>
        </div>
        <div class="message-content">
            ${message}
        </div>
    `;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function loadQueryHistory(page = 1, pageSize = 10) {
    const queryHistory = Array.from({ length: pageSize }, (_, i) => ({
        id: `Q-${new Date().getFullYear()}-${100 + i + (page - 1) * pageSize}`,
        date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString(),
        query: ['How to transfer land ownership?', 'What documents needed for dispute?',
            'Check status of survey #L-2023-4567', 'Verify deed authenticity',
            'Steps to register new land'][Math.floor(Math.random() * 5)],
        document: Math.random() > 0.7 ? `DOC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}` : null
    }));

    const tableBody = document.getElementById('queryHistoryTable');
    if (tableBody) {
        tableBody.innerHTML = queryHistory.map(item => `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.query}</td>
                <td>${item.document || 'None'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-redo"></i> Repeat
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function addToQueryHistory(query) {
    console.log('Add to query history:', query);
}

function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(isoDateTime) {
    return new Date(isoDateTime).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
