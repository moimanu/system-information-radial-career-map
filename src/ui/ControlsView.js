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
    this.btnProfessionInfo = document.getElementById('btn-profession-info');
    this.iconExpand = document.getElementById('icon-expand');
    this.iconCompress = document.getElementById('icon-compress');
    this.professionTooltip = null;
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

  toggleProfessionTooltip() {
    if (!this.professionTooltip) {
      this.professionTooltip = document.createElement('div');
      this.professionTooltip.id = 'profession-info-tooltip';
      this.professionTooltip.className = 'profession-info-tooltip';
      document.body.appendChild(this.professionTooltip);
    }

    const isVisible = this.professionTooltip.classList.contains('visible');
    if (isVisible) {
      this.hideProfessionTooltip();
    } else {
      this.showProfessionTooltip();
    }
  }

  showProfessionTooltip() {
    if (!this.professionTooltip || !this.btnProfessionInfo) return;

    const selectedId = this.store.state.selectedProfessionId;
    const profObj = this.store.state.profissoes.find(p => p.id === selectedId);

    const title = profObj ? profObj.nome : 'Nenhuma profissão selecionada';
    const description = profObj
      ? (profObj.descricao || profObj.perfilProfissional || 'Nenhuma descrição disponível para esta profissão.')
      : 'Selecione uma profissão no centro do mapa radial para visualizar seus detalhes.';

    this.professionTooltip.innerHTML = `
      <div class="tooltip-title">${title}</div>
      <div class="tooltip-body">${description}</div>
    `;

    const rect = this.btnProfessionInfo.getBoundingClientRect();
    this.professionTooltip.style.right = `${window.innerWidth - rect.left + 12}px`;
    this.professionTooltip.style.bottom = `${window.innerHeight - rect.bottom}px`;
    this.professionTooltip.classList.add('visible');
  }

  hideProfessionTooltip() {
    if (this.professionTooltip) {
      this.professionTooltip.classList.remove('visible');
    }
  }

  bindEvents() {
    if (this.btnProfessionInfo) {
      this.btnProfessionInfo.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleProfessionTooltip();
      });

      document.addEventListener('click', (e) => {
        if (
          this.professionTooltip &&
          !this.professionTooltip.contains(e.target) &&
          !this.btnProfessionInfo.contains(e.target)
        ) {
          this.hideProfessionTooltip();
        }
      });
    }

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