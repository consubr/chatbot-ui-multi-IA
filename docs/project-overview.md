prompt: eu quero entender melhor este projeto, o que ele é,  quais tecnologias são usadas, como os servicos são conectados e quais são as funcionalidades principais, gere a resposta em um arquivo markdown

# Visão Geral do Projeto: Chatbot UI Multi-IA

Este projeto é uma bifurcação (fork) ou evolução do popular **Chatbot UI**, uma interface de chat avançada e clone do ChatGPT, projetada para suportar múltiplos modelos de Inteligência Artificial (Multi-IA).

Ele permite que usuários interajam com diversos modelos de linguagem (LLMs) de diferentes provedores (como OpenAI, Google, Anthropic, Mistral, etc.) em uma interface unificada, com suporte a histórico de conversas, assistentes personalizados e upload de arquivos.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma stack moderna e robusta, focada em performance e escalabilidade:

### Frontend
- **Next.js 14**: Framework React utilizando o **App Router** para roteamento e renderização do lado do servidor (SSR).
- **React**: Biblioteca para construção da interface.
- **TypeScript**: Linguagem principal, garantindo tipagem estática e segurança no código.
- **Tailwind CSS**: Framework de estilização utilitária.
- **Radix UI**: Componentes acessíveis e sem estilo (headless) para a base da interface (modais, menus, etc.).
- **Lucide React**: Biblioteca de ícones.

### Backend & Dados
- **Supabase**: Plataforma Backend-as-a-Service (BaaS) que fornece:
  - **PostgreSQL**: Banco de dados relacional para armazenar chats, mensagens, usuários e configurações.
  - **Authentication**: Sistema de login e gestão de usuários.
  - **Storage**: Armazenamento de arquivos (para upload de documentos e imagens).
  - **Vector Store**: Suporte a vetores (via extensão `pgvector`) para funcionalidades de RAG (Retrieval Augmented Generation).

### Inteligência Artificial
- **Vercel AI SDK (`ai`)**: Biblioteca padrão para lidar com streams de respostas de IA de forma eficiente no Next.js.
- **LangChain**: Integração para fluxos mais complexos de IA.
- **SDKs Oficiais**:
  - `openai` (OpenAI)
  - `@google/generative-ai` (Gemini)
  - `@anthropic-ai/sdk` (Claude)
  - `@mistralai/mistralai` (Mistral)
- **Ollama**: Suporte para rodar modelos locais (Llama 3, Mistral, etc.).

## 🔗 Arquitetura e Conexão dos Serviços

O fluxo de dados funciona da seguinte maneira:

1.  **Interface do Usuário (UI)**: O usuário envia uma mensagem através do componente de chat (`components/chat/chat-ui.tsx`).
2.  **API Routes (Next.js)**: A aplicação possui rotas de API dedicadas para cada provedor em `app/api/chat/[provider]`. Por exemplo:
    - `app/api/chat/openai/route.ts` processa requisições para GPT-4/GPT-3.5.
    - `app/api/chat/google/route.ts` processa requisições para Gemini.
3.  **Processamento da Requisição**:
    - A rota API verifica a sessão do usuário e as chaves de API (armazenadas no perfil do usuário no Supabase ou variáveis de ambiente).
    - O backend utiliza o SDK apropriado para enviar o prompt ao provedor (ex: OpenAI API).
4.  **Streaming**: A resposta da IA é retornada via **Streaming** para o frontend, permitindo que o usuário veja o texto sendo gerado em tempo real (efeito de digitação).
5.  **Persistência**: As conversas e mensagens são salvas no banco de dados **Supabase** para histórico e contexto futuro.

## ✨ Funcionalidades Principais

1.  **Multi-IA / Multi-Modelos**:
    - Suporte nativo para **GPT-4o**, **Claude 3.5 Sonnet**, **Gemini 1.5 Pro**, **Llama 3** (via Groq ou Ollama), **Mistral**, e **Perplexity**.
    - O usuário pode alternar entre modelos facilmente nas configurações do chat.

2.  **Assistentes Personalizados (Assistants)**:
    - Criação de "personas" ou assistentes com instruções de sistema específicas (similar aos GPTs da OpenAI).
    - Definição de arquivos de contexto específicos para cada assistente.

3.  **Chat com Arquivos (RAG)**:
    - Upload de arquivos (PDF, TXT, MD, etc.).
    - O sistema processa o texto, gera embeddings e permite que a IA responda perguntas baseadas no conteúdo dos documentos.

4.  **Organização e Gestão**:
    - **Pastas**: Organização de chats, prompts e arquivos em pastas.
    - **Workspaces**: Ambientes de trabalho separados (evidenciado pelos arquivos de migração `add_workspaces`).

5.  **Prompt Library**:
    - Salvar e reutilizar prompts comuns.

6.  **Plugins / Ferramentas**:
    - Estrutura para dar "ferramentas" à IA (ex: busca na web, geração de imagens), visível nas migrações do banco de dados (`add_tools.sql`).

## 📂 Estrutura de Pastas Importantes

- `app/`: Rotas da aplicação (Next.js App Router).
  - `api/chat/`: Rotas de backend para cada modelo de IA.
  - `[locale]/`: Rotas de frontend com suporte a internacionalização.
- `components/`: Componentes React modulares.
  - `chat/`: Componentes específicos da interface de chat.
- `db/`: Configurações e definições do banco de dados local.
- `supabase/migrations/`: Arquivos SQL que definem a estrutura do banco de dados.
- `types/`: Definições de tipos TypeScript, crucial para entender os modelos suportados (`llms.ts`).
