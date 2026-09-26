# Estrutura de Dados Modulada do Sistema

Para organizar melhor o ecossistema de dados do sistema, aumentar a reusabilidade e facilitar a manutenção, a estrutura de dados original do `data.json` pode ser dividida em **arquivos JSON independentes para cada chave**, mantendo **EXATAMENTE** a mesma estrutura interna dos objetos e coleções.

---

## 1. Arquitetura da Estrutura de Arquivos

A separação é organizada da seguinte forma na pasta de dados:

```text
src/data/
├── profissoes.json
├── eixos-formacao.json
├── disciplinas.json
├── arestas.json
└── index.json (ou data.json agregador)
```

---

## 2. Modelos de Dados dos Arquivos Individuais

### A. `profissoes.json`
Armazena a coleção de perfis de carreira selecionáveis na interface.

```json
[
  {
    "id": "<id_da_profissao>",
    "nome": "<Nome Completo da Profissão>",
    "descricao": "<Descrição detalhada das atribuições e foco da profissão.>"
  }
]
```

---

### B. `eixos-formacao.json`
Dicionário contendo o mapeamento chave-valor das categorias de eixos de formação do curso.

```json
{
  "<chave_do_eixo_1>": "<Nome 1 do Eixo de Formação>",
  "<chave_do_eixo_2>": "<Nome 2 do Eixo de Formação>"
}
```

---

### C. `disciplinas.json`
Array completo dos nós do grafo contendo todas as informações acadêmicas, pedagógicas e posicionamento por perfil.

```json
[
  {
    "id": "<id_da_disciplina>",
    "codigo": "<CODIGO_DA_DISCIPLINA>",
    "nome": "<Nome Completo da Disciplina>",
    "periodo": 1,
    "eixoFormacao": "<chave_do_eixo>",
    "natureza": "<Obrigatória | Eletiva | Optativa>",
    "abordagemMetodologica": "<Presencial / EAD | Presencial | Prática | Teórica>",
    "cargaHoraria": {
      "teorica": 0,
      "pratica": 0,
      "total": 0
    },
    "dependencias": [
      "<id_da_disciplina_dependencia_1>",
      "<id_da_disciplina_dependencia_2>"
    ],
    "ementa": "<Texto completo contendo a ementa da disciplina.>",
    "objetivos": "<Texto completo descrevendo os objetivos gerais e específicos.>",
    "bibliografiaBasica": "<Lista da bibliografia básica formatada ou numerada.>",
    "bibliografiaComplementar": "<Lista da bibliografia complementar formatada ou numerada.>",
    "camadasPorProfissao": {
      "<id_da_profissao_1>": 1,
      "<id_da_profissao_2>": 2
    }
  }
]
```

---

### D. `arestas.json`
Coleção de conexões e dependências entre disciplinas utilizadas para a renderização do grafo de recomendações e encadeamento pedagógico.

```json
[
  {
    "origem": "<id_da_disciplina_origem>",
    "destino": "<id_da_disciplina_destino>",
    "tipo": "<dependencia | co_requisito | equivalente>"
  }
]
```

---

## 3. Visão Agregada do Sistema (`data.json` / Ponto de Unificação)

Caso a aplicação utilize um bundler (como Vite, Webpack ou Node.js) ou precise consolidar todos os arquivos para consumo de uma única API/contexto, a estrutura mantida no final permanece exatamente igual ao modelo original:

