## Arquitetura e Gerenciamento de Estado (MVC e Observer)

* Isolar o objeto `state` global mutável em um Model reativo utilizando o padrão de arquitetura Model-View-Controller (MVC).


* Implementar o padrão Observer ou Publish-Subscribe para o gerenciamento de eventos, eliminando as chamadas procedurais diretas como `updateNodePositions(true)` acopladas aos seletores HTML.


* Dividir estruturalmente as responsabilidades lógicas criando Controladores específicos para a interface do usuário (filtros, painéis e modais) e uma View exclusiva para a renderização do SVG.

## Otimização de Código D3.js (Redução de Linhas)

* Substituir as construções obsoletas e verbosas de `.enter().append().merge()` pelo método moderno `.join()` do D3.js, o que condensa a lógica de montagem e atualização de nós e arestas em uma única diretiva fluida.


* Consolidar os loops e verificações de visibilidade de DOM. As funções `updateGraphVisibility` e `updateLabelsVisibility` realizam iterações redundantes sobre seleções para verificar as mesmas propriedades de "eixo" e "natureza", o que deve ser unificado na fonte de dados.


* Criar objetos de mapeamento utilitários para remover blocos condicionais longos, substituindo o bloco `switch` da função `normalizeLayer` por um retorno numérico validado O(1).



## Refatoração de Layout (Strategy Pattern)

* Extrair a lógica monolítica da função `computeLayout()`, que atualmente mistura o processamento hierárquico do modo árvore com o agrupamento do modo radial no mesmo escopo.


* Implementar o padrão Strategy para calcular as posições dos vértices. A aplicação instanciará uma `RadialLayoutStrategy` ou uma `TreeLayoutStrategy` dinamicamente com base no estado atual do `treeFocusNodeId`.


* Isolar os cálculos de agrupamento topológico e os escopos mutáveis como `ringRadii` e `nodePositions` dentro das respectivas estratégias de layout.



## Clean Code e Remoção de Redundâncias

* Centralizar as consultas ao DOM armazenando referências (`document.getElementById`) em propriedades do construtor da View no momento da inicialização, eliminando a busca repetida a cada interação.


* Empregar desestruturação de objetos ES6+ no início das funções D3 para extrair origens e destinos diretamente de `state.arestas`, reduzindo a extensão das declarações ao longo da construção geométrica.

Plano de refatoração para módulos ES6 puros, organizado por responsabilidades, aplicando **Clean Architecture**, **SOLID** (com foco em SRP e Open/Closed), **Design Patterns** (Observer, Strategy, Registry) e idiomatismos modernos do **D3.js (v7+)** para reduzir a extensão do código sem alterar comportamento ou contrato visual.

---

### 1. Arquitetura de Módulos (ES6 Modules)

O arquivo monolítico `app.js` (628 linhas) será decomposto em uma estrutura de diretórios coesa e desacoplada:

```text
src/
├── core/
│   ├── Store.js             # Gerenciamento de estado reativo (Observer/PubSub)
│   └── EventBus.js          # Canal global de eventos
├── domain/
│   ├── LayerNormalizer.js   # Validação O(1) e normalização de camadas
│   └── GraphQueries.js      # Subgráficos e níveis de árvore (Topologia)
├── strategies/
│   ├── RadialLayout.js      # Strategy: Cálculo de layout radial
│   └── TreeLayout.js        # Strategy: Cálculo de layout de árvore
├── ui/
│   ├── GraphView.js         # Manipulação D3.js (Nodes, Edges, Labels, Rings)
│   ├── ControlsView.js      # Filtros, dropdown e botões de zoom
│   ├── DetailPanel.js       # Painel lateral informativo
│   └── ModalView.js         # Modal de seleção de profissão
└── main.js                  # Ponto de entrada, bootstrap e encadeamento

```

---

### 2. Mudanças Estruturais e Aplicação de Standards

