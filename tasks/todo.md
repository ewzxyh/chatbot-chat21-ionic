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
