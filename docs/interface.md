[← Voltar](../README.md)

# Interface e Funcionalidades

Detalhamento das telas, componentes de interface e recursos de interação da aplicação web.

---

## 1. Tela de Onboarding (`index.html`)
Ponto de entrada inicial do usuário para contextualização da ferramenta.
* Tutorial guiado em 6 passos com barra de progresso, demonstrações visuais e dicas de navegação.
* Explicação de conceitos do grafo: nós, vértices, eixos de formação, dependências curriculares e anéis concêntricos.

---

## 2. Tela de Visualização (`grafo.html`)
Ambiente principal de interatividade com o grafo curricular.

* **Grafo Interativo (D3.js):** Suporte a zoom (+/-), pan (arraste de tela), manipulação de nós, reset de visualização e modo tela cheia.
* **Seleção de Perfil Profissional (`ModalView`):** Janela modal para alternância rápida entre os 14 perfis profissionais configurados.
* **Filtros Flutuantes (`ControlsView`):** Painéis para alternar a visibilidade das disciplinas por eixos temáticos (Matemática, Computação, TI, etc.) ou por natureza (Obrigatória/Optativa).
* **Painel Lateral de Detalhes (`DetailPanel`):** Exibição da ementa completa, carga horária detalhada (teórica/prática), objetivos pedagógicos e referências bibliográficas (básica e complementar) ao selecionar qualquer disciplina.