[← Voltar](../README.md)

# Esquema de Dados

Especificação técnica dos arquivos JSON gerados pelo pipeline de dados e consumidos pela aplicação web.

---

## 1. `profissoes.json`
Array com a coleção de perfis profissionais mapeados.

* `id` (`string`): ID único da carreira em `snake_case`.
* `nome` (`string`): Nome de exibição.
* `descricao` (`string`): Perfil de mercado, responsabilidades e escopo.

```json
[
  {
    "id": "engenheiro_de_software",
    "nome": "Engenheiro de Software",
    "descricao": "Atua na concepção, projeto, desenvolvimento, teste e manutenção de sistemas de software..."
  }
]
```

---

## 2. `eixos-formacao.json`

Array de objetos do tipo chave-valor para mapeamento dos eixos de formação do curso.

* Chave (`string`): Sigla do eixo (`mat`, `comp`, `ti`, `adm`, `cpl`, `pso`).
* Valor (`string`): Nome completo do eixo.

```json
[
  {
    "mat": "Formação Matemática",
    "comp": "Formação Computacional",
    "ti": "Formação em Tecnologia da Informação",
    "adm": "Formação Administrativa",
    "cpl": "Formação Complementar",
    "pso": "Formação Profissional e Social"
  }
]
```

---

## 3. `disciplinas.json`

Array de nós do currículo contendo informações pedagógicas, carga horária e mapeamento de profissões.

* `id` (`string`): ID único da disciplina em letras minúsculas.
* `codigo` (`string`): Código oficial da disciplina.
* `nome` (`string`): Título oficial da disciplina.
* `periodo` (`number`): Período recomendado (1–8).
* `eixoFormacao` (`string`): Referência à chave do eixo em `eixos-formacao.json`.
* `natureza` (`string`): Tipo de disciplina (ex.: `"Obrigatória"`, `"Optativa"`).
* `abordagemMetodologica` (`string`): Método de ensino.
* `cargaHoraria` (`object`): Detalhamento das horas (`teorica`, `pratica`, `total`).
* `dependencias` (`array` de `string`): Array com IDs dos pré-requisitos diretos.
* `ementa` (`string`): Resumo da ementa.
* `objetivos` (`string`): Objetivos pedagógicos.
* `bibliografiaBasica` (`string`): Bibliografia básica.
* `bibliografiaComplementar` (`string`): Bibliografia complementar.
* `camadasPorProfissao` (`object`): Mapeamento do ID da carreira para a string da camada de importância radial (ex.: `"1"`, `"5"`).

```json
[
  {
    "id": "obbgsin085",
    "codigo": "OBBGSIN.085",
    "nome": "Introdução à Programação",
    "periodo": 1,
    "eixoFormacao": "comp",
    "natureza": "Obrigatória",
    "abordagemMetodologica": "Teórico-prática",
    "cargaHoraria": {
      "teorica": 32,
      "pratica": 32,
      "total": 64
    },
    "dependencias": [],
    "ementa": "Conceitos relacionados a algoritmos...",
    "objetivos": "Compreender o conceito de algoritmo...",
    "bibliografiaBasica": "VILARIM, Gilvan de Oliveira...",
    "bibliografiaComplementar": "MEDINA, Marco...",
    "camadasPorProfissao": {
      "engenheiro_de_software": "1",
      "programador": "1",
      "web_designer": "5"
    }
  }
]
```

---

## 4. `arestas.json`

Array de dependências e conexões do grafo de disciplinas.

* `origem` (`string`): ID da disciplina pré-requisito/origem.
* `destino` (`string`): ID da disciplina dependente/destino.
* `tipo` (`string`): Tipo de relação (`dependencia`, `co_requisito`, `equivalente`).

```json
[
  {
    "origem": "obbgsin085",
    "destino": "obbgsin009",
    "tipo": "dependencia"
  }
]
```