```json
{
  "profissoes": [
    {
      "id": "<id_da_profissao>",
      "nome": "<Nome Completo da Profissão>",
      "descricao": "<Descrição detalhada das atribuições e foco da profissão.>"
    }
  ],
  "eixosFormacao": {
    "<chave_do_eixo_1>": "<Nome 1 do Eixo de Formação>",
    "<chave_do_eixo_2>": "<Nome 2 do Eixo de Formação>"
  },
  "disciplinas": [
    {
      "id": "<id_da_disciplina>",
      "codigo": "<CODIGO_DA_DISCIPLINA>",
      "nome": "<Nome Completo da Disciplina>",
      "periodo": 1,
      "eixoFormacao": "<chave_do_eixo>",
      "natureza": "<Obrigatória | Eletiva | Optativa>",
      "abordagemMetodologica": "<Presencial / EAD | Presencial | Prática | Teórica>",
      "cargaHoraria": {
        "teorica": 0,
        "pratica": 0,
        "total": 0
      },
      "dependencias": [
        "<id_da_disciplina_dependencia_1>",
        "<id_da_disciplina_dependencia_2>"
      ],
      "ementa": "<Texto completo contendo a ementa da disciplina.>",
      "objetivos": "<Texto completo descrevendo os objetivos gerais e específicos.>",
      "bibliografiaBasica": "<Lista da bibliografia básica formatada ou numerada.>",
      "bibliografiaComplementar": "<Lista da bibliografia complementar formatada ou numerada.>",
      "camadasPorProfissao": {
        "<id_da_profissao_1>": 1,
        "<id_da_profissao_2>": 2
      }
    }
  ],
  "arestas": [
    {
      "origem": "<id_da_disciplina_origem>",
      "destino": "<id_da_disciplina_destino>",
      "tipo": "<dependencia | co_requisito | equivalente>"
    }
  ]
}
```

---

## 4. Detalhamento dos Campos

### A. `profissoes.json` (Perfis de Carreira)
Coleção contendo a lista de profissões selecionáveis na interface.
* **`id`** (`string`): Identificador único do perfil (usado como chave de referência em `camadasPorProfissao`).
* **`nome`** (`string`): Título amigável da profissão exibido nos componentes visuais/dropdowns.
* **`descricao`** (`string`): Resumo detalhado do perfil de atuação no mercado.

### B. `eixos-formacao.json` (Dicionário de Categorias)
Mapeamento de chave-valor que categoriza as disciplinas do curso.
* **Chave**: Código/slug do eixo (ex: `"computacional"`, `"matematica"`).
* **Valor**: Nome por extenso exibido na legenda ou nos filtros da interface.

### C. `disciplinas.json` (Nós do Grafo / Mapeamento Curricular)
Array com todos os dados pedagógicos e acadêmicos das matérias.
* **`id`** (`string`): Identificador único do nó no grafo (ex: `"BSI101"`).
* **`codigo`** (`string`): Código oficial da disciplina na instituição.
* **`nome`** (`string`): Nome oficial completo da disciplina.
* **`periodo`** (`number`): Período ideal em que a disciplina é ofertada na grade (1º ao 8º período).
* **`eixoFormacao`** (`string`): Chave que aponta para um dos eixos definidos em `eixos-formacao.json`.
* **`natureza`** (`string`): Classificação da disciplina (ex: `"Obrigatória"`, `"Optativa"`).
* **`abordagemMetodologica`** (`string`): Modalidade ou metodologia de ensino (ex: `"Presencial / Prática"`).
* **`cargaHoraria`** (`object`): Divisão da carga horária em horas-aula:
  * **`teorica`** (`number`): Carga horária teórica.
  * **`pratica`** (`number`): Carga horária prática.
  * **`total`** (`number`): Carga horária total da disciplina.
* **`dependencias`** (`array` de `string`): Lista com os IDs das disciplinas recomendadas como base de conhecimento direta.
* **`ementa`** (`string`): Texto com o conteúdo programático sintético.
* **`objetivos`** (`string`): Objetivos pedagógicos gerais e específicos.
* **`bibliografiaBasica`** (`string`): Obras e materiais recomendados como bibliografia básica.
* **`bibliografiaComplementar`** (`string`): Obras e materiais recomendados como bibliografia complementar.
* **`camadasPorProfissao`** (`object`): Dicionário contendo a relação `{ "id_profissao": nivel_de_camada }`. Define em qual camada ou anel do mapa radial a disciplina deve se posicionar conforme o perfil profissional ativo (valores numéricos inteiros, ex: `1`, `2`, `3`).

### D. `arestas.json` (Conexões do Grafo)
Lista de direcionamento entre nós utilizada para renderizar as linhas de dependências recomendadas e fluxos de conhecimento.
* **`origem`** (`string`): `id` da disciplina de onde parte a conexão (base de conhecimento/dependência).
* **`destino`** (`string`): `id` da disciplina para onde vai a conexão (dependente).
* **`tipo`** (`string`): Classificação do relacionamento (ex: `"dependencia"`, `"co_requisito"`).