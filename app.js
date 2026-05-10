class AIChat {
    constructor() {
        this.messages = [];
        this.apiKey = 'sk-561117e8da224224aa16de0425c4ae48';
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.model = 'deepseek-chat';
        this.isLoading = false;
        
        this.initElements();
        this.initEventListeners();
        this.loadTheme();
    }

    initElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.status = document.getElementById('status');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeModal = document.getElementById('closeModal');
        this.saveSettings = document.getElementById('saveSettings');
        this.modelSelect = document.getElementById('model');
        this.themeToggle = document.getElementById('themeToggle');
        this.promptBtns = document.querySelectorAll('.prompt-btn');
    }

    initEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.userInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.userInput.value.trim();
        });

        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.modalOverlay.addEventListener('click', () => this.closeSettings());
        this.closeModal.addEventListener('click', () => this.closeSettings());
        this.saveSettings.addEventListener('click', () => this.saveApiSettings());

        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.promptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.userInput.value = btn.dataset.prompt;
                this.sendBtn.disabled = false;
                this.sendMessage();
            });
        });
    }

    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    openSettings() {
        this.modelSelect.value = this.model;
        this.settingsModal.classList.add('active');
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    saveApiSettings() {
        this.model = this.modelSelect.value;
        this.closeSettings();
        this.setStatus('设置已保存', false);
    }

    setStatus(text, isError = false) {
        this.status.textContent = text;
        this.status.className = isError ? 'status error' : 'status';
    }

    async sendMessage() {
        const text = this.userInput.value.trim();
        if (!text || this.isLoading) return;

        if (!this.apiKey) {
            this.openSettings();
            this.setStatus('请先配置 API Key', true);
            return;
        }

        this.userInput.value = '';
        this.sendBtn.disabled = true;
        this.isLoading = true;
        this.setStatus('正在思考...');

        this.addMessage('user', text);
        this.messages.push({ role: 'user', content: text });

        const loadingElement = this.createLoadingElement();
        this.chatMessages.appendChild(loadingElement);
        this.scrollToBottom();

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: this.messages,
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            loadingElement.remove();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || '未收到响应';
            
            this.messages.push({ role: 'assistant', content: aiResponse });
            this.addMessage('assistant', aiResponse);
            this.setStatus('已就绪');
        } catch (error) {
            this.setStatus('错误: ' + error.message, true);
            this.addMessage('assistant', '抱歉，发生了错误：' + error.message);
        } finally {
            this.isLoading = false;
            this.scrollToBottom();
        }
    }

    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'user' 
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.innerHTML = this.formatMessage(content);
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(contentElement);
        this.chatMessages.appendChild(messageElement);
    }

    formatMessage(text) {
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
        });
        
        text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        text = text.replace(/####\s(.+)/g, '<h4>$1</h4>');
        text = text.replace(/###\s(.+)/g, '<h3>$1</h3>');
        text = text.replace(/##\s(.+)/g, '<h2>$2</h2>');
        text = text.replace(/#\s(.+)/g, '<h1>$1</h1>');
        
        text = text.replace(/^\s*[-*+]\s(.+)$/gm, '<li>$1</li>');
        
        text = text.replace(/^\s*\d+\.\s(.+)$/gm, '<li>$1</li>');
        
        text = text.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
        
        text = text.replace(/^\s*>\s(.+)$/gm, '<blockquote>$1</blockquote>');
        
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    createLoadingElement() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message assistant';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content loading-indicator';
        contentElement.innerHTML = `
            <div class="loading-text">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
            </div>
        `;
        
        loadingElement.appendChild(avatar);
        loadingElement.appendChild(contentElement);
        return loadingElement;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const searchQuery = params.get('search');
        if (searchQuery) {
            this.userInput.value = searchQuery;
            this.sendBtn.disabled = false;
            this.sendMessage();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chat = new AIChat();
    chat.checkUrlParams();
});