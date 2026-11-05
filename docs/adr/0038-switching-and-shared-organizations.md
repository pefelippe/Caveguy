# Trocar de Organização e convidar Membros

Um Usuário pode ser Membro de várias Organizações e trocar entre elas: a pessoal e a de outra pessoa ou empresa. Isso reverte o "sem convites" do ADR 0007. Usamos o que o plugin `organization` do Better Auth já tem (convites, aceite, `setActive`, sair, remover Membro) em vez de mutations nossas; o resto do app continua lendo só `viewer.organizationId`.

- **Entrar:** um `owner` ou `admin` convida por e-mail com um Papel (`member` ou `admin`). O convite vai pelo Resend (sem chave, pelo console do servidor) e também pode ser copiado como link, `/app/invite/:id`. Vale 7 dias e só a conta com o e-mail convidado aceita: o cadastro não verifica e-mail, então o link é pessoal e não exigimos verificação. Quem abre o link sem sessão volta a ele depois de entrar ou se cadastrar, antes das boas-vindas.
- **Trocar:** no menu da foto. Trocar, aceitar, criar ou sair recarrega o app na página inicial, e as outras abas do navegador também (`BroadcastChannel`), porque dividem o cookie e uma aba velha escreveria na Organização errada.
- **Tudo é compartilhado:** os Membros de uma Organização veem e editam tudo dela, Fitness incluído. A Política diz isso.
- **Sair e ser removido:** quem é removido cai na Organização mais antiga que ainda tem (`resolveViewer` regrava a sessão). Os canais de fora (WhatsApp, links secretos, Open Finance) já exigem que a pessoa ainda seja Membro. O único dono não sai, e não exclui a conta enquanto a Organização tiver outros Membros.
- **WhatsApp:** cada Membro tem a sua própria Conversa de WhatsApp na Organização (`conversation.user_id`), para que duas pessoas não dividam o histórico nem confirmem a Proposta uma da outra.
- **Limites:** cada Organização tem o seu Plano e os seus Limites. Para que criar Organizações não vire um jeito de multiplicar o Gratuito, um Usuário é dono de no máximo 5 (`MAX_OWNED_ORGANIZATIONS`).
