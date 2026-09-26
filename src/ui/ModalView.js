/**
 * ModalView - DOM UI Controller for profession selection modal popup.
 */
export class ModalView {
  constructor(store, eventBus) {
    this.store = store;
    this.eventBus = eventBus;

    // Cache DOM element references
    this.modalEl = document.getElementById('profession-modal');
    this.selectEl = document.getElementById('profession-select');
    this.closeBtn = document.getElementById('close-profession-modal');
    this.confirmBtn = document.getElementById('btn-confirm-profession');
  }

  init() {
    this.renderProfessions();
    this.bindEvents();
  }

  renderProfessions() {
    if (!this.selectEl) return;
    this.selectEl.innerHTML = '';
    this.store.state.profissoes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome;
      this.selectEl.appendChild(opt);
    });

    if (this.store.state.selectedProfessionId) {
      this.selectEl.value = this.store.state.selectedProfessionId;
    }
  }

  bindEvents() {
    if (this.selectEl) {
      this.selectEl.addEventListener('change', (e) => {
        this.store.setState({
          selectedProfessionId: e.target.value,
          treeFocusNodeId: null
        });
        this.eventBus.emit('panel:hide');
        this.hide();
        this.eventBus.emit('layout:update', { animate: true });
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => this.hide());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.hide();
        }
      });
    }
  }

  show() {
    if (this.selectEl && this.store.state.selectedProfessionId) {
      this.selectEl.value = this.store.state.selectedProfessionId;
    }
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }
}
