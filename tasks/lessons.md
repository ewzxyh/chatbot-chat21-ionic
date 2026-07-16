# Lessons

- Em bugs de midia no chat, reproduzir pela selecao da lista e distinguir tres fontes antes de editar: som global de notificacao, players duplicados no DOM e mensagens distintas que reutilizam o mesmo arquivo.
- Ocultar um componente de audio com CSS nao interrompe a reproducao. O renderer descartado precisa deixar de existir ou ter seu elemento de midia pausado explicitamente.
- Antes de concluir que a duplicacao e especifica de uma midia, comparar os `uid` da colecao. Dois renderers para uma mensagem e duas identidades para o mesmo evento exigem correcoes diferentes.
- Quando o mesmo evento chega com IDs Chat21 diferentes, reconciliar pelo identificador logico estavel do Tiledesk em vez de deduplicar por conteudo ou tipo de midia.
- Em `ion-content`, nao sobrescrever `--offset-bottom` com `auto`: o Ionic usa esse valor em `calc()` para limitar o `.inner-scroll`, e um valor invalido elimina o overflow que a scrollbar precisa controlar.
- Controles fixos da lista devem ficar no `ion-header`; deixar o atalho de conversas nao atribuidas no `ion-content` faz o rotulo participar do scroll.
