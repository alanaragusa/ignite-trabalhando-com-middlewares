# Desafio 02 Ignite Trilha NodeJS

<h3 align="center">
  Desafio Trabalhando com middlewares
</h3>

## :rocket: Sobre o desafio

Nesse desafio, trabalhei mais a fundo com os Middlewares no Express. 
A aplicação é semelhante ao do primeiro desafio do Ignite NodeJS. 
Na aplicação backend para o gerenciamento de tarefas, será permitida a criação de um usuário com `name` e `username`, bem como fazer o CRUD de *todos*:

- Criar um novo *todo*;
- Listar todos os *todos*;
- Alterar o `title` e `deadline` de um *todo* existente;
- Marcar um *todo* como feito;
- Excluir um *todo*;

Tudo isso para cada usuário em específico - o `username` será passado pelo header. Além disso, teremos um plano grátis onde o usuário só pode criar até dez todos e um plano Pro que irá permitir criar todos ilimitados, isso tudo usando middlewares para fazer as validações necessárias.