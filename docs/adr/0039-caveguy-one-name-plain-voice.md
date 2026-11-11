# Um nome só, Caveguy, e uma voz normal

O ADR 0035 deu ao produto três nomes de uma vez: o app (Caveman, depois Caveguy), o mascote (Brutus) e, no domínio e no código, Caishen. Quem chegava não sabia com quem estava falando, e a fala das cavernas nas respostas ("Brutus anota gasto.") fazia um app de dinheiro parecer brinquedo justo onde a pessoa decide se confia: o login, o Open Finance, o Plano.

Agora o app e o mascote têm o mesmo nome, **Caveguy** (`APP_NAME`); `MASCOT_NAME` saiu. O desenho do homem das cavernas fica, como o rosto do app, e cada Agente continua sendo ele com outra roupa.

A fala das cavernas fica só nos títulos da landing ("Caveguy anota.") e na saudação de uma Conversa em branco. As respostas dos Agentes são português normal, simples, direto e na primeira pessoa (`VOICE` em `@zapbots/finance` `voice.ts`, no lugar de `CAVEMAN_VOICE`); com isso o cuidado com uma pessoa em crise (`CARE`) não precisa mais mandar largar o personagem. Botões, erros, e-mails e textos legais já eram normais.

A landing perde as fotos de cavernas e pinturas rupestres (e os créditos que pediam) e o tom bege: branco e cinzas neutros, como o app. Ganha "Seguro por padrão", que diz só o que o código faz: nunca mexe em dinheiro (ADR 0009), nada é salvo sem Confirmar (ADR 0013), chaves cifradas (ADR 0022), verificação em duas etapas (ADR 0026), saúde fora da IA e a exclusão da conta (ADR 0027). O Open Finance fica de fora: só os e-mails de `OPEN_FINANCE_EMAILS` podem usá-lo.

No código e no banco nada muda: `Bot`, `zapbots`, `Caishen` e as rotas `/caishen/*`. Ficam fora do código, para a pessoa dona do produto: o domínio (`caishen.app`), o nome do produto no Stripe, o perfil do WhatsApp Business, a tela de consentimento do Google, o remetente dos e-mails e a imagem de compartilhamento.
