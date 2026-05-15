const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Função para adicionar mensagem na tela
function appendMessage(sender, text, videoHtml = "") {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // O segredo está aqui: marked.parse transforma o Markdown em HTML
    contentDiv.innerHTML = marked.parse(text);

    if (videoHtml) {
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-container');
        videoWrapper.innerHTML = videoHtml;
        contentDiv.appendChild(videoWrapper);
    }

    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Função principal de envio
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';

    appendMessage('bot', 'Analisando tática...');
    const typingMessage = chatBox.lastChild;

    try {
        const response = await fetch("https://foot-mind.vercel.app/api/chat", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text }) // ou { prompt: text } dependendo do seu server
        });

        const data = await response.json();
        
        // ISSO VAI TE SALVAR: Mostra no F12 exatamente o que o servidor mandou
        console.log("Resposta recebida do servidor:", data); 

        chatBox.removeChild(typingMessage);

        // --- SISTEMA À PROVA DE FALHAS PARA ENCONTRAR O VÍDEO ---
        let videoFrame = "";
        let idDoVideo = null;

        if (data.video) {
            // Tenta achar o ID nas 3 estruturas mais comuns (YouTube API ou yt-search)
            if (data.video.id && data.video.id.videoId) {
                idDoVideo = data.video.id.videoId; // Padrão oficial do Google
            } else if (data.video.videoId) {
                idDoVideo = data.video.videoId;    // Padrão do yt-search
            } else if (typeof data.video === 'string') {
                idDoVideo = data.video;            // Caso você mande só a string
            }
        }

        // Se encontrou um ID válido, monta o iframe
        if (idDoVideo) {
            videoFrame = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${idDoVideo}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px; margin-top: 15px;"></iframe>`;
        }
        // --------------------------------------------------------

        // Usa data.reply (ou o nome da variável que vem do seu servidor)
        appendMessage('bot', data.reply || "Resposta não encontrada.", videoFrame);

    } catch (error) {
        console.error("Erro na comunicação com o backend:", error);
        if (typingMessage) chatBox.removeChild(typingMessage);
        appendMessage('bot', 'Ocorreu um erro de conexão.');
    }
}

// Escuta o clique no botão
sendBtn.addEventListener('click', sendMessage);

// Escuta a tecla "Enter" no teclado
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});