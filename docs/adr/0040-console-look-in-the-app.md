# O app com cara de console: linhas finas, chão cinza, um azul que age

O ADR 0039 deixou o app como a landing: cards um degrau de cinza sem linha, títulos em Anton caixa alta, o vermelho do selo como ação principal. Num app que se usa todo dia, isso cansava: títulos gritando em toda tela, cards que se perdiam no branco e vermelho em cada botão, a mesma cor de "atenção" e de "faça isso".

Agora o app segue o estilo de console descrito em `docs/design-guide.md` (referência: o dashboard da Nylas):

- Menu e cabeçalho brancos; o conteúdo num chão cinza claro (`--canvas`), com cards brancos desenhados por uma linha de 1px (`--border`), cantos de 8px (`--radius` 6px) e sem sombra.
- O cabeçalho em células separadas por linhas: a tela aberta e Buscar, Conversar com o Caveguy, o sino e a conta (foto e primeiro nome). A pílula flutuante "Conversar com o Caveguy" saiu: a conversa está no cabeçalho.
- O menu tem no topo a marca e o seletor de Organização; no pé Integrações, Configurações e Recolher menu. A conta saiu do pé do menu e foi para o cabeçalho.
- Títulos em Stack Sans, peso 600, sem caixa alta. O Anton fica só na landing e no login.
- A ação é um azul só (`--primary` = `--sky-ink`, `#0077CC`). O vermelho do selo fica para a marca, os avisos e as linhas da Finanças.
- As abas da Finanças viram um controle segmentado: trilho cinza, aba aberta em branco.

A landing e o login (`pages/landing.css`, `l-auth`) não mudam: continuam no ADR 0035/0039.
