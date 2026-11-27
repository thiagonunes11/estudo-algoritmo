# AGENTS.md — Guia do Projeto `estudo-algoritmo`

Este documento orienta agentes de IA e revisores humanos que forem auditar, evoluir ou adicionar novos conteúdos ao projeto **`estudo-algoritmo`** ([estudo-algoritmo.vercel.app](https://estudo-algoritmo.vercel.app/)).

---

## 1. Contexto e Objetivo do Projeto

Caderno de estudos pessoal (web app estático + 1 API serverless) feito para **retomada prática e teórica em TypeScript e Algoritmos (LeetCode)**, focado em preparação para entrevistas técnicas (live coding).

### Perfil pedagógico do conteúdo
O material foi estruturado para atacar lacunas específicas de quem está reconstruindo fluência em código puro:
1. **Memória muscular de sintaxe JS/TS:** `=` vs `===`/`!==`, declaração com `const`/`let`, `return` sem `=`, vírgulas em objetos, arrays `[]` vs parênteses `()`, grafia de `.length`.
2. **Tipos e dados:** distinguir índice (`i`) de valor (`nums[i]`), saber quais métodos pertencem a `string`, `number` e `array`, converter tipos explicitamente (`x.toString()`).
3. **Fluxo de controle em loops:** posicionamento correto de `return` dentro vs. fora do `for`, loops aninhados em 1D (`j = i + 1`) e 2D (`strs[j][i]`).
4. **Progressão de padrões de entrevista:** Força bruta → `Record` / `Map` / `Set` + Big O → Two Pointers / Sliding Window / Binary Search → Stack / Linked List.

### Dois modos de uso
- **Desktop (`> 960px`):** layout em 2 colunas (barra lateral fixa com progresso e nuvem + caderno completo) voltado para praticar no LeetCode e registrar anotações.
- **Mobile / Tablet (`<= 960px`):** experiência tipo app com barra inferior de 4 abas (**Teoria**, **Quiz**, **Vídeos**, **Desafios**), abrindo na aba **Teoria** (guia teórico rápido + flashcards de bolso) e exibindo vídeos em cards tocáveis.

---

## 2. Arquitetura e Arquivos

O projeto é intencionalmente **zero-build e zero-dependência** (sem `package.json`, sem bundler, sem framework) para manter deploy instantâneo na Vercel e manutenção simples.

```text
/
├── index.html        # App completo (HTML + CSS + JS vanilla + base de dados de aulas/vídeos/desafios/quiz)
├── api/
│   └── progress.js   # Vercel Serverless Function (CommonJS, Node 18+ fetch nativo) para sync no Upstash Redis
├── README.md         # Documentação resumida e passos de configuração na Vercel
└── AGENTS.md         # Este guia para agentes revisores/contribuidores
```

- **Hospedagem:** Vercel (`https://estudo-algoritmo.vercel.app/`), deploy automático a partir da branch `main` de `thiagonunes11/estudo-algoritmo`.
- **Persistência na nuvem:** Upstash Redis conectado via Vercel Storage.

---

## 3. Contrato de Sincronização e Dados (Não Quebrar!)

### Chaves locais (`localStorage`)
- `ts_leetcode_study_v1`: estado local do progresso.
- `ts_leetcode_sync_key_v1`: chave pessoal informada pelo usuário para sincronizar entre dispositivos.

### Formato do objeto `state` (local e Redis)
```json
{
  "challenges": { "c_1": true },
  "videos": { "v_bigo": true },
  "theory": { "t_ts_base": true },
  "notes": { "c_1": "anotação livre do usuário" },
  "updatedAt": "2026-11-27T15:15:00.000Z"
}
```

### API `/api/progress` (`api/progress.js`)
- **Env vars aceitas:** `KV_REST_API_URL` + `KV_REST_API_TOKEN` **ou** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
- **Env var opcional:** `SYNC_PIN` (se definida na Vercel, restringe o endpoint apenas àquela chave via `crypto.timingSafeEqual`).
- **Header obrigatório:** `x-sync-key` (4 a 128 caracteres). A chave Redis é derivada com `SHA-256` (`study:progress:<hash>`).
- **Métodos:**
  - `GET /api/progress` → `{ exists: boolean, state: object | null }`
  - `POST /api/progress` → valida/sanitiza o payload (máx. 64 KB), grava no Redis e retorna `{ ok: true, updatedAt }`.
- **Importante:** se você adicionar novos campos ao `state` no frontend (ex: `flashcards`, `spacedRepetition`, `quizStats`), **atualize também** `sanitized` em `api/progress.js`, `loadState()` e `pullFromCloud()` em `index.html`, sempre usando fallback `|| {}` para preservar retrocompatibilidade com dados já salvos no Redis.

### Regras invioláveis de comportamento
1. **Dispositivos novos devem sempre começar zerados (`0%`).** Nunca pré-marcar desafios, vídeos ou lições por padrão em `loadState()`.
2. **Nunca renomear ou remover IDs existentes** (`c_1`, `c_9`, `c_13`, `c_14`, `c_217`, `c_242`, `c_1_opt`, `c_125`, `c_121`, `c_704`, `c_20`, `c_21`, `c_206`, `t_*`, `v_*`), pois eles já estão persistidos no Redis do usuário.
3. **Sem botões manuais redundantes de export/import de backup** (já foram removidos porque a sincronização automática no Redis substituiu esse fluxo).

---

## 4. Convenções de Código, Conteúdo e Design

### Estrutura de dados em `index.html`
Todas as coleções ficam no topo do `<script>`:
- `THEORY_LESSONS` (6 lições teóricas com HTML interno e checkbox de leitura).
- `FLASHCARDS` (12 cartões pergunta/resposta para revisão rápida no mobile).
- `VIDEOS` (33 vídeos indexados com `id`, `phase`, `category`, `lang`, `channel`, `title`, `url`).
- `PHASES` (4 fases contendo 13 desafios do LeetCode com dicas sem spoiler, pegadinhas de TypeScript e IDs de vídeos).
- `QUIZ` (12 perguntas: 6 de sintaxe TS/JS + 6 de teoria/padrões).

### Qualidade de links (Regra rígida)
- **Nunca invente URLs do YouTube ou LeetCode.**
- Todo novo vídeo adicionado em `VIDEOS` deve ser verificado antes (por exemplo via `https://www.youtube.com/oembed?url=<URL>&format=json` retornando HTTP 200) para garantir que o vídeo existe e o título/canal conferem.

### Design e Responsividade
- **Paleta (`:root`):** fundo frio `#F3F6FA`, cartões `#FFFFFF`, texto `#131B26`, destaque TypeScript `#1D5BD6`, concluído `#147D52`, alertas de pegadinha `#B45309`.
- **Tipografia:** `Plus Jakarta Sans` (interface/leitura) + `JetBrains Mono` (blocos de código).
- **Mobile (`<= 960px`):**
  - Manter `font-size >= 16px` em `<input>` e `<textarea>` para evitar zoom automático no iOS Safari.
  - Garantir `overflow-x: hidden` no `body` e scroll horizontal contido apenas dentro de `<pre>` / blocos de código.
  - Manter alvos de toque confortáveis (`>= 42px`) e suporte a `env(safe-area-inset-bottom)` na barra inferior.

---

## 5. Checklist de Verificação Antes de Commitar

Antes de subir qualquer alteração para `main`:

1. Validar sintaxe da API:
   ```bash
   node --check api/progress.js
   ```
2. Validar o JavaScript inline de `index.html` (extraindo o conteúdo de `<script>...</script>` e executando `node --check`).
3. Conferir que nenhum ID existente de `THEORY_LESSONS`, `VIDEOS` ou `PHASES[].challenges` foi alterado.
4. Conferir que novos dispositivos (com `localStorage` limpo) iniciam em `0%`.
5. Verificar links novos de YouTube (sem 404) e responsividade em telas de `375px` (celular), `768px` (tablet) e `1280px+` (desktop).

---

## 6. Sugestões de Evolução para Próximos Agentes

Se o usuário pedir melhorias ou revisões abertas, estas são extensões de alto valor alinhadas ao projeto:

- **PWA instalável no celular:** adicionar `manifest.json` + ícones para abrir em tela cheia na tela inicial do Android/iOS.
- **Revisão espaçada (Spaced Repetition):** registrar data de conclusão (`completedAt`) por desafio e destacar automaticamente itens prontos para revisão em **48h** e **7 dias**.
- **Simulador visual de teste de mesa:** componente interativo passo a passo (botão "Próximo passo") mostrando `i`, `j`, variáveis e estado do `Map`/`Stack` em problemas clássicos (`Two Sum`, `Roman to Integer`, `Valid Parentheses`).
- **Timer de entrevista (20 min):** cronômetro simples por desafio para treinar sob tempo sem sair da página.
- **Novas fases (Fase 5 e Fase 6):** expandir a trilha quando o usuário concluir a Fase 4 (ex: Árvores Binárias / BFS & DFS, Heap e Programação Dinâmica introdutória), acompanhadas de novas lições teóricas, flashcards e vídeos verificados.
- **Proteção contra conflito de edição multi-dispositivo:** comparar `updatedAt` antes de sobrescrever no `POST /api/progress` (ou mesclar campos) caso o usuário deixe duas abas abertas por muito tempo.
