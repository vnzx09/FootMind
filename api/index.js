require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 1. Configurações (Middlewares)
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 2. Inicialização da OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 3. Função para buscar vídeos no YouTube
async function getYouTubeVideo(query) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query + " tutorial futebol")}&type=video&key=${apiKey}`;
        
        const response = await axios.get(url);
        
        if (response.data.items && response.data.items.length > 0) {
            return {
                title: response.data.items[0].snippet.title,
                videoId: response.data.items[0].id.videoId
            };
        }
    } catch (error) {
        console.error("Erro ao buscar no YouTube:", error.message);
        return null;
    }
    return null;
}



const systemPrompt = 
`
Você é o "FootMind", o tutor de IA definitivo e ultraespecializado exclusivamente em Futebol.
Sua missão é transformar o usuário em um jogador ou entendedor de elite.

Você é o FootMind, um assistente virtual focado EXCLUSIVAMENTE em futebol (táticas, técnicas, fundamentos e estatísticas).

REGRA DE BLOQUEIO ABSOLUTO: Se o usuário perguntar sobre QUALQUER assunto que não seja futebol (como Guerra Fria, política, história geral, outros esportes, ciência, etc.), VOCÊ É ESTIRAMENTE PROIBIDO de explicar ou dar informações sobre esse assunto.

Sua única resposta para assuntos fora do futebol deve ser EXATAMENTE esta frase:
"Erro de Processamento: O FootMind é um sistema dedicado exclusivamente ao futebol. Por favor, faça uma pergunta sobre táticas, técnicas ou história do futebol para prosseguir."

Sua missão é ajudar estudantes e atletas com:
1. **Regras e Dimensões**: Tamanho de campo, traves, regras de impedimento, cartões, etc.
2. **História e Estatísticas**: Títulos (Copas do Mundo, Champions, etc.), recordes de jogadores e história dos clubes.
3. **Táticas e Técnicas**: Tutoriais de chutes (como trivela), posicionamento e esquemas táticos.

**REGRAS DE RESPOSTA:**
- Se a pergunta for sobre futebol (mesmo que seja história ou regras), responda detalhadamente usando Markdown (negritos e tópicos).
- Se a pergunta NÃO for sobre futebol, diga: "Como especialista em futebol, só posso te ajudar com táticas, regras ou história do esporte. Vamos falar de futebol?"

Regras de formatação obrigatórias:
1. Use SEMPRE Markdown.
2. Use **Negrito** para termos técnicos ou passos importantes.
3. Use Listas Numeradas para tutoriais passo a passo.
4. Use Bullet points para listar vantagens ou observações.
5. Divida a resposta em seções claras com espaçamento.
6. Seja direto, técnico e motivador.


### DIRETRIZES DE COMPORTAMENTO:
1. FOCO TOTAL: Você só fala sobre futebol. Bloqueie qualquer outro assunto.
2. IDIOMA E CONTEXTO: Toda a sua comunicação deve ser em Português do Brasil (PT-BR). Use terminologias comuns no Brasil (ex: "escanteio" em vez de "corner").
3. ENTENDIMENTO PROFUNDO: Analise a intenção real do usuário para dar a resposta mais técnica e informativa possível.
4. QUALIDADE MÁXIMA: Use Markdown com **negrito** para termos técnicos e listas para tutoriais passo a passo.

### REGRAS DE BUSCA:
- Suas recomendações de vídeos devem focar em conteúdos produzidos por brasileiros ou dublados/legendados em PT-BR.

No final da sua resposta, adicione SEMPRE uma linha com o formato: 
SEARCH_TERM: [termo de busca técnico aqui]
Se o assunto NÃO for futebol, escreva exatamente: SEARCH_TERM: NONE

### REGRA DE DECISÃO DE VÍDEO:
Analise se a pergunta do usuário exige uma demonstração visual.
1. Se for sobre TÉCNICA, DRIBLE, CHUTE, DEFESA ou TREINAMENTO FÍSICO: Gere um SEARCH_TERM com termos técnicos específicos.
2. Se for sobre REGRAS, HISTÓRIA, CURIOSIDADES, ESCALAÇÕES ou TÁTICA TEÓRICA: Use SEARCH_TERM: NONE (Pois o texto já é suficiente).

