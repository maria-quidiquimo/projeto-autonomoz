---
name: Painel Operacional Autonomoz
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5a4138'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8e7166'
  outline-variant: '#e2bfb2'
  surface-tint: '#a73a00'
  primary: '#a33900'
  on-primary: '#ffffff'
  primary-container: '#cc4900'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb599'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006194'
  on-tertiary: '#ffffff'
  tertiary-container: '#007bb9'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-metric:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

O design system estabelece uma linguagem visual industrial, focada em sistemas de controle de chão de fábrica (MES/ICS) para oficinas mecânicas e usinagem automotiva. A interface equilibra a precisão de um software de telemetria com a ergonomia necessária para operadores com luvas ou dispositivos touch rugged em bancadas de trabalho.

### Personalidade da Marca
- **Operacional e Confiável:** Comunica robustez estrutural, tolerância zero a ambiguidade de dados e feedback imediato de status operacional.
- **Ergonômico e Funcional:** Prioriza contraste visual, áreas de toque ampliadas (touch targets mínimos de 44px) e legibilidade sob iluminação industrial direta.
- **Direto e Pragmático:** Vocabulário operacional estritamente em português brasileiro (pt-BR), eliminando termos vagos em prol de nomenclatura padronizada da norma automotiva e logística (SKU, OP, Lote, Vencimento, Parada).

### Movimento Estético: Industrial Flat Utilitário
Combina a sobriedade de consoles de controle escuros nas áreas estruturais de comando (sidebar e header de linha) com áreas de trabalho claras, cartões nítidos de alta visibilidade e acentos vibrantes inspirados em sinalização de segurança industrial (Safety Orange).

## Colors

A matriz cromática segue a lógica de zonamento funcional: navegação e hierarquia de contexto usam tons profundos de ardósia (Slate); a área de trabalho utiliza cinzas neutros de baixa fadiga ocular; e a atenção do operador é guiada estritamente por cores com valor funcional semafórico.

### Paleta Estrutural
- **Laranja Industrial (Primária - `#ea580c` / Hover `#c2410c` / Soft `#ffedd5`):** Reservado para ações afirmativas primárias (Iniciar OP, Confirmar Entrada, Salvar Apontamento), tabs ativas e sinalizadores de foco.
- **Ardósia Operacional (Secundária - `#0f172a` a `#1e293b`):** Base da barra lateral de navegação e cabeçalhos de ferramentas. Garante ancoragem visual contra o restante da interface de trabalho.
- **Neutro de Superfície (`#f8fafc` workspace, `#ffffff` cartões, bordas `#cbd5e1` / `#e2e8f0`):** Garante separação nítida de lotes e tabelas sem dependência excessiva de sombras.

### Semântica Industrial (Chão de Fábrica)
- **Sucesso / Operação Normal / Em Estoque (OK):** Base `#16a34a`, container `#dcfce7`, texto `#14532d`.
- **Atenção / Validade Próxima / Lote Parcial:** Base `#d97706`, container `#fef3c7`, texto `#78350f`.
- **Crítico / Ruptura de Estoque / Máquina Parada:** Base `#dc2626`, container `#fee2e2`, texto `#7f1d1d`.
- **Informativo / Rastreabilidade / Telemetria:** Base `#0284c7`, container `#e0f2fe`, texto `#0c4a6e`.

## Typography

A tipografia prioriza legibilidade instantânea de dados alfa-numéricos técnicos (códigos de peças automotivas, números de série OEM, códigos de barra GS1 e datas de lote).

- **Fonte Principal (Display & Texto):** IBM Plex Sans garante caracteres abertos e distinção máxima entre caracteres críticos (ex.: `0` e `O`, `1` e `l`), com compatibilidade direta para renderização nativa rápida.
- **Tipografia Técnica Numérica (Monospaçada):** JetBrains Mono é empregada para números de série, identificadores de OP, colunas de quantidades e leituras de telemetria em tabelas para evitar desvios verticais de dígitos durante atualizações em tempo real.
- **Escala e Rótulos:** Todo cabeçalho de coluna em tabelas e etiquetas de campo usam estilo com alta legibilidade (caixa alta condensada ou semi-bold estruturado) com espaçamento de letras moderado.

## Layout & Spacing

O layout emprega uma grade fluida estruturada com âncora fixa lateral, projetada prioritariamente para monitores de bancada (1920×1080), terminais em quiosques de chão de fábrica (1366×768) e tablets industriais (1024×768 e superiores).

### Estrutura Base
- **Barra Lateral de Navegação (Sidebar):** Largura fixa de 260px em desktops/monitores fixos. Em resoluções móveis ou tablets industriais verticais, contrai para 72px (modo apenas ícones estruturados) ou drawer retrátil com acionamento manual.
- **Área de Trabalho Principal (Canvas):** Utiliza grid fluido de 12 colunas com `gutter: 1.25rem` (20px) e margem externa de `1.5rem` (24px).
- **Zonas de Interação Crítica:** Gaps entre botões de ação e seletores manuais mantêm distância mínima de `0.75rem` para evitar toques falsos quando operados com tela sensível ao toque.

## Elevation & Depth

Para garantir máxima performance e fidelidade em monitores de chão de fábrica de baixo custo ou alto brilho, este sistema elimina sombras decorativas suaves, adotando uma abordagem baseada em contornos de alta precisão (Ghost Borders) e camadas tonais.

