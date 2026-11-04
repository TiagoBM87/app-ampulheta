# ⏳ Ampulheta

Timer visual em formato de ampulheta, feito com HTML, CSS e JavaScript puro — sem dependências e sem build. Funciona como **web app para celular** e pode ser instalado como **PWA** (Progressive Web App).

## ✨ Funcionalidades

- Duração de **1 a 60 segundos ou minutos** (limite aplicado automaticamente).
- **Presets rápidos**: 30s, 1 min, 5 min, 10 min, 30 min e 60 min.
- Animação de areia escoando de cima para baixo, proporcional ao tempo escolhido.
- Contador digital no formato `MM:SS`, com cálculo baseado no relógio real (sem atraso acumulado).
- **Modo "só ampulheta"**: o botão de olho na barra superior oculta a contagem numérica e destaca o desenho.
- Toque/clique na ampulheta para **virá-la e reiniciar** o tempo (também via teclado: `Enter` ou `Espaço`).
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
4. Durante a contagem, clique/toque na ampulheta para reiniciar o tempo ou use **Voltar** para reconfigurar.
5. Use o botão de **olho** na barra superior para ocultar ou mostrar a contagem numérica. A preferência fica salva.

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
- `script.js` sincroniza a duração da transição CSS com o tempo escolhido, de modo que a areia termina de escoar exatamente quando o tempo zera.
- O contador usa um timestamp de término (`Date.now() + duração`) em vez de decrementar a cada segundo, evitando desvio causado por abas em segundo plano.
- Ao virar a ampulheta, ela gira mais 180° por 0,6s (sem voltar bruscamente) e reinicia a contagem.
- O alarme é sintetizado com `OscillatorNode` + `GainNode` da Web Audio API. O contexto de áudio é desbloqueado no clique em **Iniciar Timer**, respeitando as políticas dos navegadores.
- Tema, som e visibilidade da contagem são salvos em `localStorage` (`ampulheta:theme`, `ampulheta:sound` e `ampulheta:count`).
- O `sw.js` faz cache do app shell na instalação, usa **rede primeiro** para navegação (garantindo atualizações) e **cache primeiro com revalidação** para os demais recursos, permitindo abrir offline.

## 📱 Decisões de responsividade

- `100dvh` em vez de `100vh`, evitando cortes causados pela barra dinâmica do navegador mobile.
- `viewport-fit=cover` + `env(safe-area-inset-*)` para respeitar notch e cantos arredondados.
- Alvos de toque com pelo menos **44px** em retrato; em telas baixas (paisagem), o layout compacta para caber sem rolagem.
- `font-size: 1rem` nos campos para evitar o zoom automático do iOS ao focar.
- `touch-action: manipulation` e `overscroll-behavior-y: contain` para interações de toque mais previsíveis.
- Zoom do usuário **não é bloqueado** (acessibilidade).

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis, Flexbox, SVG, transições e `@keyframes`)
- JavaScript (ES6+, Web Audio API, Notifications API e Vibration API)
- PWA (Web App Manifest + Service Worker)

## 📄 Licença

Projeto de uso livre para fins de estudo e experimentação.
