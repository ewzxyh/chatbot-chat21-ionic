# Correcao do audio duplicado

- [x] Reproduzir a troca de conversa e contar os players por mensagem.
- [x] Identificar os pontos que chamam `HTMLMediaElement.play()`.
- [x] Manter um unico renderer para audio estruturado do CaseZap.
- [x] Pausar o player nativo caso ele surja durante a renderizacao assincrona.
- [x] Executar testes focados e build.
- [x] Validar o asset publicado e o estado do container na VPS DEV.
- [x] Criar commit e push.

## Revisao

O build `npm run build`, a verificacao sintatica do enhancer e `git diff --check`
passaram. A suite Karma continua bloqueada por erros preexistentes de infraestrutura
e de specs nao relacionadas. A VPS DEV foi reconstruida com o renderer corrigido;
o asset servido contem a pausa de seguranca e o fallback para payload invalido.

# Duplicacao geral de mensagens e scroll da lista

- [x] Confirmar que existe um unico loop de renderizacao para as mensagens.
- [x] Rastrear as identidades usadas pelo historico e pelo evento em tempo real.
- [x] Reconciliar a mensagem pendente com o `message_id` definitivo.
- [x] Restaurar o overflow e o scrollbar do viewport real do `ion-content`.
- [x] Executar verificacao focada, build e auditoria do diff.
- [x] Validar mensagens e scroll na VPS DEV.
- [x] Criar commit e push.

## Revisao

O handler MQTT agora usa `message_id` como identidade canonica e remove a entrada
temporaria antes do merge. O viewport interno do `ion-content` voltou a rolar e
recebe o scrollbar customizado. `npm run build` e `git diff --check` passaram; a
execucao Karma permanece bloqueada por erros preexistentes em specs nao relacionadas.
O container `chatcase-chat21-ionic` foi reconstruido na VPS DEV e os endpoints local
e publico responderam `200`; o bundle servido contem as duas correcoes.

# Duplicacao visual residual com persistencia unica

- [x] Reproduzir IDs Chat21 alternativos para o mesmo `tiledesk_message_id`.
- [x] Corrigir a reconciliacao no handler compartilhado de mensagens.
- [x] Executar build e `git diff --check`.
- [ ] Validar a correcao na VPS DEV.

## Validacao local

O build completo passou. O Karma focal nao chegou as assertions porque a compilacao
global inclui specs legadas com imports ausentes e erros de tipos fora deste escopo.
