# ⏳ Ampulheta

Timer visual em formato de ampulheta, feito com HTML, CSS e JavaScript puro — sem dependências e sem build. Funciona como **web app para celular** e pode ser instalado como **PWA** (Progressive Web App).

## ✨ Funcionalidades

- Duração de **1 a 60 segundos ou minutos** (limite aplicado automaticamente).
- **Presets rápidos**: 30s, 1 min, 5 min, 10 min, 30 min e 60 min.
- Animação de areia escoando de cima para baixo, proporcional ao tempo escolhido.
- **Visual realista**: areia em tons naturais (bege/dourado), preenchimento uniforme e proporcional do vidro inferior e armação de madeira com veios e volume.
- **Ampulheta em destaque**: ocupa cerca de **80% da altura da tela** (limitada pela largura no celular) e mantém a **posição fixa** quando o aviso de tempo esgotado aparece.
- Contador digital no formato `MM:SS`, com cálculo baseado no relógio real (sem atraso acumulado).
- **Modo "só ampulheta"**: o botão de olho na barra superior oculta a contagem numérica e destaca o desenho.
- **Reinício automático**: o botão de repetição na barra superior faz o timer recomeçar sozinho ao terminar, mantendo a mesma duração. A preferência é salva.
- Toque/clique na ampulheta para **pausar** a contagem em andamento e tocar de novo para **retomar de onde parou**. Com o tempo esgotado, o toque **gira a ampulheta e reinicia** a contagem (funciona mesmo com o reinício automático desligado). Também via teclado: `Enter` ou `Espaço`.
- **Alarme sonoro** ao final, gerado pela Web Audio API (sem arquivos de áudio).
- **Notificação do navegador** ao terminar, quando a permissão é concedida.
- **Vibração** no celular ao fim do tempo, quando suportada.
- **Tema escuro e claro**, com preferência salva no navegador.
- Alternância de **som ligado/desligado**, também persistida.
- Botão **Voltar** para retornar à configuração durante a contagem.
- **PWA instalável**, com funcionamento offline do app shell.
- Layout responsivo, com suporte a **safe areas** (notch), orientação horizontal e alvos de toque adequados.

## 🚀 Como usar

1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Informe a duração ou escolha um preset.
3. Clique em **Iniciar Timer**.
4. Durante a contagem, clique/toque na ampulheta para **pausar** e tocar de novo para **retomar**. Quando o tempo terminar, o toque reinicia a contagem; use **Voltar** para reconfigurar.
5. Use o botão de **olho** na barra superior para ocultar ou mostrar a contagem numérica. A preferência fica salva.
6. Ative o botão de **repetição** na barra superior para reiniciar o timer automaticamente ao terminar. Desative quando quiser que ele pare no zero e reinicie manualmente com um toque na ampulheta.

Para testar os recursos de PWA (instalação e offline), sirva a pasta por HTTP em `localhost`:

```bash
npx serve .
```

Depois acesse o endereço indicado (por exemplo, `http://localhost:3000`).

> Service workers e instalação exigem **HTTPS ou `localhost`**. Abrindo via `file://`, o app continua funcionando normalmente, mas sem cache offline e sem instalação.

## 📲 Instalar no celular

- **Android (Chrome)**: menu `⋮` → **Instalar aplicativo** (ou **Adicionar à tela inicial**).
- **iPhone (Safari)**: botão **Compartilhar** → **Adicionar à Tela de Início**.

Depois de instalado, o app abre em tela cheia (modo `standalone`) e funciona offline.

## 🗂️ Estrutura do projeto

```
app-ampulheta/
├── index.html              # Estrutura das telas, presets e metadados do PWA
├── style.css               # Temas, layout mobile, ampulheta e animações
├── script.js               # Timer, áudio, notificações, preferências e registro do SW
├── manifest.webmanifest    # Metadados de instalação do PWA
├── sw.js                   # Service worker (cache offline do app shell)
├── icons/
│   ├── icon.svg            # Ícone vetorial
│   ├── icon-192.png        # Ícone PWA 192×192
│   ├── icon-512.png        # Ícone PWA 512×512
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
└── README.md
```