#### A. Gerenciamento de Estado Reativo (Core)

* **Store (Observer Pattern):** Em vez de re-renderizar o gráfico invocando funções globais proceduralmente após cada mutação, o estado será encapsulado num `Store` imutável para leitores externos.


* **Notificação Automática:** Qualquer alteração disparará observadores específicos (`store.subscribe(key, callback)`), re-executando atualizações apenas nos componentes dependentes.

#### B. Padrão Strategy para Layouts (`src/strategies/`)

* **Isolamento de Responsabilidade:** O cálculo extenso de `computeLayout()` será substituído por uma interface comum `LayoutStrategy` com o método `.calculate(store, width, height)`.


* **`RadialLayout`:** Contém o algoritmo de distribuição em 10 anéis concêntricos.
* **`TreeLayout`:** Delega a ordenação hierárquica e subgráficos para a camada de domínio (`GraphQueries`).

#### C. Normalização Numérica O(1)

* **Substituição do `switch`:** Redução de código ao trocar o bloco `switch` longo de `normalizeLayer` por operador de coerção e limite condicional direto:



```javascript
export const normalizeLayer = val => {
  const num = parseInt(val, 10);
  return Number.isInteger(num) && num >= 1 && num <= 10 ? num : 10;
};

```

#### D. Modernização D3.js com `.join()` (UI View)

* **Eliminação de Verbosidade (`.enter()`, `.append()`, `.merge()`):** A atualização de elementos SVG utilizará a API `.join()` do D3 v7+.


* **Concisão na Seleção:** O padrão reduz a sintaxe repetitiva e combina inserção, atualização e remoção automática de elementos:



```javascript
// Exemplo de redução de linhas com d3.join()
this.edgesGroup.selectAll('.edge-line')
  .data(edgeData, d => d.id)
  .join(
    enter => enter.append('line').attr('class', 'edge-line').attr('marker-end', 'url(#arrow)'),
    update => update,
    exit => exit.remove()
  )
  .classed('dimmed', d => isEdgeDimmed(d, layout, state))
  .transition().duration(duration)
  .attr('x1', d => layout.nodePositions[d.origem]?.x || 0)
  .attr('y1', d => layout.nodePositions[d.origem]?.y || 0)
  .attr('x2', d => layout.nodePositions[d.destino]?.x || 0)
  .attr('y2', d => layout.nodePositions[d.destino]?.y || 0);

```

#### E. Otimização de DOM e Cache de Referências

* **Cache de Seletores:** As referências do DOM (ex: `document.getElementById('detail-panel')`) serão capturadas uma única vez nos construtores dos módulos de UI (`ControlsView`, `DetailPanel`, `ModalView`), eliminando consultas redundantes na árvore do documento a cada renderização.


* **Consolidação de Passagens de Filtro:** As rotinas separadas `updateGraphVisibility()` e `updateLabelsVisibility()` serão unificadas no pipeline de estilo da `GraphView`, calculando a visibilidade no momento do data binding via D3.



---

### 3. Estimativa de Redução de Código

| Módulo / Camada | Responsabilidade | Linhas Aprox. |
| --- | --- | --- |
| `core/Store.js` & `EventBus.js` | Estado reativo e eventos de canal | ~35 |
| `domain/` | Normalização e algoritmos de grafo (BFS/Topologia) | ~50 |
| `strategies/` | Estratégias de Layout (Radial e Tree) | ~70 |
| `ui/GraphView.js` | D3.js SVG Rendering (com `.join()`) | ~140 |
| `ui/ControlsView.js`, `DetailPanel.js`, `ModalView.js` | Handlers de interface e painéis de dados | ~80 |
| `main.js` | Bootstrap e injeção de dependências | ~20 |
| **Total** | **Projeto Modulado Completo** | **~395 linhas** |

Redução total estimada em **~37% de linhas**, mantendo a totalidade dos recursos visuais, animações, estados de interação e layout idênticos ao código original.