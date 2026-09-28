/**
 * ModalView - DOM UI Controller for profession selection modal popup.
 */
export class ModalView {
  constructor(store, eventBus) {
    this.store = store;
    this.eventBus = eventBus;
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

    // Opção padrão quando nenhuma profissão está selecionada
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Selecione uma profissão';
    defaultOpt.disabled = true;
    defaultOpt.selected = !this.store.state.selectedProfessionId;
    this.selectEl.appendChild(defaultOpt);

    this.store.state.profissoes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome;
      if (p.id === this.store.state.selectedProfessionId) {
        opt.selected = true;
      }
      this.selectEl.appendChild(opt);
    });
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => {
        const selectedValue = this.selectEl.value;
        if (selectedValue) {
          this.store.setState({
            selectedProfessionId: selectedValue,
            treeFocusNodeId: null
          });
          this.eventBus.emit('panel:hide');
          this.hide();
          this.eventBus.emit('layout:update', { animate: true });
        }
      });
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
    this.renderProfessions();
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