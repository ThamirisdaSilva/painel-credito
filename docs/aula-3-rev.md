# AULA 3 — FLUXO COMPLETO DE LOGIN E AUTENTICAÇÃO

## OBJETIVO DA AULA

- entender o sistema funcionando antes de implementar
- mapear o fluxo completo de autenticação

---

## PARTE 1 — VISÃO GERAL

### O QUE SERÁ ANALISADO

- tela de login
- salvamento do token
- navegação após login
- proteção de rota (guard)
- interceptor adicionando token

---

## FLUXO COMPLETO

1. usuário clica em "Entrar"
2. componente chama o service
3. service realiza login
4. token é gerado
5. token é salvo no localStorage
6. usuário é redirecionado
7. guard valida acesso
8. interceptor adiciona token nas requisições

---

## PARTE 2 — AÇÃO

- acessar `/login`
- clicar em **Entrar**

---

## VALIDAÇÃO

DevTools → Application → Local Storage

```txt
auth_token: "eyJzdWIiOi..."