Atividade 1 — Criar botão “Enviar para análise”

Hoje a tela de detalhes permite aprovar ou reprovar uma solicitação.

A atividade é adicionar uma ação anterior:

Enviar para análise
O que fazer

Na tela de detalhes, criar um botão que altere o status para:

em_analise
Arquivos envolvidos
src/app/components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe.ts
src/app/components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe.html
Resultado esperado

Ao clicar em Enviar para análise:

o status muda para em_analise;
o card muda visualmente;
o Firestore é atualizado;
a Central de Atividades registra a alteração.

---

Atividade 2 — Criar confirmação antes de excluir

Hoje o botão Excluir remove a solicitação diretamente.

A atividade é adicionar uma confirmação antes da exclusão.

O que fazer

Ao clicar em Excluir, exibir uma confirmação simples:

Tem certeza que deseja excluir esta solicitação?

Pode usar confirm().

Arquivo envolvido
src/app/components/solicitacoes/solicitacao-item/solicitacao-item.ts
Resultado esperado

Se o usuário confirmar, a solicitação é excluída.

Se o usuário cancelar, a solicitação continua na lista.

--- 

Atividade 3 — Ordenar solicitações por data mais recente

Hoje a lista pode aparecer fora de ordem.

A atividade é ordenar a lista para mostrar primeiro as solicitações mais recentes.

O que fazer

Na facade, ajustar a lista filtrada para ordenar por:

dataSolicitacao

A ordenação deve ser do mais recente para o mais antigo.

Arquivo envolvido
src/app/services/solicitacoes.facade.ts
Resultado esperado

Quando criar uma nova solicitação, ela deve aparecer no começo da lista.
