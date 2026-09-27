import { EIXO_COLORS } from './EixoColors.js';

/**
 * ControlsView - DOM UI Controller for filters, zoom, and reset controls.
 */
export class ControlsView {
  constructor(store, eventBus) {
    this.store = store;
    this.eventBus = eventBus;
    this.eixosContainer = document.getElementById('eixos-filters');
    this.naturezaContainer = document.getElementById('natureza-filters');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnReset = document.getElementById('btn-reset');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.iconExpand = document.getElementById('icon-expand');
    this.iconCompress = document.getElementById('icon-compress');
  }

  init() {
    this.renderEixosFilters();
    this.renderNaturezaFilters();
    this.bindEvents();
  }

  renderEixosFilters() {
    if (!this.eixosContainer) return;
    this.eixosContainer.innerHTML = '';

    const eixosList = Object.entries(this.store.state.eixosFormacao);

    eixosList.forEach(([key, name]) => {
      const label = document.createElement('label');
      label.className = 'eixo-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.store.state.activeEixosFilters.has(key);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.store.state.activeEixosFilters.add(key);
        } else {
          this.store.state.activeEixosFilters.delete(key);
        }
        this.eventBus.emit('layout:update', { animate: true });
      });

      const colorDot = document.createElement('span');
      colorDot.className = 'eixo-color-dot';
      colorDot.style.backgroundColor = EIXO_COLORS[key] || EIXO_COLORS.empty;

      label.appendChild(checkbox);
      label.appendChild(colorDot);
      label.appendChild(document.createTextNode(name));

      this.eixosContainer.appendChild(label);
    });
  }

  renderNaturezaFilters() {
    if (!this.naturezaContainer) return;
    this.naturezaContainer.innerHTML = '';

    const naturezaList = ["Obrigatória", "Optativa"];

    naturezaList.forEach(natureza => {
      const label = document.createElement('label');
      label.className = 'eixo-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.store.state.activeNaturezaFilters.has(natureza);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.store.state.activeNaturezaFilters.add(natureza);
        } else {
          this.store.state.activeNaturezaFilters.delete(natureza);
        }
        this.eventBus.emit('layout:update', { animate: true });
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(natureza));

      this.naturezaContainer.appendChild(label);
    });
  }

  _updateFullscreenIcons() {
    const isFs = !!document.fullscreenElement;
    if (this.iconExpand) this.iconExpand.style.display = isFs ? 'none' : '';
    if (this.iconCompress) this.iconCompress.style.display = isFs ? '' : 'none';
  }

  bindEvents() {
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        this.eventBus.emit('zoom:in');
      });
    }

    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        this.eventBus.emit('zoom:out');
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.store.setState({ treeFocusNodeId: null, selectedRingIndex: null });
        this.eventBus.emit('panel:hide');
        this.eventBus.emit('zoom:reset');
        this.eventBus.emit('layout:update', { animate: true });
      });
    }

    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => { });
        } else {
          document.exitFullscreen().catch(() => { });
        }
      });

      document.addEventListener('fullscreenchange', () => {
        this._updateFullscreenIcons();
      });
    }
  }
}
