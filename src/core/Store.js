/**
 * Store - Reactive application state management (Observer Pattern).
 */
export class Store {
  constructor(eventBus) {
    this.eventBus = eventBus;
    const initialTheme = this.getInitialTheme();
    this.applyThemeToDOM(initialTheme);

    this.state = {
      theme: initialTheme,
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
    this.initSystemThemeListener();
  }

  getInitialTheme() {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (e) {
      // localStorage pode falhar em modos estritos/privados
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  applyThemeToDOM(theme) {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  initSystemThemeListener() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        try {
          if (!localStorage.getItem('theme')) {
            this.setTheme(e.matches ? 'dark' : 'light', false);
          }
        } catch (err) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  setTheme(theme, persist = true) {
    if (theme !== 'light' && theme !== 'dark') return;
    this.state.theme = theme;
    
    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {}
    }

    this.applyThemeToDOM(theme);
    this.notify('theme');
    this.eventBus.emit('theme:change', { theme });
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme, true);
    return nextTheme;
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

