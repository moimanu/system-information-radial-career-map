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
    this.updateConfirmButtonState();
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

    this.updateConfirmButtonState();
  }

  updateConfirmButtonState() {
    if (!this.confirmBtn || !this.selectEl) return;
    const hasSelection = Boolean(this.selectEl.value);

    this.confirmBtn.disabled = !hasSelection;
    if (hasSelection) {
      this.confirmBtn.classList.remove('disabled');
    } else {
      this.confirmBtn.classList.add('disabled');
    }
  }

  bindEvents() {
    if (this.selectEl) {
      this.selectEl.addEventListener('change', () => {
        this.updateConfirmButtonState();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        // Só permite fechar se já existir uma profissão escolhida anteriormente no Store
        if (this.store.state.selectedProfessionId) {
          this.hide();
        }
      });
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
        // Só permite fechar pelo backdrop se já houver profissão selecionada
        if (e.target === this.modalEl && this.store.state.selectedProfessionId) {
          this.hide();
        }
      });
    }
  }

  show() {
    this.renderProfessions();

    // Oculta o botão 'X' de fechar se for o primeiro acesso (sem profissão definida)
    if (this.closeBtn) {
      this.closeBtn.style.display = this.store.state.selectedProfessionId ? 'block' : 'none';
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