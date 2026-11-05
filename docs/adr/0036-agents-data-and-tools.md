# O que cada Agente lê e o que pode fazer

Com vários Agentes (ADR 0035), cada um precisa de um limite claro do que chega ao Modelo dele e do que ele pode fazer. A regra é dar a cada um só o que o seu campo pede, e nada que a pessoa não esperaria.

- **Financeiro** (`FINANCE`): como o Caishen sempre foi. Lê as Finanças do Titular, usa as ferramentas de leitura (ADR 0021) e propõe registros que só a confirmação grava (ADR 0013). É o único com ferramentas, Propostas e Workflows com ferramentas, e o único no WhatsApp.
- **Pessoal** (`PERSONAL`): lê a Agenda dos próximos 14 dias, as Tarefas abertas e as Metas, já formatadas, e conversa sobre elas. Não tem ferramentas nem Propostas: criar um Evento ou uma Tarefa pelo chat fica para depois, com o mesmo cuidado das Propostas.
- **Fitness** (`FITNESS`): lê só as Fichas de treino (nome, para quem e exercícios). Dados de saúde (Sono, Medidas, Dieta, Macros, passos) **nunca** chegam a um Modelo: são sensíveis pela LGPD e ninguém consentiu com isso.
- **Agente personalizado** (`CUSTOM`): não lê dado nenhum. Recebe o nome e o que a pessoa escreveu que ele faz, marcados como pedido dela, que nunca passam por cima das regras fixas (só conversar, nunca mexer em dinheiro, e o cuidado com quem está em crise).

Todo Agente fala na fala das cavernas e responde primeiro a quem está em crise, largando o personagem (CVV 188, SAMU 192). Essas duas partes ficam numa seção só, compartilhada pelas instruções de todos, para não divergirem.

No banco, `bot.key` ganha `PERSONAL`, `FITNESS` e `CUSTOM`. Os fixos são um por Organização, como antes; os personalizados podem ser vários, então a unicidade de `(organization_id, key)` vira um índice parcial só das linhas sem `name`. `name`, `instructions` e `outfit` são colunas anuláveis usadas só pelo personalizado, que sempre tem nome. O índice não cita `CUSTOM` porque um valor novo de enum não pode ser usado na transação que o cria, e as migrations rodam numa só. Os Avisos de Rotina falha passam a ser buscados pelo id do Bot, porque vários personalizados dividem a mesma chave.

Mandar Agenda, Tarefas, Metas e Fichas a um Modelo é uso novo de dados: os Termos e a Política mudam com isto (ADR 0027).
