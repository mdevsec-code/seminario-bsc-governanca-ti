# Seminário — O Balanced Scorecard (BSC) na Governança de TI

Site da apresentação do seminário de Governança de TI (UNIME, 2026.2), tema 01.
Inclui o deck de 50 slides e um **quiz ao vivo** que substitui o Kahoot: a turma
entra pelo celular, responde, e o ranking e o pódio se preenchem sozinhos.

**Grupo:** Murilo de Souza · João Pedro Bastian · Tiffani

---

## 1. Publicar de graça no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público ou privado — o Pages
   funciona nos dois em contas Free para repositórios públicos).
2. Suba todos os arquivos desta pasta na raiz do repositório:
   ```bash
   git init
   git add .
   git commit -m "Seminário BSC na Governança de TI"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```
3. No GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save.**

Em um ou dois minutos o site fica no ar em:
`https://SEU-USUARIO.github.io/SEU-REPO/`

> Funciona igual em Netlify, Vercel ou Cloudflare Pages: é um site estático, sem build.
> Basta arrastar a pasta na interface deles.

---

## 2. Ligar o quiz ao vivo (cerca de 3 minutos, gratuito)

O quiz usa o **Firebase Realtime Database** no plano gratuito. Não precisa de
servidor nem cartão de crédito.

1. Acesse **console.firebase.google.com** → **Criar projeto** (pode desativar o Analytics).
2. No menu lateral: **Criação → Realtime Database → Criar banco de dados**.
   Escolha a região e inicie em **modo de teste**.
3. **Engrenagem → Configurações do projeto → Seus apps → ícone `</>` (Web)**.
   Registre o app e copie o objeto `firebaseConfig`.
4. Cole esse objeto no arquivo **`config.js`**, substituindo o que está lá.
   Confira que `databaseURL` está presente — se não vier, copie da tela do
   Realtime Database (termina em `firebasedatabase.app`).

### Regras de segurança

Em **Realtime Database → Regras**, use:

```json
{
  "rules": {
    "salas": {
      "$sala": {
        ".read": true,
        ".write": true,
        ".validate": "$sala.length === 4"
      }
    }
  }
}
```

Isso libera leitura e escrita **apenas** dentro de `/salas/XXXX`, e só para códigos
de 4 caracteres. É suficiente para uma apresentação de sala de aula, onde o código
dura uma aula. Como é aberto, **apague o banco depois do seminário** se não for
reaproveitar — leva dois cliques no console.

---

## 3. Como usar no dia

**Antes de começar**

- Abra `index.html` (o site publicado) no notebook ligado ao projetor.
- Vá até o slide **"Entre no Kahoot"**: ele mostra o endereço, o QR code e o
  **código da sala** (4 letras, gerado automaticamente e guardado no navegador).
- A turma abre o endereço ou aponta a câmera para o QR, digita o nome e entra.
  O card do passo 03 mostra quantos já entraram, em tempo real.

**Durante o quiz**

- Ao chegar em cada slide de questão, a pergunta abre sozinha para todo mundo.
- O slide mostra **"N de M responderam"** enquanto a turma responde.
- Quando quiser encerrar, aperte **`R`** (ou clique em *Encerrar e revelar*):
  a resposta certa acende, a explicação aparece e o ranking parcial é exibido.
- No slide **Pódio**, os três primeiros colocados aparecem com nome e pontuação.

**Pontuação:** acerto vale de 500 a 1000 pontos, proporcional à rapidez
(janela de 30 segundos). Errar ou não responder vale zero. O desempate é o
tempo acumulado — mesma lógica do Kahoot.

**Atalhos do projetor:** `→` `←` navega · `F` tela cheia · `O` mapa dos slides ·
`T` cronômetro · `N` notas do apresentador · `R` revela a questão atual.

---

## 4. Se a internet cair

Deixe `AO_VIVO = false` em `config.js` (ou simplesmente não preencha o Firebase).
O deck volta ao **modo offline**: clicar na alternativa revela a resposta e a
explicação, e vocês contam os pontos no quadro. Nenhuma outra mudança é necessária.

O arquivo `kahoot-bsc-governanca-ti.xlsx`, entregue junto, importa as mesmas
cinco questões no Kahoot, caso prefiram o plano original.

---

## 5. Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O deck de 50 slides, usado no projetor. Também hospeda o quiz. |
| `jogar.html` | A tela do aluno: entrar, responder e ver a posição. |
| `quiz-data.js` | As 5 questões, alternativas, gabarito e explicações. |
| `live.js` | Liga o deck ao banco: abre a questão, conta respostas, revela e ranqueia. |
| `sala.js` | Conexão com o Firebase e utilitários de sala. |
| `config.js` | **O único arquivo que vocês precisam editar.** |

Para mudar uma questão, edite apenas `quiz-data.js` e o texto correspondente
nos slides de questão do `index.html`.
