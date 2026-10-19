# 🌐 Projeto Autonomoz

> Repositório central do projeto prático desenvolvido na disciplina de **Projetos**.

---

## 📑 Sumário

- [Objetivos do Repositório](#-objetivos-do-repositório)
- [Introdução](#-introdução)
- [Entidades do Banco de Dados](#️-entidades-do-banco-de-dados)
- [Como Funcionam as Rotas da API](#-como-funcionam-as-rotas-da-api)
- [Mapeamento Detalhado de Rotas](#-mapeamento-detalhado-de-rotas)
- [Exemplo de Requisição e Resposta](#-exemplo-de-requisição-e-resposta)
- [Integrantes e Professores](#-integrantes-e-professores)
- [Como Utilizar este Repositório](#️-como-utilizar-este-repositório)

---

## 🎯 Objetivos do Repositório

- [x] **Organização de conteúdos:** estruturar e ordenar os materiais de forma lógica e funcional.
- [x] **Agrupamento de dados:** categorizar os itens com base em suas afinidades e especificações.
- [x] **Compartilhamento de arquivos:** disponibilizar e distribuir os documentos com segurança aos destinatários.

---

# 🚀 AUTONOMOZ — Documentação de API e Banco de Dados

Centralização das informações de mapeamento de rotas da API e da especificação das entidades do banco de dados para gerenciamento e controle de estoque, ordens de produção e acessos.

---

## 📌 Introdução

Este repositório centraliza o mapeamento de rotas da API e as entidades do banco de dados modeladas nos semestres anteriores. O principal objetivo é otimizar a organização, a consistência e o gerenciamento do banco de dados da aplicação **AUTONOMOZ**.

## 📁 Estrutura do projeto

- `front-end/`: aplicação React com Vite, organizada em telas para dashboard, estoque, lotes, movimentações, categorias, fornecedores, ordens de produção, vendas, alertas, usuários e auditoria.
- `back-end/`: API Express, autenticação, acesso ao MySQL e testes.
- `design/`: referências visuais e materiais de design.

O front-end já está conectado às rotas da API e utiliza `VITE_API_URL` para configurar o endereço do back-end. No desenvolvimento, o padrão é `http://localhost:3000`.

---

## 🌐 Como Funcionam as Rotas da API


O sistema **AUTONOMOZ** é uma API que gerencia estoque, produtos e ordens de produção. Pense nela como um "garçom" entre quem usa o sistema (um app, um site) e o banco de dados: toda vez que alguém quer ver, criar, alterar ou apagar uma informação, ele faz um pedido (uma **requisição**) para um endereço específico (uma **rota**), e a API responde com o resultado.

**Base URL:** `http://localhost:3000`

### A lógica é sempre a mesma

Não importa se você está falando de usuários, produtos, fornecedores ou ordens de produção — **todas as 11 áreas do sistema seguem o mesmo padrão de 5 ações**:

| Ação | O que faz | Exemplo com produtos |
| :--- | :--- | :--- |
| `GET /algo` | **Ver a lista completa** | Ver todos os produtos cadastrados |
| `GET /algo/:id` | **Ver um item específico** | Ver só o produto com ID 5 |
| `POST /algo` | **Criar um novo item** | Cadastrar um produto novo |
| `PUT /algo/:id` | **Editar um item existente** | Corrigir o nome de um produto |
| `DELETE /algo/:id` | **Excluir um item** | Remover um produto do sistema |

Uma vez que você entende esse padrão para "produtos", você já entende automaticamente como funciona para "fornecedores", "cargos", "movimentações" etc. — só troca o nome da rota.

### As 11 "áreas" (recursos) do sistema

| Recurso | Rota base | Para que serve |
| :--- | :--- | :--- |
| Usuários | `/usuarios` | Funcionários e gerentes que acessam o sistema |
| Cargos | `/cargos` | Os tipos de função e permissões de cada usuário |
| Categorias | `/categorias` | Grupos gerais dos produtos |
| Subcategorias | `/subcategoria` | Divisões mais específicas dentro de uma categoria |
| Fornecedores | `/fornecedores` | Empresas que fornecem os produtos |
| Localização | `/localizacao` | Onde cada produto fica guardado fisicamente |
| Produtos | `/produtos` | O catálogo de itens do estoque |
| Lotes | `/lotes` | Remessas de produtos, com validade e origem |
| Movimentações | `/movimentacoes` | Registro de entradas/saídas do estoque |
| Ordens de produção | `/ordem_producao` | Serviços/montagens em andamento |
| Ordem x Funcionário | `/ordem_producao_funcionario` | Quem está trabalhando em qual ordem |

### Um exemplo de ponta a ponta

Imagine que você quer cadastrar um produto novo:

1. Você envia um `POST` para `http://localhost:3000/produtos`, com os dados do produto no corpo da requisição (nome, descrição, estoque mínimo).
2. A API salva isso no banco, na tabela `produto`.
3. A API responde com `201 Created` e devolve o produto já com um `id_produto` gerado automaticamente.

Depois, se você quiser **ver** esse produto, usa `GET /produtos/1` (troque `1` pelo ID retornado). Para **editar**, `PUT /produtos/1` com os novos dados. Para **remover**, `DELETE /produtos/1`.

---

## 📋 Mapeamento Detalhado de Rotas

Abaixo está o detalhamento completo de todas as rotas, recurso por recurso.

### 1. Usuários (`/usuarios`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/usuarios` | Listar todos os usuários | — |
| `GET` | `/usuarios/gerenciamento` | Listar dados cadastrais para gerenciamento (somente gerente) | Token de gerente |
| `GET` | `/usuarios/:id` | Acessar usuário específico | `id` (`req.params`) |
| `POST` | `/usuarios` | Criar novo usuário | Body completo |
| `PUT` | `/usuarios/:id` | Alterar dados do usuário | `id` (`req.params`) |
| `DELETE` | `/usuarios/:id` | Deletar usuário do sistema | `id` (`req.params`) |

### 2. Cargos (`/cargos`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/cargos` | Listar todos os cargos | — |
| `GET` | `/cargos/:id` | Acessar cargo específico | `id` (`req.params`) |
| `POST` | `/cargos` | Criar novo cargo | Body completo |
| `PUT` | `/cargos/:id` | Alterar dados do cargo | `id` (`req.params`) |
| `DELETE` | `/cargos/:id` | Deletar cargo do sistema | `id` (`req.params`) |

### 3. Categorias (`/categorias`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/categorias` | Listar todas as categorias | — |
| `GET` | `/categorias/:id` | Acessar categoria específica | `id` (`req.params`) |
| `POST` | `/categorias` | Criar nova categoria | Body completo |
| `PUT` | `/categorias/:id` | Alterar dados da categoria | `id` (`req.params`) |
| `DELETE` | `/categorias/:id` | Deletar categoria do sistema | `id` (`req.params`) |

### 4. Fornecedores (`/fornecedores`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/fornecedores` | Listar todos os fornecedores | — |
| `GET` | `/fornecedores/:id` | Acessar fornecedor específico | `id` (`req.params`) |
| `POST` | `/fornecedores` | Criar novo fornecedor | Body completo |
| `PUT` | `/fornecedores/:id` | Alterar dados do fornecedor | `id` (`req.params`) |
| `DELETE` | `/fornecedores/:id` | Deletar fornecedor do sistema | `id` (`req.params`) |

### 5. Localização (`/localizacao`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/localizacao` | Listar todas as localizações | — |
| `GET` | `/localizacao/:id` | Acessar localização específica | `id` (`req.params`) |
| `POST` | `/localizacao` | Criar nova localização de produto | Body completo |
| `PUT` | `/localizacao/:id` | Alterar dados da localização | `id` (`req.params`) |
| `DELETE` | `/localizacao/:id` | Deletar localização do sistema | `id` (`req.params`) |

### 6. Produtos (`/produtos`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/produtos` | Listar todos os produtos | — |
| `GET` | `/produtos/:id` | Acessar produto específico | `id` (`req.params`) |
| `POST` | `/produtos` | Criar novo produto | Body completo |
| `PUT` | `/produtos/:id` | Alterar dados do produto | `id` (`req.params`) |
| `DELETE` | `/produtos/:id` | Deletar produto do sistema | `id` (`req.params`) |

### 7. Lote Produto (`/lotes`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/lotes` | Listar todos os lotes | — |
| `GET` | `/lotes/:id` | Acessar lote específico | `id` (`req.params`) |
| `POST` | `/lotes` | Criar novo lote | Body completo |
| `PUT` | `/lotes/:id` | Alterar dados do lote | `id` (`req.params`) |
| `DELETE` | `/lotes/:id` | Deletar lote do sistema | `id` (`req.params`) |

### 8. Movimentação (`/movimentacoes`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/movimentacoes` | Listar todas as movimentações | — |
| `GET` | `/movimentacoes/:id` | Acessar movimentação específica | `id` (`req.params`) |
| `POST` | `/movimentacoes` | Registrar nova movimentação | Body completo |
| `PUT` | `/movimentacoes/:id` | Alterar dados da movimentação | `id` (`req.params`) |
| `DELETE` | `/movimentacoes/:id` | Deletar movimentação do sistema | `id` (`req.params`) |

### 9. Ordem de Produção (`/ordem_producao`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/ordem_producao` | Listar ordens de produção | — |
| `GET` | `/ordem_producao/:id` | Acessar ordem específica | `id` (`req.params`) |
| `POST` | `/ordem_producao` | Criar nova ordem de produção | Body completo |
| `PUT` | `/ordem_producao/:id` | Alterar dados da ordem | `id` (`req.params`) |
| `DELETE` | `/ordem_producao/:id` | Deletar ordem de produção | `id` (`req.params`) |

### 10. Ordem Produção Funcionário (`/ordem_producao_funcionario`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/ordem_producao_funcionario` | Listar ordens associadas a funcionários | — |
| `GET` | `/ordem_producao_funcionario/:id` | Acessar vínculo específico | `id` (`req.params`) |
| `POST` | `/ordem_producao_funcionario` | Vincular funcionário à ordem | Body completo |
| `PUT` | `/ordem_producao_funcionario/:id` | Alterar dados do vínculo | `id` (`req.params`) |
| `DELETE` | `/ordem_producao_funcionario/:id` | Deletar vínculo do sistema | `id` (`req.params`) |

### 11. Subcategoria (`/subcategoria`)
| Método | Rota | Descrição | Parâmetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/subcategoria` | Listar todas as subcategorias | — |
| `GET` | `/subcategoria/:id` | Acessar subcategoria específica | `id` (`req.params`) |
| `POST` | `/subcategoria` | Criar nova subcategoria | Body completo |
| `PUT` | `/subcategoria/:id` | Alterar dados da subcategoria | `id` (`req.params`) |
| `DELETE` | `/subcategoria/:id` | Deletar subcategoria do sistema | `id` (`req.params`) |

---

## 💻 Exemplo de Requisição e Resposta

### Requisição
`POST http://localhost:3000/produtos`

```json
{
  "nome_produto": "Carburador",
  "descricao": "Carburador Fusca Kombi 1500 1600 H30 Original Brosol",
  "estoque_minimo": 12
}
```

### Resposta (`201 Created`)
```json
{
  "id_produto": 1,
  "nome_produto": "Carburador",
  "descricao": "Carburador Fusca Kombi 1500 1600 H30 Original Brosol",
  "estoque_minimo": 12
}
```

---

## 👨‍🏫 Integrantes e Professores

### Professores
| Nome |
| :--- |
|  **Celso Giusti**|
| **Daniel Manoel Filho** |
| **Marlon Palata Fanger Rodrigues** |

### Integrantes
| Nome |
| :--- |
| **Lucas Felipe Sola**|
| **Maria Eduarda Quidiquimo Barreto**|
| **Mônica Cotrim Manfrinato** |
| **Vinicius de Souza Monteiro** |

---

## 🛠️ Como Utilizar este Repositório

1. Clone o projeto:
   ```bash
   git clone https://github.com/maria-quidiquimo/projeto-autonomoz.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd projeto-autonomoz
   ```

3. Instale as dependências do back-end e do front-end:
   ```bash
   npm --prefix back-end install
   npm --prefix front-end install
   ```

4. Configure `back-end/.env` com os dados do MySQL, usando `back-end/.env.example` como referência.

5. Em um terminal, inicie a API:
   ```bash
   npm --prefix back-end run dev
   ```

6. Em outro terminal, inicie o front-end:
   ```bash
   npm --prefix front-end run dev
   ```

O front-end de desenvolvimento ficará disponível em `http://localhost:5173` e a API em `http://localhost:3000`.

Para compilar o front-end para produção e servi-lo pela API:

```bash
npm --prefix back-end run build
npm --prefix back-end start
```

Os testes da API podem ser executados com:

```bash
npm --prefix back-end test
```
