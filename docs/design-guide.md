# Design guide: o painel "console"

Referência: o dashboard da Nylas (screenshot de 2026-11-16). Um console de produto: denso, calmo, desenhado por
linhas de 1px em vez de sombras ou blocos de cor. Este guia descreve o estilo e como ele se traduz para o app.

> Conflita com o ADR 0039 (cards um degrau de cinza, sem linha) e com os títulos em Anton do ADR 0035.
> Ao adotar, escrever um ADR novo que os substitua no app (a landing page segue como está).

## 1. A ideia em uma frase

Superfícies brancas separadas por linhas finas cinza, um único azul para agir, texto pequeno e preciso, e
estrutura (seções, divisórias, rótulos) no lugar de decoração.

## 2. Estrutura da tela

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [logo] Org ▾         │  🔍 Buscar ou perguntar ao Caveguy  ⌘K │ Docs │ 🔔 │ (A) Nome ▾ │  56px
├──────────────┬───────────────────────────────────────────────────────────────┤
│ ⌂ Visão geral│  faixa branca: aviso/convite, metadados chave: valor, ⋯       │
│              ├───────────────────────────────────────────────────────────────┤
│ Finanças     │  canvas cinza-claro                                           │
│  ▸ item  New │      ┌───────── card branco, borda 1px ─────────┐              │
│  ▸ item   ›  │      │ [tabs segmentadas]                        │              │
│ Pessoal      │      │ título + descrição                        │              │
│  ▸ item      │      │ ── passo 1 ── passo 2 ── bloco de código  │              │
│ ──────────── │      └───────────────────────────────────────────┘              │
│ Suporte      │                                                               │
│ ⇤ Recolher   │                                                               │
└──────────────┴───────────────────────────────────────────────────────────────┘
```

- **Topbar** de ponta a ponta, 56px, branca, `border-b`. Divide-se em células por **divisórias verticais de 1px**
  (busca | Docs | sino | conta). Cada célula tem `px-4` e altura total.
- **Sidebar** 256px, branca, `border-r`, rolagem própria. Rodapé fixo separado por `border-t`.
- **Conteúdo** em duas camadas: uma **faixa branca** no topo (contexto da página: avisos, metadados) com
  `border-b`, e abaixo o **canvas cinza** (`#F7F7F8`) onde ficam os cards brancos, centralizados, `max-w-[720px]`
  para fluxos guiados, até 1200px para grades.

## 3. Medidas

| Coisa | Valor |
|---|---|
| Grade base | 4px |
| Topbar | 56px |
| Sidebar | 256px (recolhida: 56px, só ícones) |
| Item de menu | 34px de altura, `px-2.5`, `gap-2.5` ícone→texto, 2px entre itens |
| Rótulo de seção do menu | `mt-5 mb-1 px-2.5` |
| Botão | 32px (`h-8`), `px-3`; pequeno 28px (`h-7`) |
| Input / select | 36px (`h-9`) |
| Card | `p-6` (24px); cabeçalho de card `px-5 py-3` |
| Entre blocos dentro do card | 24px, separados por `border-t` |
| Faixa de metadados | `px-6 py-4`, pares com `gap-x-10 gap-y-2` |

## 4. Bordas, raios, sombras

- **Borda**: sempre 1px, `--border` `#E4E4E7`. Card, input, botão outline, sidebar, topbar, divisórias. Ela é
  quem separa as coisas.
- **Raio**: pequeno e consistente. Card 8px (`rounded-lg`), botão/input/item ativo 6px (`rounded-md`),
  badge 4px (`rounded`), avatar e passos do stepper redondos.
- **Sombra**: quase nenhuma. Cards em destaque (o aviso de convite) `shadow-xs`
  (`0 1px 2px rgb(0 0 0 / .05)`). Aba ativa do segmented `shadow-xs`. Menus e diálogos `shadow-md`. Nada mais.

## 5. Cor

Neutros frios, um azul de ação, verde só para "feito".

| Token | Hex | Uso |
|---|---|---|
| `--background` | `#FFFFFF` | topbar, sidebar, faixa de topo, cards |
| `--canvas` | `#F7F7F8` | fundo do conteúdo sob os cards |
| `--muted` | `#F4F4F5` | item ativo do menu, trilho das tabs, barra do bloco de código |
| `--border` | `#E4E4E7` | todas as linhas |
| `--foreground` | `#18181B` | texto principal, valores |
| `--muted-foreground` | `#71717A` | descrições, rótulos de seção, ícones do menu |
| `--primary` | `#2563EB` | botão principal, link, número do passo, título do aviso |
| `--primary-soft` | `#EFF4FF` | fundo do aviso, badge "Novo", pill de papel (Admin) |
| `--success` | `#16A34A` (fundo `#DCFCE7`) | passo concluído |
| código | `#1C1C1E` | bloco de código e botões sobre ele |

**No app**: o azul de ação vira o nosso `--sky-ink` `#0077CC` (já é a cor de foco). O vermelho do selo
(`--seal`) fica só na marca e em números negativos, nunca em botão. Ver §11.

## 6. Tipografia

- Uma sans neutra (a referência usa Inter; no app, Stack Sans Text). Mono para IDs e valores copiáveis.
- Escala pequena, peso faz a hierarquia:

