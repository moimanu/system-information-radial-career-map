/**
 * Store - Reactive application state management (Observer Pattern).
 */
export class Store {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = {
      profissoes: [],
      eixosFormacao: {},
      disciplinas: [],
      arestas: [],

      selectedProfessionId: null,
      activeEixosFilters: new Set(),
      activeNaturezaFilters: new Set(),
      hoveredRingIndex: null,
      selectedRingIndex: null,
      hoveredNodeId: null,
      treeFocusNodeId: null,

      width: 0,
      height: 0
    };
    this.subscribers = new Map();
  }

  setState(partialState, notifyKey = null) {
    Object.assign(this.state, partialState);
    if (notifyKey) {
      this.notify(notifyKey);
    } else {
      this.notifyAll();
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => {
      if (this.subscribers.has(key)) {
        this.subscribers.get(key).delete(callback);
      }
    };
  }

  notify(key) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(cb => cb(this.state[key], this.state));
    }
    this.eventBus.emit('state:change', { key, state: this.state });
  }

  notifyAll() {
    this.subscribers.forEach((callbacks, key) => {
      callbacks.forEach(cb => cb(this.state[key], this.state));
    });
    this.eventBus.emit('state:change', { state: this.state });
  }
}