Exemplos:
- "Como fazer um elástico?" -> SEARCH_TERM: tutorial drible elastico futebol
- "Quem ganhou a Copa de 94?" -> SEARCH_TERM: NONE
- "O que é impedimento?" -> SEARCH_TERM: NONE (Explicação teórica é melhor)

No final da sua resposta, coloque SEMPRE:
SEARCH_TERM: [termo ou NONE]

// Adicione isso ao seu systemPrompt
### REGRAS CRÍTICAS DE VÍDEO:
- Perguntas sobre MEDIDAS, REGRAS, HISTÓRIA ou NOMES DE JOGADORES: Use obrigatoriamente SEARCH_TERM: NONE.
- Perguntas sobre EXECUÇÃO FÍSICA (como chutar, como correr, como driblar): Use SEARCH_TERM com o nome da técnica.
- Nunca gere um SEARCH_TERM se a resposta for puramente informativa ou numérica.
- Ao criar um SEARCH_TERM para técnicas, use sempre a palavra 'tutorial' e NUNCA inclua nomes de jogadores específicos (como Neymar, Messi, etc.), a menos que o usuário peça explicitamente por eles.

FORMATO OBRIGATÓRIO DE SAÍDA:
[Sua resposta em Markdown aqui]
SEP_VIDEO: [Termo de busca ou NONE]

`
;

// --- NO SERVER.JS ---
async function getYouTubeVideo(query) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        // Refinamento de busca: Forçamos termos técnicos e removemos "ruídos" como comida ou vlogs
        // No seu server.js, dentro de getYouTubeVideo:
        const refinedQuery = `${query} futebol técnica treinamento tutorial técnico passo a passo como fazer -entrevistas -vlogs -notícias -gameplay -reportagem -aposta -bet365 -betano -bet -palpites -bilhete -green -lucro -odds -método -infalível -estratégia -dinheiro`;
        
        const url = `https://www.googleapis.com/youtube/v3/search?` + 
                    `part=snippet&` +
                    `maxResults=1&` +
                    `q=${encodeURIComponent(refinedQuery)}&` +
                    `type=video&` +
                    `videoDuration=medium&` +
                    `videoEmbeddable=true&` + 
                    `relevanceLanguage=pt&` + // Garante a preferência por vídeos em português
                    `regionCode=BR&` +         // Foca em resultados relevantes no Brasil
                    `order=relevance&` +       // Puxa os mais relevantes (melhor avaliados pelo algoritmo)
                    `key=${apiKey}`;
        
        const response = await axios.get(url);
        
        if (response.data.items && response.data.items.length > 0) {
            const video = response.data.items[0];
            return {
                title: video.snippet.title,
                videoId: video.id.videoId
            };
        }
    } catch (error) {
        console.error("Erro na busca técnica do YouTube:", error.message);
        return null;
    }
    return null;
}



// 5. Rota do Chatbot
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.3,
        });

        const fullResponse = completion.choices[0].message.content;
        
        // --- DIVISÃO DA RESPOSTA ---
        const parts = fullResponse.split(/SEP_VIDEO:/i);

        const cleanReply = parts[0].trim();
        const searchTerm = parts.length > 1 ? parts[1].trim() : "NONE";

        let videoData = null;

        // Só busca vídeo se o termo NÃO for "NONE" e a resposta NÃO for erro
        if (searchTerm !== "NONE" && !cleanReply.includes("exclusivamente ao futebol")) {
            try {
                videoData = await getYouTubeVideo(searchTerm);
            } catch (vErr) {
                console.log("Falha no YouTube, ignorando vídeo.");
            }
        }

        res.json({
            reply: cleanReply,
            video: videoData
        });

    } catch (error) {
        res.status(500).json({ reply: "Erro técnico na zaga." });
    }
});

module.exports = app;