# ⏳ Ampulheta

Timer visual em formato de ampulheta, feito com HTML, CSS e JavaScript puro — sem dependências, sem build. Basta abrir o `index.html` no navegador.

## ✨ Funcionalidades

- Duração de **1 a 60 segundos ou minutos** (limite aplicado automaticamente).
- **Presets rápidos**: 30s, 1 min, 5 min, 10 min, 30 min e 60 min.
- Animação de areia escoando de cima para baixo, proporcional ao tempo escolhido.
- Contador digital no formato `MM:SS`, com cálculo baseado no relógio real (sem atraso acumulado).
- Toque/clique na ampulheta para **virá-la e reiniciar** o tempo (também via teclado: `Enter` ou `Espaço`).
- **Alarme sonoro** ao final, gerado pela Web Audio API (sem arquivos de áudio).
- **Notificação do navegador** ao terminar, quando a permissão é concedida.
- **Tema escuro e claro**, com preferência salva no navegador.
- Alternância de **som ligado/desligado**, também persistida.
- Botão **Voltar** para retornar à configuração durante a contagem.
- Layout responsivo e otimizado para toque em dispositivos móveis.

## 🚀 Como usar

1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Informe a duração ou escolha um preset.
3. Clique em **Iniciar Timer**.
4. Durante a contagem, clique/toque na ampulheta para reiniciar o tempo ou use **Voltar** para reconfigurar.

> Também é possível servir a pasta com qualquer servidor estático, por exemplo:
>
> ```bash
> npx serve .
> ```

> A notificação do navegador costuma exigir `https://` ou `localhost`. Em `file://` ela pode não ser exibida, mas o alarme sonoro e o aviso na tela continuam funcionando.

## 🗂️ Estrutura do projeto

```
app-ampulheta/
├── index.html   # Estrutura das telas, presets e barra de preferências
├── style.css    # Temas (variáveis CSS), formato da ampulheta e animações
├── script.js    # Timer, animação da areia, áudio, notificações e preferências
└── README.md
```

## 🔍 Como funciona

- `index.html` define duas telas: a de **configuração** (`#setup-screen`) e a de **execução** (`#timer-screen`), alternadas pela classe `.hidden`.
- A ampulheta é construída apenas com CSS: dois `div`s com `clip-path` formam os vidros superior e inferior, e a areia é animada via `transform: scaleY()`. O fluxo central é decorativo.
- `script.js` sincroniza a duração da transição CSS com o tempo escolhido, de modo que a areia termina de escoar exatamente quando o tempo zera.
- O contador usa um timestamp de término (`Date.now() + duração`) em vez de decrementar a cada segundo, evitando desvio causado por abas em segundo plano.
- Ao virar a ampulheta, ela gira 180° por 0,6s e é resetada visualmente antes de reiniciar a contagem.
- O alarme é sintetizado com `OscillatorNode` + `GainNode` da Web Audio API. O contexto de áudio é desbloqueado no clique em **Iniciar Timer**, respeitando as políticas dos navegadores.
- Tema e som são salvos em `localStorage` (`ampulheta:theme` e `ampulheta:sound`).

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis, Flexbox, `clip-path`, transições e `@keyframes`)
- JavaScript (ES6+, Web Audio API e Notifications API, sem frameworks)

## 📄 Licença

Projeto de uso livre para fins de estudo e experimentação.
