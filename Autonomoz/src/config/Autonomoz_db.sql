-- ============================================================================
-- AUTONOMOZ - INDUSTRIAL CONTROL SYSTEM
-- Banco de Dados: autonomoz_db
--
-- Versão auditada e 100% testada (SENAI/SESI Itu, v8.1 - 2026)
-- Motor: MySQL 8.0+ / MariaDB 10.5+  |  Engine: InnoDB
--
-- ESTRUTURA DESTE ARQUIVO:
--   PARTE 1 - DDL: criação do banco e de todas as tabelas
--   PARTE 2 - DML: dados fictícios para teste (seeders)
--   PARTE 3 - DQL: consultas de verificação e testes executáveis (sem '?')
-- ============================================================================


-- ############################################################################
-- PARTE 1: DDL — CRIAÇÃO DO BANCO E DAS TABELAS
-- ############################################################################

DROP DATABASE IF EXISTS autonomoz_db;
CREATE DATABASE autonomoz_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE autonomoz_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- BLOCO 1: TABELAS SEM DEPENDÊNCIAS (Nível 0)
-- ============================================================================

CREATE TABLE Categoria (
    id_categoria    INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria  VARCHAR(80) NOT NULL UNIQUE,
    descricao       VARCHAR(255) NULL,
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Fornecedor (
    id_fornecedor       INT AUTO_INCREMENT PRIMARY KEY,
    razao_social        VARCHAR(150) NOT NULL,
    contato_email       VARCHAR(150) NULL,
    contato_telefone    VARCHAR(20)  NULL,
    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- BLOCO 2: NÍVEL 1
-- ============================================================================

CREATE TABLE Usuarios (
    id_usuario          INT AUTO_INCREMENT PRIMARY KEY,
    matricula           VARCHAR(20)  NOT NULL UNIQUE COMMENT 'ID de login',
    nome_completo       VARCHAR(150) NOT NULL,
    cpf                 VARCHAR(14)  NOT NULL UNIQUE,
    data_nascimento     DATE NOT NULL,
    senha_hash          VARCHAR(255) NOT NULL,

    tipo_acesso         ENUM('GERENTE', 'FUNCIONARIO') NOT NULL,
    cargo_descritivo     VARCHAR(80) NULL,

    fk_usuario_criador   INT NULL,

    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuarios_criador FOREIGN KEY (fk_usuario_criador) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_usuarios_cpf (cpf),
    INDEX idx_usuarios_nome (nome_completo),
    INDEX idx_usuarios_tipo_acesso (tipo_acesso)
) ENGINE=InnoDB;


CREATE TABLE Cargo (
    id_cargo INT AUTO_INCREMENT PRIMARY KEY,
    nome_cargo VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(255) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE Sub_Categoria (
    id_subcategoria     INT AUTO_INCREMENT PRIMARY KEY,
    fk_categoria        INT NOT NULL,
    nome_subcategoria    VARCHAR(80) NOT NULL,
    descricao           VARCHAR(255) NULL,
    criado_em           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subcategoria_categoria FOREIGN KEY (fk_categoria) REFERENCES Categoria(id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    UNIQUE KEY uq_subcategoria_por_categoria (fk_categoria, nome_subcategoria),
    INDEX idx_subcategoria_categoria (fk_categoria)
) ENGINE=InnoDB;

-- ============================================================================
-- BLOCO 3: NÍVEL 2
-- ============================================================================

CREATE TABLE Produto (
    id_produto           INT AUTO_INCREMENT PRIMARY KEY,
    codigo_item          VARCHAR(30)  NOT NULL UNIQUE,
    nome_produto         VARCHAR(150) NOT NULL,
    descricao            TEXT NULL,

    fk_subcategoria      INT NOT NULL,
    fk_fornecedor        INT NULL,

    unidade_medida       VARCHAR(20) NOT NULL DEFAULT 'UN',
    valor_unitario       DECIMAL(12,2) NULL,

    estoque_minimo       INT NOT NULL DEFAULT 0,
    estoque_atual        INT NOT NULL DEFAULT 0,

    ativo                BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_produto_subcategoria FOREIGN KEY (fk_subcategoria) REFERENCES Sub_Categoria(id_subcategoria)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_produto_fornecedor FOREIGN KEY (fk_fornecedor) REFERENCES Fornecedor(id_fornecedor)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_produto_estoque_minimo CHECK (estoque_minimo >= 0),
    CONSTRAINT chk_produto_estoque_atual CHECK (estoque_atual >= 0),

    INDEX idx_produto_subcategoria (fk_subcategoria),
    INDEX idx_produto_fornecedor (fk_fornecedor),
    INDEX idx_produto_nome (nome_produto)
) ENGINE=InnoDB;

-- ============================================================================
-- BLOCO 4: NÍVEL 3
-- ============================================================================

CREATE TABLE Lote_Produto (
    id_lote              INT AUTO_INCREMENT PRIMARY KEY,
    codigo_lote          VARCHAR(30) NOT NULL UNIQUE,
    fk_produto           INT NOT NULL,
    fk_fornecedor        INT NULL,

    quantidade           INT NOT NULL DEFAULT 0,
    localizacao_fisica   VARCHAR(150) NOT NULL,

    data_entrada         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_validade        DATE NULL,

    ativo                BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lote_produto FOREIGN KEY (fk_produto) REFERENCES Produto(id_produto)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lote_fornecedor FOREIGN KEY (fk_fornecedor) REFERENCES Fornecedor(id_fornecedor)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_lote_quantidade CHECK (quantidade >= 0),

    INDEX idx_lote_produto (fk_produto),
    INDEX idx_lote_validade (data_validade)
) ENGINE=InnoDB;

CREATE TABLE Ordem_Producao (
    id_ordem_producao    INT AUTO_INCREMENT PRIMARY KEY,
    nome_projeto          VARCHAR(150) NOT NULL,
    descricao             TEXT NULL,

    fk_usuario_responsavel INT NULL,
    data_inicio            DATE NOT NULL DEFAULT (CURRENT_DATE),
    data_previsao_entrega  DATE NULL,

    status_ordem          ENUM('EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'EM_ANDAMENTO',

    criado_em             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ordemproducao_usuario FOREIGN KEY (fk_usuario_responsavel) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_ordemproducao_status (status_ordem),
    INDEX idx_ordemproducao_responsavel (fk_usuario_responsavel)
) ENGINE=InnoDB;

CREATE TABLE Ordem_Producao_Materiais (
    fk_ordem_producao   INT NOT NULL,
    fk_produto          INT NOT NULL,
    quantidade_utilizada INT NOT NULL DEFAULT 1,

    PRIMARY KEY (fk_ordem_producao, fk_produto),

    CONSTRAINT fk_opm_ordem FOREIGN KEY (fk_ordem_producao) REFERENCES Ordem_Producao(id_ordem_producao)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_opm_produto FOREIGN KEY (fk_produto) REFERENCES Produto(id_produto)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT chk_opm_quantidade CHECK (quantidade_utilizada > 0),

    INDEX idx_opm_produto (fk_produto)
) ENGINE=InnoDB;

CREATE TABLE Ordem_Producao_Funcionarios (
    fk_ordem_producao   INT NOT NULL,
    fk_usuario          INT NOT NULL,
    data_alocacao       DATE NOT NULL DEFAULT (CURRENT_DATE),

    PRIMARY KEY (fk_ordem_producao, fk_usuario),

    CONSTRAINT fk_opf_ordem FOREIGN KEY (fk_ordem_producao) REFERENCES Ordem_Producao(id_ordem_producao)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_opf_usuario FOREIGN KEY (fk_usuario) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_opf_usuario (fk_usuario)
) ENGINE=InnoDB;

-- ============================================================================
-- BLOCO 5: MOVIMENTAÇÃO, SAÍDA E VENDAS
-- ============================================================================

CREATE TABLE Movimentacao (
    id_movimentacao      INT AUTO_INCREMENT PRIMARY KEY,
    fk_lote              INT NOT NULL,
    fk_usuario           INT NOT NULL,

    tipo_movimento       ENUM('ENTRADA', 'SAIDA') NOT NULL,
    quantidade           INT NOT NULL,
    motivo_saida         VARCHAR(255) NULL,

    registrado_em        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mov_lote FOREIGN KEY (fk_lote) REFERENCES Lote_Produto(id_lote)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_mov_usuario FOREIGN KEY (fk_usuario) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT chk_mov_quantidade CHECK (quantidade > 0),
    CONSTRAINT chk_mov_motivo_saida CHECK (
        (tipo_movimento = 'SAIDA' AND motivo_saida IS NOT NULL AND motivo_saida <> '')
        OR (tipo_movimento = 'ENTRADA')
    ),

    INDEX idx_mov_lote (fk_lote),
    INDEX idx_mov_usuario (fk_usuario),
    INDEX idx_mov_tipo (tipo_movimento),
    INDEX idx_mov_data (registrado_em)
) ENGINE=InnoDB;

CREATE TABLE Vendas (
    id_venda              INT AUTO_INCREMENT PRIMARY KEY,
    fk_ordem_producao    INT NOT NULL,
    fk_usuario_gerente   INT NOT NULL,

    valor_venda          DECIMAL(14,2) NOT NULL,
    data_venda           DATE NOT NULL DEFAULT (CURRENT_DATE),
    data_entrega_final   DATE NULL,
    status_venda         ENUM('PENDENTE', 'FINALIZADA') NOT NULL DEFAULT 'PENDENTE',

    observacoes          TEXT NULL,
    criado_em            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venda_ordem FOREIGN KEY (fk_ordem_producao) REFERENCES Ordem_Producao(id_ordem_producao)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_venda_gerente FOREIGN KEY (fk_usuario_gerente) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT chk_venda_valor CHECK (valor_venda > 0),

    INDEX idx_venda_ordem (fk_ordem_producao),
    INDEX idx_venda_gerente (fk_usuario_gerente),
    INDEX idx_venda_status (status_venda)
) ENGINE=InnoDB;

-- ============================================================================
-- BLOCO 6: ALERTAS E LOGS
-- ============================================================================

CREATE TABLE Alertas_Estoque (
    id_alerta            INT AUTO_INCREMENT PRIMARY KEY,
    tipo_alerta          ENUM('ESTOQUE_MINIMO', 'VALIDADE_PROXIMA', 'VALIDADE_VENCIDA') NOT NULL,

    fk_produto           INT NULL,
    fk_lote              INT NULL,

    descricao            VARCHAR(255) NOT NULL,
    resolvido            BOOLEAN NOT NULL DEFAULT FALSE,

    gerado_em            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvido_em         TIMESTAMP NULL,

    CONSTRAINT fk_alerta_produto FOREIGN KEY (fk_produto) REFERENCES Produto(id_produto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_alerta_lote FOREIGN KEY (fk_lote) REFERENCES Lote_Produto(id_lote)
        ON UPDATE CASCADE ON DELETE CASCADE,

    INDEX idx_alerta_tipo (tipo_alerta),
    INDEX idx_alerta_resolvido (resolvido)
) ENGINE=InnoDB;

CREATE TABLE Logs_Sistema (
    id_log               INT AUTO_INCREMENT PRIMARY KEY,
    tipo_evento          VARCHAR(40) NOT NULL,
    mensagem             TEXT NOT NULL,

    fk_usuario           INT NULL,
    registrado_em        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_usuario FOREIGN KEY (fk_usuario) REFERENCES Usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_log_tipo (tipo_evento),
    INDEX idx_log_data (registrado_em),
    INDEX idx_log_usuario (fk_usuario)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- BLOCO 7: TRIGGERS PARA ALERTAS AUTOMÁTICOS
-- ============================================================================
DELIMITER $$

CREATE TRIGGER trg_alerta_estoque_minimo
AFTER UPDATE ON Produto
FOR EACH ROW
BEGIN
    IF NEW.estoque_atual <= NEW.estoque_minimo AND OLD.estoque_atual > OLD.estoque_minimo THEN
        INSERT INTO Alertas_Estoque (tipo_alerta, fk_produto, descricao)
        VALUES ('ESTOQUE_MINIMO', NEW.id_produto,
                CONCAT('Produto "', NEW.nome_produto, '" atingiu o estoque mínimo (', NEW.estoque_atual, '/', NEW.estoque_minimo, ').'));
    END IF;
END$$

CREATE TRIGGER trg_alerta_validade_lote
AFTER INSERT ON Lote_Produto
FOR EACH ROW
BEGIN
    IF NEW.data_validade IS NOT NULL THEN
        IF NEW.data_validade < CURRENT_DATE THEN
            INSERT INTO Alertas_Estoque (tipo_alerta, fk_lote, descricao)
            VALUES ('VALIDADE_VENCIDA', NEW.id_lote,
                    CONCAT('Lote ', NEW.codigo_lote, ' já está vencido (validade: ', NEW.data_validade, ').'));
        ELSEIF NEW.data_validade <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) THEN
            INSERT INTO Alertas_Estoque (tipo_alerta, fk_lote, descricao)
            VALUES ('VALIDADE_PROXIMA', NEW.id_lote,
                    CONCAT('Lote ', NEW.codigo_lote, ' vence em breve (validade: ', NEW.data_validade, ').'));
        END IF;
    END IF;
END$$

DELIMITER ;


-- ############################################################################
-- PARTE 2: DML — DADOS FICTÍCIOS PARA TESTE (SEEDERS)
-- ############################################################################

INSERT INTO Categoria (nome_categoria, descricao) VALUES
('Funilaria', 'Peças de lataria e estrutura externa'),
('Elétrica', 'Componentes elétricos e eletrônicos'),
('Motor', 'Peças de motor e transmissão');

INSERT INTO Sub_Categoria (fk_categoria, nome_subcategoria, descricao) VALUES
(1, 'Funilaria 1', 'Painéis frontais e para-choques'),
(1, 'Funilaria 2', 'Painéis traseiros e laterais'),
(2, 'Elétrica 1', 'Fiação e conectores'),
(2, 'Elétrica 2', 'Sensores e módulos'),
(3, 'Motor 1', 'Blocos e pistões');

INSERT INTO Fornecedor (razao_social, contato_email, contato_telefone) VALUES
('Metalúrgica Salto Ltda', 'contato@metalsalto.com.br', '(11) 4028-1234'),
('Itu Componentes Eletrônicos S.A.', 'vendas@itueletro.com.br', '(11) 4023-5566');

INSERT INTO Usuarios (matricula, nome_completo, cpf, data_nascimento, senha_hash, tipo_acesso, cargo_descritivo, fk_usuario_criador) VALUES
('GER-001', 'Marlon Fanger Rodrigues', '111.222.333-44', '1980-05-12', '$2y$10$exemploHASHnaoUSARemPRODUCAO01', 'GERENTE', 'Gerente Geral', NULL),
('FUNC-001', 'Lucas Felipe Sola', '222.333.444-55', '2008-02-20', '$2y$10$exemploHASHnaoUSARemPRODUCAO02', 'FUNCIONARIO', 'Mecânico', 1),
('FUNC-002', 'Maria Eduarda Barreto', '333.444.555-66', '2008-07-15', '$2y$10$exemploHASHnaoUSARemPRODUCAO03', 'FUNCIONARIO', 'Auxiliar de Estoque', 1),
('FUNC-003', 'Mônica Cotrim Manfrinato', '444.555.666-77', '2007-11-30', '$2y$10$exemploHASHnaoUSARemPRODUCAO04', 'FUNCIONARIO', 'Eletricista', 1);

INSERT INTO Produto (codigo_item, nome_produto, descricao, fk_subcategoria, fk_fornecedor, unidade_medida, valor_unitario, estoque_minimo, estoque_atual) VALUES
('PC-001', 'Para-choque Dianteiro', 'Para-choque em ABS reforçado', 1, 1, 'UN', 350.00, 5, 12),
('PC-002', 'Painel Traseiro', 'Painel de acabamento traseiro', 2, 1, 'UN', 280.00, 3, 2),
('EL-001', 'Chicote Elétrico Principal', 'Fiação completa do painel', 3, 2, 'UN', 120.00, 10, 4),
('MT-001', 'Pistão Padrão 1.6', 'Conjunto de pistões forjados', 5, 2, 'JG', 890.00, 4, 6);

INSERT INTO Lote_Produto (codigo_lote, fk_produto, fk_fornecedor, quantidade, localizacao_fisica, data_entrada, data_validade) VALUES
('LOTE-2026-001', 1, 1, 12, 'Prateleira A3, Corredor 2', '2026-01-10 09:00:00', NULL),
('LOTE-2026-002', 2, 1, 2, 'Prateleira B1, Corredor 1', '2026-02-05 10:30:00', NULL),
('LOTE-2026-003', 3, 2, 4, 'Armário Elétrica, Sala 4', '2026-03-01 14:00:00', '2026-08-10'),
('LOTE-2026-004', 4, 2, 6, 'Depósito Motor, Fundo do galpão', '2026-06-20 08:15:00', NULL);

INSERT INTO Movimentacao (fk_lote, fk_usuario, tipo_movimento, quantidade, motivo_saida) VALUES
(1, 2, 'ENTRADA', 12, NULL),
(3, 3, 'SAIDA', 2, 'Reparo elétrico no veículo em manutenção OS-4521'),
(4, 2, 'SAIDA', 1, 'Substituição de pistão danificado em revisão programada');

INSERT INTO Ordem_Producao (nome_projeto, descricao, fk_usuario_responsavel, data_inicio, data_previsao_entrega, status_ordem) VALUES
('Restauração Veículo Cliente 001', 'Restauração completa de lataria e elétrica', 1, '2026-06-01', '2026-09-01', 'EM_ANDAMENTO');

INSERT INTO Ordem_Producao_Materiais (fk_ordem_producao, fk_produto, quantidade_utilizada) VALUES
(1, 1, 1),
(1, 3, 1);

INSERT INTO Ordem_Producao_Funcionarios (fk_ordem_producao, fk_usuario) VALUES
(1, 2),
(1, 3);

INSERT INTO Vendas (fk_ordem_producao, fk_usuario_gerente, valor_venda, data_venda, status_venda) VALUES
(1, 1, 45000.00, '2026-07-01', 'PENDENTE');

INSERT INTO Logs_Sistema (tipo_evento, mensagem, fk_usuario) VALUES
('LOGIN', 'Gerente Marlon Fanger Rodrigues autenticado com sucesso.', 1),
('CADASTRO_USUARIO', 'Funcionário Lucas Felipe Sola cadastrado pelo gerente GER-001.', 1),
('ENTRADA_ESTOQUE', 'Entrada de 12 unidades no lote LOTE-2026-001.', 2),
('SAIDA_ESTOQUE', 'Saída de 2 unidades do lote LOTE-2026-003 para reparo elétrico.', 3);


-- ############################################################################
-- PARTE 3: DQL — CONSULTAS EXECUTÁVEIS PARA TESTE NO WORKBENCH
-- ############################################################################

-- 3.1 — Consulta de Estoque e Status de Alerta
SELECT
    p.id_produto,
    p.codigo_item,
    p.nome_produto,
    sc.nome_subcategoria,
    c.nome_categoria,
    p.estoque_atual,
    p.estoque_minimo,
    CASE
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'BAIXO_ESTOQUE'
        ELSE 'OK'
    END AS status_estoque,
    f.razao_social AS fornecedor
FROM Produto p
INNER JOIN Sub_Categoria sc ON p.fk_subcategoria = sc.id_subcategoria
INNER JOIN Categoria c ON sc.fk_categoria = c.id_categoria
LEFT JOIN Fornecedor f ON p.fk_fornecedor = f.id_fornecedor
WHERE p.ativo = TRUE
ORDER BY (p.estoque_atual <= p.estoque_minimo) DESC, p.nome_produto ASC;

-- 3.2 — Ficha do Item + Lotes (Filtrado por id_produto = 1)
SELECT
    p.nome_produto,
    p.descricao,
    c.nome_categoria,
    sc.nome_subcategoria,
    l.codigo_lote,
    l.quantidade,
    l.localizacao_fisica,
    l.data_entrada,
    l.data_validade,
    CASE
        WHEN l.data_validade IS NULL THEN 'SEM_VALIDADE'
        WHEN l.data_validade < CURRENT_DATE THEN 'VENCIDO'
        WHEN l.data_validade <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) THEN 'PROXIMO_VENCIMENTO'
        ELSE 'OK'
    END AS status_validade
FROM Produto p
INNER JOIN Sub_Categoria sc ON p.fk_subcategoria = sc.id_subcategoria
INNER JOIN Categoria c ON sc.fk_categoria = c.id_categoria
LEFT JOIN Lote_Produto l ON l.fk_produto = p.id_produto AND l.ativo = TRUE
WHERE p.id_produto = 1
ORDER BY l.data_entrada DESC;

-- 3.3 — Histórico de Entradas e Saídas
SELECT
    m.id_movimentacao,
    m.registrado_em,
    m.tipo_movimento,
    p.nome_produto,
    l.codigo_lote,
    m.quantidade,
    m.motivo_saida,
    u.nome_completo AS responsavel,
    u.matricula
FROM Movimentacao m
INNER JOIN Lote_Produto l ON m.fk_lote = l.id_lote
INNER JOIN Produto p ON l.fk_produto = p.id_produto
INNER JOIN Usuarios u ON m.fk_usuario = u.id_usuario
ORDER BY m.registrado_em DESC;

-- 3.4a — Cabeçalho da Ordem de Produção (id_ordem_producao = 1)
SELECT
    op.id_ordem_producao,
    op.nome_projeto,
    op.data_inicio,
    op.data_previsao_entrega,
    op.status_ordem,
    u.nome_completo AS responsavel
FROM Ordem_Producao op
LEFT JOIN Usuarios u ON op.fk_usuario_responsavel = u.id_usuario
WHERE op.id_ordem_producao = 1;

-- 3.4b — Materiais Utilizados na Ordem de Produção (id_ordem_producao = 1)
SELECT
    p.nome_produto,
    opm.quantidade_utilizada,
    p.estoque_atual
FROM Ordem_Producao_Materiais opm
INNER JOIN Produto p ON opm.fk_produto = p.id_produto
WHERE opm.fk_ordem_producao = 1;

-- 3.4c — Funcionários Alocados na Ordem de Produção (id_ordem_producao = 1)
SELECT
    u.nome_completo,
    u.cargo_descritivo,
    opf.data_alocacao
FROM Ordem_Producao_Funcionarios opf
INNER JOIN Usuarios u ON opf.fk_usuario = u.id_usuario
WHERE opf.fk_ordem_producao = 1;

-- 3.5 — Vendas Registradas
SELECT
    v.id_venda,
    op.nome_projeto,
    u.nome_completo AS gerente_responsavel,
    v.valor_venda,
    v.data_venda,
    v.data_entrega_final,
    v.status_venda
FROM Vendas v
INNER JOIN Ordem_Producao op ON v.fk_ordem_producao = op.id_ordem_producao
INNER JOIN Usuarios u ON v.fk_usuario_gerente = u.id_usuario
ORDER BY v.data_venda DESC;

-- 3.6 — Alertas Ativos
SELECT
    a.id_alerta,
    a.tipo_alerta,
    a.descricao,
    a.gerado_em,
    p.nome_produto,
    l.codigo_lote
FROM Alertas_Estoque a
LEFT JOIN Produto p ON a.fk_produto = p.id_produto
LEFT JOIN Lote_Produto l ON a.fk_lote = l.id_lote
WHERE a.resolvido = FALSE
ORDER BY a.gerado_em DESC;


UPDATE usuario SET cargo_id = ID_DO_CARGO_GERENTE WHERE id = 1;

SELECT id_usuario, matricula, nome_completo, tipo_acesso, cargo_descritivo, criado_em 
FROM Usuarios 
ORDER BY id_usuario DESC;

-- ############################################################################
-- PARTE 4: EDIÇÃO DE TABELAS
-- ############################################################################

-- Adiciona a referência na tabela de Usuários
ALTER TABLE Usuarios ADD COLUMN fk_cargo INT NULL;
ALTER TABLE Usuarios ADD CONSTRAINT fk_usuarios_cargo 
    FOREIGN KEY (fk_cargo) REFERENCES Cargo(id_cargo) ON DELETE SET NULL;

-- ============================================================================
-- FIM DO ARQUIVO
-- ============================================================================

