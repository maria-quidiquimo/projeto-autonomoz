# Autonomoz

Sistema de controle de estoque e apoio à produção. O projeto tem front-end em React/Vite, API em Node.js/Express e banco de dados MySQL.

## Requisitos

- Node.js 20.19+ (ou 22.12+) e npm.
- MySQL 8+ ou MariaDB 10.5+.

## Configuração e execução local

1. Instale as dependências, na raiz do repositório:

   ```bash
   npm --prefix back-end install
   npm --prefix front-end install
   ```

2. Crie o banco executando [`Autonomoz_db.sql`](./back-end/src/config/Autonomoz_db.sql) no MySQL Workbench ou pelo terminal:

   ```powershell
   cmd /c "mysql -u root -p < back-end\src\config\Autonomoz_db.sql"
   ```

   **Atenção:** o script apaga e recria `autonomoz_db`. Use-o somente em uma instalação descartável ou depois de fazer backup.

3. Copie `back-end/.env.example` para `back-end/.env` e configure as credenciais do banco (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=autonomoz_db` e `DB_PORT`). Defina também `JWT_SECRET` com um segredo aleatório. Para gerá-lo:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Não compartilhe nem versione o arquivo `.env`. Se o MySQL estiver indisponível, a API ainda inicia, mas as operações que dependem do banco não funcionarão.

4. Copie `front-end/.env.example` para `front-end/.env`. A configuração local padrão é `VITE_API_URL=/api`; o Vite encaminha as chamadas para a API em `http://localhost:3000`.

5. Abra dois terminais na raiz do projeto e inicie os serviços:

   ```bash
   npm --prefix back-end start
   ```

   ```bash
   npm --prefix front-end run dev
   ```

   Acesse <http://localhost:5173>. A API fica disponível em <http://localhost:3000/api>.

   Se a API estiver em outro endereço, configure `VITE_API_PROXY_TARGET` para o destino do back-end. Para um front-end compilado servido em outro domínio, configure `VITE_API_URL` com a URL da API incluindo `/api`.

### Atualizações em banco existente

O script [`Autonomoz_db.sql`](./back-end/src/config/Autonomoz_db.sql) cria um banco novo e apaga o banco `autonomoz_db` antes de recriá-lo. **Não execute o script completo para atualizar um banco com dados.**

Confira as colunas antes de aplicar as alterações. Execute cada `ALTER TABLE` somente se a respectiva coluna ainda não existir:

```sql
ALTER TABLE Sub_Categoria
ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE Usuarios
ADD COLUMN cargo_descritivo VARCHAR(100) NULL;

ALTER TABLE Ordem_Producao
ADD COLUMN status_ordem ENUM('EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')
NOT NULL DEFAULT 'EM_ANDAMENTO';
```

Se a coluna já existir, não execute novamente o comando correspondente. Após a migração, reinicie o back-end.

Para habilitar todos os tipos de alerta operacionais em um banco criado anteriormente, aplique:

```sql
ALTER TABLE Alertas_Estoque
MODIFY tipo_alerta ENUM(
  'ESTOQUE_MINIMO',
  'VALIDADE_PROXIMA',
  'VALIDADE_VENCIDA',
  'ANOMALIA_PRODUCAO',
  'DIVERGENCIA_FISICA'
) NOT NULL;
```

### Atualização do estoque

O estoque atual do produto é calculado a partir das quantidades dos lotes ativos. Para registrar recebimentos, cadastre um lote em **Lotes & Rastreabilidade Física** ou registre uma movimentação do tipo **Entrada no Estoque**. Para baixas, use **Saída para Produção/Oficina**; não altere o estoque atual diretamente no cadastro do produto.

### Usuários de demonstração

Os usuários inseridos pelo script SQL são destinados apenas ao desenvolvimento local:

- Gerente: matrícula `GER-001`, senha `123`.
- Funcionários: matrículas `FUNC-001`, `FUNC-002` e`FUNC-003` senha `1234`.

Não use essas credenciais em produção.

## Testes e build

```bash
npm --prefix back-end test
npm --prefix front-end run lint
npm --prefix front-end run build
```

O build do front-end também pode ser executado com `npm --prefix back-end run build`.

## Equipe

**Integrantes**

- Lucas Felipe Sola
- Maria Eduarda Quidiquimo Barreto
- Mônica Cotrim Manfrinato
- Vinicius de Souza Monteiro

**Professores**

- Celso Giusti
- Daniel Manoel Filho
- Marlon Palata Fanger Rodrigues
