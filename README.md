# Trilha de Estudo — TypeScript & LeetCode

Caderno interativo de retomada em **TypeScript e Algoritmos (LeetCode)**, hospedado na **Vercel** com sincronização automática de progresso entre dispositivos via **Upstash Redis**.

## O que tem aqui

- **Colinha de sintaxe (6 pontos de atenção):** comparação `=` vs `===`, índice vs valor, tipos (`number`, `string`, `string[]`), `.length`, `return` dentro/fora de loops, `Record` e `Map`.
- **Treino rápido interativo (6 perguntas):** quiz para aquecer a memória muscular antes de codar.
- **Trilha em 4 fases (13 desafios do LeetCode):**
  1. **Fase 1 — Base e revisão:** `#1 Two Sum`, `#9 Palindrome Number`, `#13 Roman to Integer`, `#14 Longest Common Prefix`.
  2. **Fase 2 — `Map`, `Set` e Big O:** `#217 Contains Duplicate`, `#242 Valid Anagram`, `#1 Two Sum O(n)`.
  3. **Fase 3 — Dois ponteiros, janela deslizante e busca binária:** `#125 Valid Palindrome`, `#121 Best Time to Buy and Sell Stock`, `#704 Binary Search`.
  4. **Fase 4 — Pilha e listas ligadas:** `#20 Valid Parentheses`, `#21 Merge Two Sorted Lists`, `#206 Reverse Linked List`.
- **Biblioteca indexada com 33 vídeos verificados no YouTube** (PT-BR + NeetCode), com busca e filtro.
- **Sincronização na nuvem (`api/progress.js`):** salva e lê seu progresso no Upstash Redis usando uma chave pessoal escolhida por você.

## Ativar a sincronização na nuvem (Vercel + Upstash Redis)

1. No painel do projeto `estudo-algoritmo` na **Vercel**, abra a aba **Storage**.
2. Clique em **Create Database** → escolha **Upstash Redis** (plano gratuito) e conecte ao projeto (a Vercel cria automaticamente `KV_REST_API_URL` e `KV_REST_API_TOKEN` ou `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`).
3. *(Opcional)* Em **Settings → Environment Variables**, crie `SYNC_PIN` com uma senha pessoal se quiser bloquear qualquer outra chave.
4. Faça **Redeploy** na aba **Deployments**.
5. Abra o site no PC e no celular, digite a mesma chave na caixa **Sincronizar aparelhos** e clique em **Conectar**.
