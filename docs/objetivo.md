## Estrutura do Planejamento do Projeto: Mapa Interativo BSI - IFMG OB (Modelo de 5 Camadas)

### 1. Visão Geral e Objetivos

* **Público-Alvo:** Estudantes do Ensino Médio em fase de orientação vocacional.
* **Objetivo Geral:** Proporcionar uma navegação visual e intuitiva pelas disciplinas do BSI - IFMG Ouro Branco, demonstrando como elas se conectam entre si e como convergem para formar diferentes perfis de carreira.
* **Modelo Visual:** Grafo interativo Radial Concêntrico em **5 Níveis/Camadas**, onde a carreira escolhida ocupa o centro fixo $(X_0, Y_0)$ e as disciplinas gravitam ao redor em anéis tracejados correspondentes ao seu grau de proximidade com a profissão.

---

### 2. Definição Detalhada das 5 Camadas (Anéis Concentricos)

As 5 camadas definem a distância radial $R_1, R_2, R_3, R_4, R_5$ em relação ao centro (Profissão):

| Camada | Nome da Camada | Raio ($R$) | Critério de Classificação (Proximidade & Prioridade) | Exemplos (para Desenvolvedor Full-Stack) |
| --- | --- | --- | --- | --- |
| **Vértice Central** | **Profissão** | $R_0 = 0$ | Ponto focal do grafo (a profissão/objetivo central). | Desenvolvedor Full-Stack |
| **Camada 1** | **Core Hands-On** | $R_1$ | **Prioridade Crítica / Uso Diário:** Conhecimentos sem os quais a pessoa não consegue desempenhar a função básica no primeiro dia de trabalho. Aderência imediata de mercado. | Programação Web (Front/Back), Programação Orientada a Objetos, Banco de Dados, Algoritmos & Estrutura de Dados |
| **Camada 2** | **Sustentação & Infraestrutura** | $R_2$ | **Prioridade Alta / Frequente:** Disciplinas necessárias para criar software robusto, seguro e performático no dia a dia. Garante a qualidade da entrega. | Engenharia de Software, Redes de Computadores, Teste de Software, Sistemas Operacionais |
| **Camada 3** | **Aprimoramento & Especialização** | $R_3$ | **Prioridade Média / Periódica:** Conhecimentos que elevam a qualidade da entrega, otimizam processos de equipe ou abrem portas para diferenciação sênior. | Interface Humano-Computador (IHC), Análise e Modelagem de Sistemas, Inteligência Artificial / ML, Segurança da Informação |
| **Camada 4** | **Fundamentação Analítica** | $R_4$ | **Prioridade Indireta / Suporte Racional:** Disciplinas de base conceitual que desenvolvem capacidade de resolução de problemas complexos, mas cujas ferramentas diretas não são usadas no código diário. | Estatística e Probabilidade, Teoria da Computação, Matemática Discreta, Álgebra Linear / Cálculo |
| **Camada 5** | **Contexto & Habilidades Transversais** | $R_5$ | **Prioridade Periférica / Contextual:** Disciplinas que dão visão de negócio, gestão, ética e comunicação. Importantes para evolução de carreira corporativa, mas com menor proximidade com a escrita de código. | Empreendedorismo, Gestão de Projetos, Ética e Legislação, Comunicação e Expressão, Metodologia Científica |

---

### 3. Modelagem de Dados Modulada do Grafo

A base de dados é organizada de forma modular na pasta `src/data/`, facilitando a manutenção e a reutilização dos modelos, podendo ser consumida de forma unificada pelo `data.json` agregador.

#### 3.1. Arquitetura de Coleções

1. **`profissoes.json` (Vértices Centrais):**
   * Coleção contendo os perfis de carreira selecionáveis na interface (ex: `id`, `nome`, `descricao`).
2. **`eixos-formacao.json` (Categorias e Dicionário de Cores):**
   * Mapeamento chave-valor dos eixos de formação do curso (ex: `"computacional"`, `"matematica"`, `"gestao"`), utilizado para a legenda e codificação de cores na interface.
3. **`disciplinas.json` (Nós do Grafo / Mapeamento Curricular):**
   * Contém os dados acadêmicos, ementas, objetivos, bibliografias, carga horária e a propriedade **`camadasPorProfissao`**.
