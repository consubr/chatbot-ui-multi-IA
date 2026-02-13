prompt: estou estudando o projeto agora e pretendo utilizar este como base para construção de novas funcionalidades, o que mais você pode detalhar para me que eu possa ter menos dificuldade para adaptá-lo as minhas necessidades?

# Guia de Adaptação e Desenvolvimento

Este guia foi criado para ajudar você a modificar e estender o **Chatbot UI Multi-IA** com facilidade. Ele foca nos padrões de código, gerenciamento de estado e pontos de extensão.

## 1. Gerenciamento de Estado Global

O projeto não usa Redux ou Zustand. Todo o estado global é gerenciado via **React Context** em `context/context.tsx`.

*   **Arquivo Principal**: `context/context.tsx`
*   **Como Funciona**: Um único contexto `ChatbotUIContext` armazena tudo: perfil do usuário, lista de chats, configurações, inputs, arquivos, etc.
*   **Dica de Adaptação**: Se você criar uma nova "feature" global (ex: um sistema de notificações), você deve:
    1.  Adicionar o estado e o `setEstado` na interface `ChatbotUIContext` em `context/context.tsx`.
    2.  Adicionar o valor inicial no `createContext`.
    3.  Adicionar o estado no componente `GlobalState` (provavelmente em `app/[locale]/layout.tsx` ou similar, onde o provider é instanciado).
    4.  Consumir via `useContext(ChatbotUIContext)` em qualquer componente.

## 2. Fluxo do Chat (O "Cérebro" da Aplicação)

A lógica de envio de mensagem, processamento e resposta *não* está no componente visual `ChatUI`, mas sim em um **Custom Hook**.

*   **Localização**: `components/chat/chat-hooks/use-chat-handler.tsx`
*   **Função Principal**: `handleSendMessage`
*   **O que ela faz**:
    1.  Cria mensagens temporárias (optimistic UI) para o usuário e assistente.
    2.  Verifica se há arquivos para processar (RAG/Retrieval).
    3.  Decide se chama uma API de "Tools" (ferramentas) ou direto a API de Chat (`handleHostedChat` ou `handleLocalChat`).
    4.  Gerencia o `AbortController` para permitir cancelar a geração.
    5.  Salva as mensagens no Supabase após o sucesso.

**Para mudar o comportamento do chat (ex: adicionar um passo de verificação antes de enviar):** Edite `use-chat-handler.tsx`.

## 3. Camada de Dados (Database)

O projeto usa a biblioteca `js` do Supabase diretamente, mas encapsula as chamadas em funções utilitárias na pasta `db/`.

*   **Padrão**: Cada entidade do banco (chats, mensagens, prompts) tem seu próprio arquivo em `db/` (ex: `db/chats.ts`, `db/messages.ts`).
*   **Client vs Server**: A maioria dessas funções usa `supabase/browser-client.ts`, rodando no lado do cliente (browser).
*   **Segurança**: A segurança é garantida pelas **RLS (Row Level Security)** do Postgres no Supabase. O frontend *pode* tentar buscar tudo, mas o banco só retorna o que o usuário tem permissão para ver.

**Ao criar nova tabela**:
1.  Crie a migration SQL em `supabase/migrations/`.
2.  Rode `npm run db-types` para atualizar os tipos TypeScript (`supabase/types.ts`).
3.  Crie um arquivo em `db/nova-entidade.ts` com funções CRUD (Create, Read, Update, Delete).

## 4. Onde Adicionar Novas Funcionalidades

### Adicionar um Novo Modelo de IA
1.  **Tipagem**: Adicione o ID do modelo em `types/llms.ts`.
2.  **Lista**: Adicione as configurações padrão (preço, tokens) em `lib/models/llm/llm-list.ts`.
3.  **Backend**: Se for um provedor novo (não OpenAI/Anthropic), crie uma rota em `app/api/chat/[novo-provedor]/route.ts`.

### Adicionar um Novo Botão na Interface de Chat
*   Vá para `components/chat/chat-ui.tsx`. Este é o componente visual que monta a tela.
*   Os inputs e comandos ficam em `components/chat/chat-input.tsx`.

### Alterar a Aparência (CSS)
*   O projeto usa **Tailwind CSS**.
*   As classes globais estão em `app/globals.css`.
*   Suporte a **Dark Mode** é nativo (`dark:` classes do Tailwind).

## 5. Dicas "Gotchas" (Cuidado com isso)

*   **Variáveis de Ambiente**: Se você adicionar uma nova chave de API, lembre-se de adicionar em `.env.local` E também em `types/valid-keys.ts` para que a validação funcione.
*   **Middleware**: O arquivo `middleware.ts` na raiz protege as rotas. Se criar uma página pública nova, adicione-a à lista de exceções no middleware ou a autenticação do Supabase irá bloquear o acesso.
*   **Tipos do Banco**: Sempre que mudar o banco, rode `npm run db-types`. Se não fizer isso, o TypeScript vai reclamar que os campos novos não existem.

## Resumo para o Desenvolvedor

| Quero alterar... | Onde ir? |
| :--- | :--- |
| **Estado Global / Contexto** | `context/context.tsx` |
| **Lógica de Envio de Mensagem** | `components/chat/chat-hooks/use-chat-handler.tsx` |
| **Interface Visual do Chat** | `components/chat/chat-ui.tsx` |
| **Consultas ao Banco** | Pasta `db/` |
| **Rotas de API (Backend)** | `app/api/` |
| **Modelos Suportados** | `types/llms.ts` e `lib/models/llm/llm-list.ts` |
