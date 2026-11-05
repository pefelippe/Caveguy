# Só o WhatsApp: o Telegram saiu

O Caveman fala com as pessoas fora do app por um canal só, o WhatsApp (ADR 0019). O Telegram (ADR 0031) saiu: dois canais dividiam a explicação, a landing e o cartão de Integrações, e o público do Caveman está no WhatsApp.

Saíram o webhook, o bot, o cartão em Integrações, as mutations de vínculo e o modo `telegram` das instruções do Financeiro. Ficam no banco as tabelas `telegram_link`, `telegram_link_code` e `telegram_update` e o valor `TELEGRAM` de `conversation_channel`, porque as migrations só adicionam; as Conversas antigas do Telegram continuam aparecendo no Agente como as outras.

Os Avisos proativos (vencimentos, atrasos e Limites de categoria mandados sem a pessoa pedir) chegaram a ser feitos para o Telegram e saíram junto, antes de ir ao ar. No WhatsApp eles dependem de modelos de mensagem aprovados pela Meta, pagos por envio; até lá os Avisos ficam no sino do app.
