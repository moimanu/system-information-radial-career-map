/**
 * ModalView - DOM UI Controller para seleção de profissões via dropdown customizado.
 */
export class ModalView {
  constructor(store, eventBus) {
    this.store = store;
    this.eventBus = eventBus;
    this.modalEl = document.getElementById('profession-modal');
    this.closeBtn = document.getElementById('close-profession-modal');
    this.confirmBtn = document.getElementById('btn-confirm-profession');

    // Elementos do Dropdown Customizado
    this.dropdownEl = document.getElementById('custom-dropdown');
    this.triggerEl = document.getElementById('dropdown-trigger');
    this.labelEl = document.getElementById('dropdown-label');
    this.optionsContainer = document.getElementById('dropdown-options');

    this.selectedValue = null;
  }

  init() {
    this.selectedValue = this.store.state.selectedProfessionId || null;
    this.renderProfessions();
    this.bindEvents();
    this.updateConfirmButtonState();
  }

  renderProfessions() {
    if (!this.optionsContainer) return;
    this.optionsContainer.innerHTML = '';

    const currentSelectedId = this.selectedValue;
    const currentProf = this.store.state.profissoes.find(p => p.id === currentSelectedId);

    if (currentProf) {
      this.labelEl.textContent = currentProf.nome;
    } else {
      this.labelEl.textContent = 'Selecione uma profissão';
    }

    this.store.state.profissoes.forEach(p => {
      const optionEl = document.createElement('div');
      optionEl.className = 'dropdown-option';
      if (p.id === currentSelectedId) {
        optionEl.classList.add('selected');
      }
      optionEl.textContent = p.nome;

      optionEl.addEventListener('click', () => {
        this.selectedValue = p.id;
        this.labelEl.textContent = p.nome;
        this.closeDropdown();
        this.renderProfessions();
        this.updateConfirmButtonState();
      });

      this.optionsContainer.appendChild(optionEl);
    });

    this.updateConfirmButtonState();
  }

  toggleDropdown() {
    const isHidden = this.optionsContainer.classList.contains('hidden');
    if (isHidden) {
      this.openDropdown();
    } else {
      this.closeDropdown();
    }
  }

  openDropdown() {
    this.optionsContainer.classList.remove('hidden');
    this.dropdownEl.classList.add('open');
  }

  closeDropdown() {
    this.optionsContainer.classList.add('hidden');
    this.dropdownEl.classList.remove('open');
  }

  updateConfirmButtonState() {
    if (!this.confirmBtn) return;
    const hasSelection = Boolean(this.selectedValue);

    this.confirmBtn.disabled = !hasSelection;
    if (hasSelection) {
      this.confirmBtn.classList.remove('disabled');
    } else {
      this.confirmBtn.classList.add('disabled');
    }
  }

  bindEvents() {
    if (this.triggerEl) {
      this.triggerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    // Fecha o dropdown caso o usuário clique fora dele
    document.addEventListener('click', (e) => {
      if (this.dropdownEl && !this.dropdownEl.contains(e.target)) {
        this.closeDropdown();
      }
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        if (this.store.state.selectedProfessionId) {
          this.hide();
        }
      });
    }

    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => {
        if (this.selectedValue) {
          this.store.setState({
            selectedProfessionId: this.selectedValue,
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
        if (e.target === this.modalEl && this.store.state.selectedProfessionId) {
          this.hide();
        }
      });
    }
  }

  show() {
    this.selectedValue = this.store.state.selectedProfessionId || null;
    this.renderProfessions();
    this.closeDropdown();

    if (this.closeBtn) {
      this.closeBtn.style.display = this.store.state.selectedProfessionId ? 'block' : 'none';
    }

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  hide() {
    this.closeDropdown();
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }
}