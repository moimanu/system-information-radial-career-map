/**
 * DetailPanel - DOM UI Controller for side detail panel exposing discipline information.
 */
export class DetailPanel {
  constructor(store, eventBus) {
    this.store = store;
    this.eventBus = eventBus;

    // Cache DOM references once upon initialization
    this.panelEl = document.getElementById('detail-panel');
    this.closeBtn = document.getElementById('close-panel');

    this.codeEl = document.getElementById('discipline-code');
    this.nameEl = document.getElementById('discipline-name');
    this.periodEl = document.getElementById('discipline-period');
    this.eixoEl = document.getElementById('discipline-eixo');
    this.naturezaEl = document.getElementById('discipline-natureza');
    this.metodologiaEl = document.getElementById('discipline-metodologia');
    this.chEl = document.getElementById('discipline-ch');
    this.chTeoricaEl = document.getElementById('ch-teorica');
    this.chPraticaEl = document.getElementById('ch-pratica');

    this.ementaEl = document.getElementById('discipline-ementa');
    this.objetivosEl = document.getElementById('discipline-objetivos');
    this.bibBasicaEl = document.getElementById('discipline-bib-basica');
    this.bibCompEl = document.getElementById('discipline-bib-comp');
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.hide();
        this.eventBus.emit('panel:hide');
      });
    }

    this.eventBus.on('panel:show', (d) => this.show(d));
    this.eventBus.on('panel:hide', () => this.hide());
  }

  show(d) {
    if (!d || !this.panelEl) return;

    if (this.codeEl) this.codeEl.textContent = d.codigo || d.id;
    if (this.nameEl) this.nameEl.textContent = d.nome;
    if (this.periodEl) this.periodEl.textContent = d.periodo || 'N/A';

    const eixoName = this.store.state.eixosFormacao[d.eixoFormacao] || d.eixoFormacao || 'Outros';
    if (this.eixoEl) this.eixoEl.textContent = eixoName;
    if (this.naturezaEl) this.naturezaEl.textContent = d.natureza || 'N/A';
    if (this.metodologiaEl) this.metodologiaEl.textContent = d.abordagemMetodologica || 'N/A';

    const ch = d.cargaHoraria || {};
    if (this.chEl) this.chEl.textContent = ch.total || 0;
    if (this.chTeoricaEl) this.chTeoricaEl.textContent = ch.teorica || 0;
    if (this.chPraticaEl) this.chPraticaEl.textContent = ch.pratica || 0;

    if (this.ementaEl) this.ementaEl.textContent = d.ementa || 'Nenhuma ementa cadastrada.';
    if (this.objetivosEl) this.objetivosEl.textContent = d.objetivos || 'Nenhum objetivo cadastrado.';
    if (this.bibBasicaEl) this.bibBasicaEl.textContent = d.bibliografiaBasica || 'Nenhuma bibliografia cadastrada.';
    if (this.bibCompEl) this.bibCompEl.textContent = d.bibliografiaComplementar || 'Nenhuma bibliografia cadastrada.';

    this.panelEl.classList.remove('hidden');
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.add('panel-open');
  }

  hide() {
    if (this.panelEl) {
      this.panelEl.classList.add('hidden');
    }
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.remove('panel-open');
  }
}
