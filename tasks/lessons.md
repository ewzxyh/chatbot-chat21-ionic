# Lessons

- Em bugs de midia no chat, reproduzir pela selecao da lista e distinguir tres fontes antes de editar: som global de notificacao, players duplicados no DOM e mensagens distintas que reutilizam o mesmo arquivo.
- Ocultar um componente de audio com CSS nao interrompe a reproducao. O renderer descartado precisa deixar de existir ou ter seu elemento de midia pausado explicitamente.
- Antes de concluir que a duplicacao e especifica de uma midia, comparar os `uid` da colecao. Dois renderers para uma mensagem e duas identidades para o mesmo evento exigem correcoes diferentes.