| Papel | Tamanho / peso |
|---|---|
| Título de card ("Hi Tim, read your inbox") | 18px / 600 |
| Título de passo, nome da org na topbar | 15px / 600 |
| Corpo, itens de menu, botões | 14px / 400–500 |
| Descrição, subtítulo | 13–14px / 400, `muted-foreground` |
| Rótulo de seção do menu ("Build", "Manage") | 12px / 500, `muted-foreground`, **sentence case** (nunca caixa alta) |
| Badge | 11px / 500 |
| ID / chave | 13px mono / 600 |

- Pares chave/valor: `Rótulo:` normal + **valor** em 600. Ex.: `Aplicativo: **Sandbox**`.

## 7. Componentes

Todos já existem no shadcn/`@zapbots/ui`; o estilo é variante, não componente novo.

1. **Seletor de workspace** (topbar, esquerda): logo 32px + bloco de duas linhas (nome 15px/600; linha de
   contexto 12px cinza com bandeira e ícone ⓘ) + chevron. É o `OrganizationSwitcher`.
2. **Busca** (`CommandMenu` trigger): input outline 36px, ícone de lupa, placeholder "Buscar ou perguntar ao
   Caveguy", `Kbd` ⌘K à direita dentro do campo.
3. **Conta** (topbar, direita): avatar redondo 28px colorido com inicial, nome 14px/600, embaixo a org 12px +
   pill do plano (verde-claro, "Plano pago"), chevron.
4. **Item de menu** (`SidebarMenuButton`): ícone outline 16px stroke 1.5 cinza, texto 14px; ativo = fundo
   `--muted` + texto e ícone em `foreground`; à direita opcional um **badge** (`New` em azul suave com borda,
   `Beta` neutro com borda) ou um chevron `›` para grupos que abrem.
5. **Rótulo de seção** (`SidebarGroupLabel`): 12px cinza, sem ícone, sem caixa alta.
6. **Card de aviso/convite** (`Alert` + `Card`): borda, raio 8px, `shadow-xs`. Cabeçalho em `--primary-soft`
   com ícone azul num quadrado de 24px, título 14px/600 azul e subtítulo 13px azul mais claro. Corpo branco:
   avatar quadrado, nome 600, pill de papel, e à direita **Recusar** (outline) + **Aceitar** (azul sólido).
7. **Faixa de metadados**: linha de pares `Rótulo: **valor**`; abaixo, ID em mono com botão-ícone de copiar;
   menu `⋯` alinhado à direita.
8. **Tabs segmentadas** (`Tabs`): trilho `--muted` com `p-1` e raio 8px; cada aba ícone 16px + texto 14px;
   ativa = fundo branco, `shadow-xs`, texto `foreground`; inativas cinza. Rolam na horizontal quando não cabem.
9. **Stepper vertical**: círculo 24px com número azul e borda azul 1px (pendente) ou check branco em verde
   com halo verde-claro de 4px (feito). Título do passo 15px/600, descrição 14px cinza, conteúdo do passo
   recuado para alinhar ao título. Passos separados por `border-t`.
10. **Select com ícone** (`Select`): outline 36px, ícone da marca à esquerda, valor, chevron; ao lado, botão-
    ícone outline quadrado 36px (ação secundária).
11. **Bloco de código**: barra de linguagens em `--muted` com abas pequenas (ativa = fundo branco/cinza mais
    forte), corpo escuro `#1C1C1E`, comentário em cinza itálico, ações no canto (Mostrar chave, Copiar) como
    botões outline escuros 28px com ícone.
12. **Rodapé da sidebar**: Suporte, Segurança e privacidade (ícone ↗ de link externo), Enviar feedback;
    divisória; "Recolher menu" com ícone de painel.

## 8. Ícones

Lucide, outline, 16px no menu e em botões, 20px em destaque, `stroke-width: 1.5`, cor `muted-foreground`
(ativo: `foreground`; dentro de aviso: `primary`). Nunca preenchidos, nunca coloridos por área no menu.

## 9. Estados

- Hover em item de menu / botão ghost: fundo `--muted`.
- Hover em botão outline: fundo `#FAFAFA`. Hover em primário: azul 8% mais escuro.
- Foco: anel 2px `--ring` com 2px de offset branco.
- Desabilitado: 50% de opacidade, sem mudança de cor.

## 10. O que não fazer

- Sem gradientes, sem glassmorphism, sem sombras grandes, sem cards coloridos.
- Sem caixa alta em rótulos e títulos (substitui o Anton em `h1` dentro do app).
- Sem mais de um azul; sem vermelho em ações.
- Sem cards de cinza sem borda: card é branco com borda, o cinza é o chão.

## 11. Tradução para o Caishen / Caveguy

| Nylas | No app |
|---|---|
| Sandbox ▾ (workspace) | `OrganizationSwitcher` com a Organização e o plano |
| Search or Ask AI ⌘K | `CommandMenu`: "Buscar ou perguntar ao Caveguy" |
| See our Docs | Conversar com o Caveguy (abre o `ChatPanel`) |
| Overview | Visão geral (`/caishen`) |
| Early access / Build / Manage | Finanças / Pessoal / Fitness (`useNav().groups`) |
| New / Beta | `soon` vira "Em breve" no mesmo badge |
| Convite para organização | o mesmo, de `InvitePage`, e os Avisos não lidos |
| Application / Environment / Client ID | Titular, Mês, Sobra do mês |
| Tabs Email / Calendar / Scheduler | as `FinanceTabs` (Visão geral, Transações, Parcelamentos…) |
| Stepper de onboarding | "Primeiros passos": conectar banco (Open Finance), importar extrato, falar no WhatsApp |
| Bloco de código | não usar no app; o lugar dele é tomado por tabelas e listas de Transações |
