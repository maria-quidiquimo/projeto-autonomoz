# Autonomoz

Aplicação para controle de estoque e apoio à produção, com interface web em React e API REST em Node.js/Express, integrada a um banco de dados MySQL.

## Sumário

- [Visão geral](#visão-geral)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Executar em uma máquina nova](#executar-em-uma-máquina-nova)
- [Executar o sistema](#executar-o-sistema)
- [Testes e build](#testes-e-build)
- [API](#api)
  - [Autenticação e autorização](#autenticação-e-autorização)
  - [Rotas disponíveis](#rotas-disponíveis)
  - [Exemplos de requisição e resposta](#exemplos-de-requisição-e-resposta)
- [Integrantes e professores](#integrantes-e-professores)

## Visão geral

O Autonomoz oferece recursos para consultar e administrar produtos, estoque, lotes, movimentações, fornecedores, categorias, ordens de produção, vendas, alertas e usuários. O acesso à API é autenticado com JWT; algumas operações de administração são exclusivas de gerentes.

| Parte | Tecnologia | Diretório |
| --- | --- | --- |
| Front-end | React, Vite e Tailwind CSS | [`front-end/`](./front-end/) |
| Back-end | Node.js, Express e MySQL | [`back-end/`](./back-end/) |
| Materiais de design | Referências e recursos visuais | [`design/`](./design/) |

## Estrutura do projeto

```text
projeto-autonomoz/
├── back-end/
│   ├── src/
│   │   ├── config/       # Conexão e script SQL do banco
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── __tests__/    # Testes automatizados da API
│   ├── .env.example
│   └── package.json
├── design/
├── front-end/
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Requisitos

- Git.
- Node.js **20.19 ou superior** (ou **22.12 ou superior**) e npm. A versão mínima acompanha os requisitos do Vite utilizado pelo front-end.
- MySQL 8+ ou MariaDB 10.5+, em execução e acessível localmente.

## Executar em uma máquina nova

### 1. Obter o código e instalar dependências

```bash
git clone https://github.com/maria-quidiquimo/projeto-autonomoz.git
cd projeto-autonomoz
npm --prefix back-end install
npm --prefix front-end install
```

### 2. Criar o banco de dados local

O script [`Autonomoz_db.sql`](./back-end/src/config/Autonomoz_db.sql) cria o banco `autonomoz_db`, as tabelas e dados de demonstração.

> **Atenção:** o script começa com `DROP DATABASE IF EXISTS autonomoz_db`. Isso apaga e recria o banco com esse nome, incluindo todos os dados que já estiverem nele. Execute-o somente em uma instalação local descartável ou depois de fazer backup. Não o execute em um banco com dados que deseja preservar.

No PowerShell, a partir da pasta raiz do repositório:

```powershell
cmd /c "mysql -u root -p < back-end\src\config\Autonomoz_db.sql"
```

Informe a senha do usuário MySQL quando solicitado. Alternativamente, abra e execute o arquivo no MySQL Workbench. Se seu servidor usar outro usuário ou porta, ajuste o comando de acordo com a configuração local.

No Bash (Linux/macOS), o comando equivalente é:

```bash
mysql -u root -p < back-end/src/config/Autonomoz_db.sql
```

### 3. Configurar o back-end

Crie `back-end/.env` copiando `back-end/.env.example` e informe os dados do seu MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=autonomoz_db
DB_PORT=3306
```

Use `DB_PASSWORD=` se o usuário local não tiver senha. O banco precisa estar criado antes de iniciar a API. A aplicação usa `JWT_SECRET` para assinar tokens; se não estiver definido, o código atual utiliza um valor de fallback destinado ao desenvolvimento. Para um ambiente próprio, defina também um segredo aleatório em `back-end/.env` e não o compartilhe:

```env
JWT_SECRET=coloque_aqui_um_segredo_aleatorio
```

### 4. Configurar o front-end

Crie `front-end/.env` a partir de `front-end/.env.example`. Para a configuração local padrão:

```env
VITE_API_URL=http://localhost:3000
```

O front-end envia as chamadas para esse endereço. Se a API estiver em outra máquina ou porta, altere a URL e permita a origem correspondente na configuração do servidor.

### 5. Credenciais locais

O SQL inclui usuários de demonstração (matrículas `GER-001`, `FUNC-001`, `FUNC-002` e `FUNC-003`), mas não documenta uma senha em texto puro. Não há uma senha padrão publicada neste README. Utilize as credenciais fornecidas pela equipe ou defina uma senha de desenvolvimento atualizando o hash bcrypt de um usuário local. Com as dependências do back-end instaladas, gere um hash no terminal:

```bash
cd back-end
node -e "require('bcrypt').hash('sua-senha-local', 10).then(console.log)"
cd ..
```

Copie o hash produzido e atualize `senha_hash` para a matrícula desejada no banco local, por exemplo no MySQL Workbench:

```sql
UPDATE Usuarios
SET senha_hash = '<hash_bcrypt_gerado>'
WHERE matricula = 'GER-001';
```

Use uma senha local de teste; não reutilize credenciais reais.

## Executar o sistema

Inicie a API em um terminal, a partir da raiz:

```bash
npm --prefix back-end start
```

Inicie o front-end em outro terminal:

```bash
npm --prefix front-end run dev
```

Endereços padrão:

- Interface: <http://localhost:5173>
- API: <http://localhost:3000>

O script de desenvolvimento do back-end (`npm --prefix back-end run dev`) usa `npx nodemon`; o `nodemon` não está listado nas dependências do projeto e pode precisar ser instalado/disponibilizado separadamente.

## Testes e build

Os testes automatizados do back-end usam Jest. Execute-os a partir da raiz do repositório:

```bash
# Todos os testes
npm --prefix back-end test

# Todos os testes com relatório de cobertura
npm --prefix back-end run test:coverage

# Suítes específicas
npm --prefix back-end run test:usuarios
npm --prefix back-end run test:produtos
npm --prefix back-end run test:lotes
npm --prefix back-end run test:producao
npm --prefix back-end run test:pipeline
```

Os testes específicos correspondem, respectivamente, a usuários, produtos, lotes, ordens de produção e pipeline, conforme os scripts definidos em `back-end/package.json`.

Para validar o front-end:

```bash
npm --prefix front-end run lint
npm --prefix front-end run build
```

O comando abaixo, também disponível no back-end, compila o front-end:

```bash
npm --prefix back-end run build
```

Depois do build, a API pode servir os arquivos estáticos gerados em `front-end/dist`; para iniciar o servidor, execute `npm --prefix back-end start`.

## API

**Base URL:** `http://localhost:3000`

As rotas estão disponíveis tanto diretamente (por exemplo, `/produtos`) quanto com o prefixo `/api` (por exemplo, `/api/produtos`). Os exemplos abaixo usam o caminho sem prefixo.

### Autenticação e autorização

Exceto `POST /usuarios/login`, as rotas listadas exigem um token JWT. Envie-o no cabeçalho:

```http
Authorization: Bearer <token>
```

Rotas de escrita de usuários, cargos, vendas e todas as rotas de logs do sistema exigem também um usuário com `tipo_acesso: "GERENTE"`. As demais rotas exigem apenas autenticação, de acordo com os middlewares registrados na API.

- Sem token: `401` com mensagem `Token de autenticação não fornecido.`
- Token inválido ou expirado: `403` com mensagem `Token inválido ou expirado.`
- Usuário sem permissão de gerente em rota restrita: `403` com mensagem de acesso negado.

### Rotas disponíveis

O marcador `:id` representa o identificador do recurso. Salvo indicação em contrário, os caminhos exigem autenticação.

#### Usuários — `/usuarios`

| Método | Caminho | Acesso | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/usuarios/login` | Público | Autenticar pela matrícula e senha |
| `GET` | `/usuarios` | Autenticado | Listar usuários |
| `GET` | `/usuarios/cargos` | Autenticado | Consultar cargos disponíveis |
| `GET` | `/usuarios/gerenciamento` | Gerente | Listar dados para gerenciamento |
| `GET` | `/usuarios/:id` | Autenticado | Consultar usuário pelo ID |
| `POST` | `/usuarios` | Gerente | Cadastrar usuário |
| `PATCH` | `/usuarios/:id` | Gerente | Atualizar usuário |
| `PUT` | `/usuarios/:id` | Gerente | Atualizar usuário (mesmo controller do `PATCH`) |
| `DELETE` | `/usuarios/:id` | Gerente | Remover usuário |

#### Fornecedores — `/fornecedores`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/fornecedores` | Listar fornecedores |
| `GET` | `/fornecedores/:id` | Consultar fornecedor |
| `POST` | `/fornecedores` | Cadastrar fornecedor |
| `PUT` | `/fornecedores/:id` | Atualizar fornecedor |
| `DELETE` | `/fornecedores/:id` | Remover fornecedor |

#### Produtos — `/produtos`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/produtos` | Listar produtos ativos |
| `GET` | `/produtos/:id` | Consultar produto |
| `POST` | `/produtos` | Cadastrar produto |
| `PUT` | `/produtos/:id` | Atualizar produto |
| `DELETE` | `/produtos/:id` | Remover/inativar produto |

Na listagem, `pagina` e `limite` são parâmetros de query opcionais; `limite` tem máximo de 100. Se qualquer um deles for informado, a resposta contém `dados` e `paginacao`; sem eles, a resposta é uma lista.

#### Categorias — `/categorias`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/categorias` | Listar categorias |
| `GET` | `/categorias/:id` | Consultar categoria |
| `POST` | `/categorias` | Cadastrar categoria |
| `PUT` | `/categorias/:id` | Atualizar categoria |
| `DELETE` | `/categorias/:id` | Remover categoria |

#### Subcategorias — `/subcategoria`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/subcategoria` | Listar subcategorias |
| `GET` | `/subcategoria/:id` | Consultar subcategoria |
| `POST` | `/subcategoria` | Cadastrar subcategoria |
| `PUT` | `/subcategoria/:id` | Atualizar subcategoria |
| `DELETE` | `/subcategoria/:id` | Remover subcategoria |

#### Lotes — `/lotes`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/lotes` | Listar lotes |
| `GET` | `/lotes/:id` | Consultar lote |
| `POST` | `/lotes` | Cadastrar lote |
| `PUT` | `/lotes/:id` | Atualizar lote |
| `DELETE` | `/lotes/:id` | Remover lote |

Ao cadastrar um lote com quantidade inicial maior que zero, o sistema grava o lote com saldo zero e registra a entrada inicial pela mesma rotina de movimentações. O cadastro, a atualização do saldo do produto e a movimentação são feitos na mesma transação; o usuário autenticado é associado aos registros de auditoria.

#### Movimentações — `/movimentacoes`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/movimentacoes` | Listar movimentações |
| `GET` | `/movimentacoes/:id` | Consultar movimentação |
| `POST` | `/movimentacoes` | Registrar movimentação |
| `POST` | `/movimentacoes/ajuste` | Ajustar estoque |

Movimentações são imutáveis: não há rotas para editar ou excluir lançamentos. Para corrigir um registro, faça uma movimentação compensatória (por exemplo, `AJUSTE_POSITIVO` ou `AJUSTE_NEGATIVO`) com a justificativa correspondente. O saldo é atualizado pelo fluxo normal e o histórico preserva o lançamento original e sua correção.

#### Ordens de produção — `/ordem_producao`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/ordem_producao` | Listar ordens |
| `GET` | `/ordem_producao/:id` | Consultar ordem |
| `POST` | `/ordem_producao` | Cadastrar ordem |
| `PUT` | `/ordem_producao/:id` | Atualizar ordem |
| `DELETE` | `/ordem_producao/:id` | Remover ordem |

#### Materiais de ordens de produção — `/ordem_producao_materiais`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/ordem_producao_materiais` | Listar materiais vinculados |
| `GET` | `/ordem_producao_materiais/:id` | Consultar vínculo |
| `POST` | `/ordem_producao_materiais` | Cadastrar vínculo de material |
| `PUT` | `/ordem_producao_materiais/:id` | Atualizar vínculo |
| `DELETE` | `/ordem_producao_materiais/:id` | Remover vínculo |

#### Funcionários de ordens de produção — `/ordem_producao_funcionario`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/ordem_producao_funcionario` | Listar funcionários vinculados |
| `GET` | `/ordem_producao_funcionario/:id` | Consultar vínculo |
| `POST` | `/ordem_producao_funcionario` | Vincular funcionário |
| `PUT` | `/ordem_producao_funcionario/:id` | Atualizar vínculo |
| `DELETE` | `/ordem_producao_funcionario/:id` | Remover vínculo |

#### Vendas — `/vendas`

| Método | Caminho | Acesso | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/vendas` | Autenticado | Listar vendas |
| `GET` | `/vendas/:id` | Autenticado | Consultar venda |
| `POST` | `/vendas` | Gerente | Cadastrar venda |
| `PUT` | `/vendas/:id` | Gerente | Atualizar venda |
| `DELETE` | `/vendas/:id` | Gerente | Remover venda |

#### Alertas de estoque — `/alertas_estoque`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/alertas_estoque` | Listar alertas |
| `GET` | `/alertas_estoque/:id` | Consultar alerta |
| `POST` | `/alertas_estoque` | Cadastrar alerta |
| `PUT` | `/alertas_estoque/:id` | Atualizar alerta |
| `DELETE` | `/alertas_estoque/:id` | Remover alerta |

#### Logs do sistema — `/logs_sistema`

| Método | Caminho | Acesso | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/logs_sistema` | Gerente | Listar logs |
| `GET` | `/logs_sistema/:id` | Gerente | Consultar log |
| `POST` | `/logs_sistema` | Gerente | Cadastrar log |
| `PUT` | `/logs_sistema/:id` | Gerente | Atualizar log |
| `DELETE` | `/logs_sistema/:id` | Gerente | Remover log |

#### Cargos — `/cargos`

| Método | Caminho | Acesso | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/cargos` | Autenticado | Listar cargos |
| `GET` | `/cargos/:id` | Autenticado | Consultar cargo |
| `POST` | `/cargos` | Gerente | Cadastrar cargo |
| `PUT` | `/cargos/:id` | Gerente | Atualizar cargo |
| `DELETE` | `/cargos/:id` | Gerente | Remover cargo |

#### Localizações — `/localizacoes`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/localizacoes` | Listar localizações |
| `GET` | `/localizacoes/lotes` | Buscar lotes por localização |
| `GET` | `/localizacoes/:id` | Consultar localização |

#### Dashboard — `/dashboard`

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/dashboard` | Obter métricas, movimentações recentes e alertas recentes |
| `GET` | `/dashboard/kpis` | Obter o mesmo conjunto de métricas |

### Exemplos de requisição e resposta

#### Login

```http
POST http://localhost:3000/usuarios/login
Content-Type: application/json
```

```json
{
  "matricula": "GER-001",
  "senha": "sua-senha-local"
}
```

Resposta `200 OK` (o token e os dados retornados variam por usuário):

```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "<JWT retornado pela API>",
  "usuario": {
    "id_usuario": 1,
    "matricula": "GER-001",
    "nome": "Nome cadastrado",
    "tipo_acesso": "GERENTE"
  }
}
```

#### Cadastrar um produto

Substitua `1` nos campos de referência por IDs existentes no seu banco. A API cadastra o estoque inicial como zero; entradas de estoque devem ser feitas pelas rotas de lotes e movimentações.

```http
POST http://localhost:3000/produtos
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "codigo_item": "PC-EXEMPLO-01",
  "nome_produto": "Peça de demonstração",
  "descricao": "Item usado para demonstrar a API",
  "fk_subcategoria": 1,
  "fk_fornecedor": 1,
  "unidade_medida": "UN",
  "valor_unitario": 25.5,
  "estoque_minimo": 3
}
```

Resposta `201 Created`:

```json
{
  "id_produto": 5,
  "codigo_item": "PC-EXEMPLO-01",
  "nome_produto": "Peça de demonstração",
  "descricao": "Item usado para demonstrar a API",
  "fk_subcategoria": 1,
  "fk_fornecedor": 1,
  "unidade_medida": "UN",
  "valor_unitario": 25.5,
  "estoque_minimo": 3
}
```

#### Listar produtos com paginação

```http
GET http://localhost:3000/produtos?pagina=1&limite=20
Authorization: Bearer <token>
```

Resposta `200 OK`:

```json
{
  "dados": [
    {
      "id_produto": 1,
      "codigo_item": "PC-001",
      "nome_produto": "Para-choque Dianteiro",
      "estoque_atual": 12,
      "estoque_minimo": 5,
      "ativo": 1
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 4,
    "totalPaginas": 1
  }
}
```

## Integrantes e professores

### Professores

- Celso Giusti
- Daniel Manoel Filho
- Marlon Palata Fanger Rodrigues

### Integrantes

- Lucas Felipe Sola
- Maria Eduarda Quidiquimo Barreto
- Mônica Cotrim Manfrinato
- Vinicius de Souza Monteiro
