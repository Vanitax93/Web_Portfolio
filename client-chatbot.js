document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    const chatAvatar = document.getElementById('chat-avatar'); // Get the avatar SVG

    if (!toggleButton) return; // Exit if chatbot elements aren't in the DOM

    // --- 1. Toggle Functionality ---
    toggleButton.addEventListener('click', () => {
        const isHidden = chatWindow.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', !isHidden);
        if (!isHidden) {
            chatInput.focus();
            scrollChatToBottom();
        }
    });

    // --- 2. Message Sending Logic ---
    const sendMessage = async () => {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        appendMessage(userMessage, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        chatSendButton.disabled = true;

        // --- AVATAR STATE: THINKING ---
        chatAvatar.classList.add('is-thinking');

        try {
            // 🚨 CRITICAL FIX: Changed path to the guaranteed Netlify Functions path
            const response = await fetch('/.netlify/functions/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage })
            });

            if (!response.ok) {
                // If we get a response but it's an error (4xx or 5xx), throw to enter catch block
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponseText = data.response;

            appendMessage(botResponseText, 'bot');

            // --- AVATAR STATE: TALKING then IDLE ---
            chatAvatar.classList.remove('is-thinking');
            chatAvatar.classList.add('is-talking');

            // Simulate talking duration
            setTimeout(() => {
                chatAvatar.classList.remove('is-talking');
            }, 2500); // Let the avatar "talk" for 2.5 seconds

        } catch (error) {
            console.error('Chatbot Error:', error);
            // Default message if the fetch completely fails or hits a 404/500
            const errorMessage = "I'm having trouble connecting right now. Please try again later. (Check console for path errors)";
            appendMessage(errorMessage, 'bot');
            // --- AVATAR STATE: return to idle on error ---
            chatAvatar.classList.remove('is-thinking');

        } finally {
            chatInput.disabled = false;
            chatSendButton.disabled = false;
            chatInput.focus();
            scrollChatToBottom();
        }
    };

    // --- 3. Utility Functions ---
    const appendMessage = (text, sender) => {
        const messageElement = document.createElement('p');
        messageElement.classList.add(`${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        scrollChatToBottom(); // Scroll after every new message is added
        return messageElement;
    };

    const scrollChatToBottom = () => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Trigger on button click or Enter key press
    chatSendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevents form submission/newline
            sendMessage();
        }
    });
});
