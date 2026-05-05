// --- Lógica de Navegação das Abas ---
function mudarAba(evento, idAba) {
    // Remove a classe 'active' de todos os links e seções
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(secao => secao.classList.remove('active'));

    // Adiciona a classe 'active' na aba clicada
    evento.target.classList.add('active');
    document.getElementById(idAba).classList.add('active');
}

// --- Lógica do Chatbot integrada com sua API ---
async function enviarMensagem() {
    const inputField = document.getElementById('user-input');
    const mensagem = inputField.value.trim();
    const chatBox = document.getElementById('chat-box');

    if (mensagem === "") return;

    // 1. Mostrar mensagem do usuário
    chatBox.innerHTML += `<div class="message user">${mensagem}</div>`;
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. Mostrar indicador de digitando
    const idCarregando = "msg-" + Date.now();
    chatBox.innerHTML += `<div class="message bot" id="${idCarregando}">Processando dados táticos...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // 3. Fazer a chamada para o SEU servidor Node.js local na porta 3000
        const resposta = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: mensagem })
        });

        const dados = await resposta.json();

        // 4. Remover o texto "Processando..."
        document.getElementById(idCarregando).remove();

        // 5. Inserir resposta formatada da IA 
        // (Troca as quebras de linha '\n' por '<br>' para o HTML entender)
        let msgHtml = `<div class="message bot"><strong>FootMind:</strong><br><br>${dados.reply.replace(/\n/g, '<br>')}</div>`;
        
        // 6. Se a IA enviou um vídeo do YouTube, anexar na resposta
        if (dados.video && dados.video !== "NONE") {
            msgHtml += `
            <div class="message bot">
                <div class="video-container">
                    <iframe width="100%" height="250" src="${dados.video}" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>`;
        }

        chatBox.innerHTML += msgHtml;
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (erro) {
        document.getElementById(idCarregando).remove();
        chatBox.innerHTML += `<div class="message bot">Erro de conexão: Verifique se o servidor Node.js está rodando.</div>`;
        console.error("Erro na API:", erro);
    }
}

// Permitir enviar apertando a tecla Enter
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        enviarMensagem();
    }
}