Reestruturar projeto para a seguinte estrutura de pastas:

.
├── data/
│   ├── raw/                      # PDFs e documentos originais (sua base bruta)
│   │   ├── EMENTARIO-BSI-2020.pdf
│   │   └── PPC-BSI-2022.pdf
│   └── processed/                # JSONs ou arquivos gerados pelos scripts Python
│       └── disciplinas.json
├── docs/                         # Documentação técnica e planejamento
│   └── planning/
│       ├── 000-objective.md
│       ├── 001-data-structure.md
│       ├── 002-initial-plan.md
│       └── 003-refactor-plan.md
├── scripts/                      # Pipelines de extração e transformação (Python)
│   ├── 1-extrair-disciplinas.py
│   ├── 2-inserir-camadas-por-profissao.py
│   ├── 3-inserir-eixos.py
│   ├── 4-inserir-dependencias.py
│   └── 5-criar-arestas.py
├── src/                          # Código da aplicação web/front-end
│   ├── core/
│   ├── domain/
│   ├── strategies/
│   ├── ui/
│   ├── main.js
│   └── style.css
├── index.html                    # Ponto de entrada do app
├── requirements.txt              # Dependências dos scripts Python
└── README.md