4. **`arestas.json` (Arestas de Interdependência):**
   * Define o direcionamento entre disciplinas para renderizar conexões de dependências recomendadas, co-requisitos ou equivalências (`origem`, `destino`, `tipo`).

#### 3.2. Mapeamento de Pesos e Ponderação Dinâmica

* **Dicionário `camadasPorProfissao` $\rightarrow \{ "id_profissao": nivel_de_camada \}$:**
  * Cada disciplina possui um mapeamento que atribui a qual camada $\{1, 2, 3, 4, 5\}$ ela pertence em relação a cada perfil profissional.
  * *Exemplo de Dinâmica:* Para a profissão **Cientista de Dados** (`id: "cientista-dados"`), a disciplina *Estatística* possui valor `1` (Camada 1), enquanto *Programação Web* possui valor `3` ou `4`. Ao alterar a profissão ativa, o sistema lê essa propriedade para reposicionar o nó no raio correspondente.

---

### 4. Especificação da Interface do Usuário (UI/UX)

#### 4.1. Elementos Visuais e Anéis

* **5 Anéis Tracejados Concêntricos:** Representando os limites visuais dos raios $R_1$ a $R_5$.
* **Rótulos das Camadas:** Rótulos discretos indicando o nome da camada ao longo do eixo radial (ex: topo do anel).
* **Codificação de Cores por Eixo de Formação (`eixos-formacao.json`):**
  * As disciplinas são coloridas dinamicamente conforme o seu `eixoFormacao`.
* **Filtros e Destaques no Hover:**
  * Ao passar o mouse sobre uma disciplina, destacam-se as disciplinas de dependência direta e subsequentes (mapeadas em `arestas.json`) e a conexão com a profissão central.

#### 4.2. Regras de Transição e Reorganização

1. Ao alterar a profissão no *dropdown*, o algoritmo consulta o objeto `camadasPorProfissao` de cada disciplina para determinar a sua nova camada $\{1..5\}$.
2. É acionada uma animação de transição onde os vértices deslizam suavemente (*interpolation/easing*) para o seu novo anel correspondente.
3. Dentro do mesmo anel $R_k$, os vértices são distribuídos equitativamente em arcos para evitar sobreposição (*collision detection* ou espaçamento angular regular).

---

### 5. Algoritmo de Posicionamento Radial (5 Anéis)

Para cada disciplina $j$ pertencente ao grupo da camada $k \in \{1, 2, 3, 4, 5\}$, contendo $N_k$ disciplinas no total dentro do anel $k$:

$$\theta_j = \frac{2 \pi \cdot j}{N_k} + \phi_k \quad \text{(onde } \phi_k \text{ é um offset angular para intercalar nós entre anéis)}$$

$$X_j = X_0 + R_k \cdot \cos(\theta_j)$$

$$Y_j = Y_0 + R_k \cdot \sin(\theta_j)$$

*Onde $R_1 < R_2 < R_3 < R_4 < R_5$ são os raios calculados proporcionalmente ao tamanho do Canvas.*

---

### 6. Etapas Atualizadas de Desenvolvimento

1. **Etapa 1: Estruturação dos Datasets Modulados (`src/data/`)**
   * Catalogar a grade curricular e preencher `profissoes.json`, `eixos-formacao.json`, `disciplinas.json` e `arestas.json`.
   * Mapear o dicionário `camadasPorProfissao` em todas as disciplinas para os perfis cadastrados.

2. **Etapa 2: Engine Canvas com 5 Anéis**
   * Renderização dos 5 círculos tracejados com marcação visual elegante.
   * Função de cálculo de coordenadas radiais com distribuição por anel com base no perfil ativo.

3. **Etapa 3: Sistema de Animação e Interatividade**
   * Animação da transição dos nós ao mudar a profissão selecionada.
   * Renderização das linhas de conexão entre disciplinas utilizando `arestas.json` (dependências) e conexões com o centro.

4. **Etapa 4: Detalhamento de Conteúdo e UX**
   * Painel lateral de informações ao clicar no nó (exibindo ementa, objetivos, carga horária e bibliografias presentes em `disciplinas.json`).
   * Validação para garantir que nenhuma disciplina fique oculta ou sobreposta.