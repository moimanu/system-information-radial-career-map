# Mapa de Carreira Radial - BSI IFMG OB

<!-- Status & Deploy -->
[![Status](https://img.shields.io/website?url=https%3A%2F%2Fradial-career-map.vercel.app%2F&label=status&success_message=online&color=brightgreen)](https://radial-career-map.vercel.app/)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://radial-career-map.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<!-- Tecnologias & Bibliotecas -->
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![D3.js](https://img.shields.io/badge/D3.js-v7-F9A03C?logo=d3dotjs&logoColor=white)](https://d3js.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)

## Conceituação e Descrição do Projeto

O Mapa de Carreira Radial é uma aplicação web interativa e reativa desenvolvida para estudantes, professores e coordenadores do curso de Bacharelado em Sistemas de Informação (BSI) do IFMG - Campus Ouro Branco.

A ferramenta mapeia e visualiza o ecossistema curricular do curso através de duas óticas complementares de navegação:
* **Afinidade Profissional (Modo Radial):** Posicionamento concêntrico das disciplinas do PPC em camadas/anéis de relevância em relação a 14 perfis e trajetórias de carreira no mercado de TI.
* **Dependência Curricular (Modo Árvore/Subgrafo):** Navegação focada no encadeamento lógico e no fluxo recomendado de conhecimento entre as disciplinas.

### Objetivos Principais
* **Simplificar a Orientação Acadêmica e Profissional:** Permitir que o estudante visualize facilmente quais disciplinas são essenciais para a sua carreira de interesse.
* **Garantir Navegação Flexível e Filtragem:** Disponibilizar filtros por eixos de formação e natureza da disciplina, além de consulta detalhada de ementas, cargas horárias e bibliografias.

---

## Tecnologias Utilizadas
* **Front-End:** JavaScript (ES6+), D3.js (v7), HTML5, CSS3.
* **Engenharia de Dados:** Python 3.x, `pdfplumber`.
* **Hospedagem e Deploy:** Vercel (https://radial-career-map.vercel.app/).

---

## Documentação do Projeto

A documentação detalhada da aplicação está organizada na pasta `docs/`:

* [Arquitetura do Sistema](docs/architecture.md): Estrutura de software baseada no padrão MVC, fluxogramas e divisão de módulos.
* [Estrutura de Dados](docs/data-schema.md): Especificação detalhada e esquemas JSON dos datasets do projeto.
* [Interface e Funcionalidades](docs/interface.md): Descrição das telas, fluxos de uso e componentes de UI.
* [Guia de Execução](docs/execution.md): Instruções passo a passo para execução da aplicação e reprocessamento dos dados.

---

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.