### Níveis de Profundidade
1. **Nível 0 (Plano de Fundo da Aplicação):** `#f8fafc` com borda divisória sutil `#e2e8f0` para isolamento de cabeçalho global.
2. **Nível 1 (Cartões de Módulos e Superfícies de Tabela):** Fundo `#ffffff`, contorno sólido de 1px em `#cbd5e1`. Sem projeção de sombra difusa.
3. **Nível 2 (Painéis Filtrantes e Menus Contextuais Flutuantes):** Fundo `#ffffff`, contorno de 1px em `#94a3b8`, com sombra de contato ultra-curta (`0 4px 6px -1px rgba(15, 23, 42, 0.12)`).
4. **Nível 3 (Diálogos Modais e Alertas de Interrupção Crítica):** Overlay escurecido (`#0f172a` a 65% de opacidade) com container centralizado de contorno proeminente em 2px.

## Shapes

O sistema utiliza geometria estrita e moderada (`roundedness: 1` — 4px / `0.25rem`), evocando a rigidez e a precisão do maquinário mecânico.

- **Cartões e Módulos Estruturais:** Cantos levemente atenuados com raio de 4px a 6px, mantendo o aproveitamento volumétrico máximo das telas de dados densos.
- **Badges de Status:** Cantos vivos e retos (2px a 4px), evitando formatos totalmente circulares (pill) que diminuem a área de impressão de texto técnico.
- **Botões e Campos de Entrada:** Raio consistente de 4px, conferindo aspecto industrial compacto e firmeza visual de clique.

## Components

### 1. Barra Lateral de Navegação (Sidebar Operacional)
- **Cabeçalho:** Logotipo "AUTONOMOZ" em peso pesado, seguido do seletor visual de perfil do usuário.
- **Indicador de Papel (Role Badge):**
  - `GERENTE`: Tag destacada com fundo `#334155` e texto em caixa alta `#f8fafc`.
  - `FUNCIONÁRIO`: Tag utilitária com borda `#475569` e texto `#cbd5e1`.
- **Regras de Visibilidade de Menu:**
  - *Visão Completa (Gerente):* Dashboard, Estoque, Ordens de Produção, Rastreabilidade, Movimentações, Alertas, Relatórios, Configurações.
  - *Visão Operacional (Funcionário):* Dashboard, Estoque, Movimentações, Alertas.
- **Itens de Menu:** Altura de 44px, ícone monolinear alinhado à esquerda, estado ativo demarcado por barra lateral sólida de 4px em Laranja Industrial (`#ea580c`) e fundo `#1e293b`.

### 2. Botões Operacionais
- **Hit Area:** Altura padrão mínima de 44px (48px para ações mestras como "Apontar Peça" ou "Finalizar Lote").
- **Primário:** Fundo `#ea580c`, texto `#ffffff`, sem serifa, semi-bold. Foco com anel de 3px em `#ea580c` a 40% de opacidade.
- **Secundário:** Fundo `#ffffff`, borda sólida de 1px em `#0f172a`, texto `#0f172a`.
- **Perigo / Parada Emergencial:** Fundo `#dc2626`, texto `#ffffff`, com confirmação em etapa dupla.

### 3. Tabelas de Dados e Rastreabilidade
- **Linhas:** Altura confortável de 48px para leitura em bancada, com alternância de linhas (zebradas em `#f8fafc`) e highlight de linha em `#f1f5f9`.
- **Colunas:** Cabeçalhos com texto `#475569`, peso 600, ícones integrados de ordenação ascendente/descendente.
- **Células Técnicas:** Códigos SKU, Lote e Código de Barras renderizados na fonte técnica monospaçada (`label-code`).
- **Ações Rápidas de Linha:** Botões de leitura rápida por leitor óptico / QR Code e histórico de rastreabilidade direta.

### 4. Badges de Status Industrial
Componentes de alta visibilidade com ícone semântico obrigatório e texto em caixa alta ou semi-bold:
- **Operação Normal / OK:** Fundo `#dcfce7`, texto `#15803d`, ícone de verificação.
- **Estoque Baixo / Validade Próxima:** Fundo `#fef3c7`, texto `#b45309`, ícone de alerta triangular.
- **Crítico / Parada de Linha:** Fundo `#fee2e2`, texto `#b91c1c`, ícone de bloqueio/octógono.
- **Em Produção:** Fundo `#e0f2fe`, texto `#0369a1`, ícone de engrenagem/pulso.

### 5. Cartões de Indicadores (KPIs)
- **Estrutura:** Container branco, borda `#cbd5e1`, padding de 16px.
- **Valor Principal:** Tipografia monospaçada ampliada (`label-metric`), contrastando com o rótulo descritivo em cinza ardósia.
- **Indicador de Tendência:** Flecha direcional acompanhada de percentual e base temporal (`vs. turno anterior`).
- **Filtro Rápido:** Possibilidade de clicar no card de KPI para filtrar automaticamente a tabela inferior correspondente.

### 6. Campos de Entrada (Formulários de Entrada de Peças)
- **Altura de Campo:** 44px com contorno de 1.5px em `#94a3b8`, transicionando para `#ea580c` quando ativo.
- **Entrada Numérica e Código de Barras:** Suporte para leitor via USB/Bluetooth em foco contínuo automático sem necessidade de seleção por mouse.