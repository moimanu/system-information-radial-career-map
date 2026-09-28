import { EventBus } from './core/EventBus.js';
import { Store } from './core/Store.js';
import { GraphView } from './ui/GraphView.js';
import { ControlsView } from './ui/ControlsView.js';
import { DetailPanel } from './ui/DetailPanel.js';
import { ModalView } from './ui/ModalView.js';

/**
 * Main Application Bootstrap
 */
async function initApp() {
  const eventBus = new EventBus();
  const store = new Store(eventBus);

  try {
    const [profRes, eixosRes, discRes, arestasRes] = await Promise.all([
      fetch('data/processed/profissoes.json').then(r => r.json()),
      fetch('data/processed/eixos-formacao.json').then(r => r.json()),
      fetch('data/processed/disciplinas.json').then(r => r.json()),
      fetch('data/processed/arestas.json').then(r => r.json())
    ]);

    const profissoes = profRes;
    const eixosFormacao = Array.isArray(eixosRes) ? eixosRes[0] : eixosRes;
    const disciplinas = discRes;
    const arestas = arestasRes;

    const activeEixosFilters = new Set(Object.keys(eixosFormacao));
    activeEixosFilters.add("");

    const activeNaturezaFilters = new Set(["Obrigatória", "Optativa", ""]);
    const selectedProfessionId = null;

    store.setState({
      profissoes,
      eixosFormacao,
      disciplinas,
      arestas,
      activeEixosFilters,
      activeNaturezaFilters,
      selectedProfessionId
    });

    const controlsView = new ControlsView(store, eventBus);
    const detailPanel = new DetailPanel(store, eventBus);
    const modalView = new ModalView(store, eventBus);
    const graphView = new GraphView(store, eventBus);

    controlsView.init();
    detailPanel.init();
    modalView.init();
    graphView.init();

    eventBus.on('modal:show', () => modalView.show());

  } catch (err) {
    console.error("Erro ao carregar os dados:", err);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