## 🔍 Como funciona

- `index.html` define duas telas: a de **configuração** (`#setup-screen`) e a de **execução** (`#timer-screen`), alternadas pela classe `.hidden`.
- A ampulheta é um **SVG inline** com curvas suaves: os vidros são recortados por `clipPath`, a areia é animada via `transform: scaleY()` com `transform-box: fill-box`, e o fio/grãos de areia usam animações CSS. O desenho inteiro gira a cada virada.
- A areia usa um gradiente em tons de areia natural. O nível do vidro inferior sobe de forma uniforme e proporcional ao esvaziamento do topo (100%/0% → 50%/50% → 0%/100%), com a mesma duração e curva linear. A armação (discos e hastes) usa gradientes de madeira e padrões de veios (`<pattern>`), com variação de tom para dar volume de peça torneada.
- A tela de execução usa **CSS Grid** com uma linha flexível para a ampulheta e um rodapé de altura reservada. O aviso "Tempo Esgotado!" ocupa o espaço dele mesmo antes de aparecer (`visibility: hidden`), então nada se desloca quando o tempo termina.
- `script.js` sincroniza a duração da transição CSS com o tempo escolhido, de modo que a areia termina de escoar exatamente quando o tempo zera. Ao pausar, a transição é congelada no ponto exato (`getComputedStyle` + `transition: none`) e, ao retomar, continua a partir dali com a duração restante.
- O contador usa um timestamp de término (`Date.now() + duração`) em vez de decrementar a cada segundo, evitando desvio causado por abas em segundo plano. Ao pausar, o tempo restante é guardado e o timestamp é recalculado na retomada.
- Ao reiniciar (toque depois do fim ou reinício automático), a ampulheta gira 180° por 0,6s. Como o desenho é simétrico, a rotação volta a 0° logo depois, sem salto perceptível, e a contagem reinicia.
- O alarme é sintetizado com `OscillatorNode` + `GainNode` da Web Audio API. O contexto de áudio é desbloqueado no clique em **Iniciar Timer**, respeitando as políticas dos navegadores.
- Tema, som, visibilidade da contagem e reinício automático são salvos em `localStorage` (`ampulheta:theme`, `ampulheta:sound`, `ampulheta:count` e `ampulheta:auto`).
- O `sw.js` faz cache do app shell na instalação, usa **rede primeiro** para navegação (garantindo atualizações) e **cache primeiro com revalidação** para os demais recursos, permitindo abrir offline.

## 📱 Decisões de responsividade

- `100dvh` em vez de `100vh`, evitando cortes causados pela barra dinâmica do navegador mobile.
- `viewport-fit=cover` + `env(safe-area-inset-*)` para respeitar notch e cantos arredondados.
- A ampulheta cresce até o limite da tela (viewBox ajustado ao desenho) e o rodapé compacta em telas de altura média.
- Em paisagem, o palco ganha mais altura porque o desenho fica estreito e centralizado, longe dos botões dos cantos.
- Alvos de toque com pelo menos **44px** em retrato; em telas baixas (paisagem), o layout compacta para caber sem rolagem.
- `font-size: 1rem` nos campos para evitar o zoom automático do iOS ao focar.
- `touch-action: manipulation` e `overscroll-behavior-y: contain` para interações de toque mais previsíveis.
- Zoom do usuário **não é bloqueado** (acessibilidade).

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis, Flexbox, Grid, SVG, transições e `@keyframes`)
- JavaScript (ES6+, Web Audio API, Notifications API e Vibration API)
- PWA (Web App Manifest + Service Worker)

## 📄 Licença

Projeto de uso livre para fins de estudo e experimentação.
