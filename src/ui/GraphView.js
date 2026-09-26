import { RadialLayout } from '../strategies/RadialLayout.js';
import { TreeLayout } from '../strategies/TreeLayout.js';
import { LayerLayout } from '../strategies/LayerLayout.js';
import { normalizeLayer } from '../domain/LayerNormalizer.js';
import { EIXO_COLORS } from './EixoColors.js';

/**
 * GraphView - D3.js SVG rendering controller using modern .join() API.
 */
export class GraphView {
  constructor(store, eventBus) {
    this.store = store;
    this.eventBus = eventBus;

    this.radialStrategy = new RadialLayout();
    this.treeStrategy = new TreeLayout();
    this.layerStrategy = new LayerLayout();

    // Cache DOM container
    this.container = document.getElementById('graph-container');
    this.svg = null;
    this.containerGroup = null;
    this.zoomBehavior = null;
  }

  init() {
    if (!this.container) return;

    this.store.state.width = this.container.clientWidth;
    this.store.state.height = this.container.clientHeight;

    this.svg = d3.select('#radial-graph')
      .attr('viewBox', `0 0 ${this.store.state.width} ${this.store.state.height}`);

    // Arrowhead SVG Defs
    const defs = this.svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    defs.append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#2e7d32');

    this.containerGroup = this.svg.append('g').attr('class', 'zoom-container');

    // D3 Zoom Setup
    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.containerGroup.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);

    // Background Click Reset
    this.svg.on('click', (event) => {
      if (event.target.tagName === 'svg') {
        if (this.store.state.treeFocusNodeId || this.store.state.selectedRingIndex) {
          this.store.setState({ treeFocusNodeId: null, selectedRingIndex: null });
          this.eventBus.emit('panel:hide');
          this.updateNodePositions(true);
        }
      }
    });

    // Window Resize Handler
    window.addEventListener('resize', () => {
      this.store.state.width = this.container.clientWidth;
      this.store.state.height = this.container.clientHeight;
      this.svg.attr('viewBox', `0 0 ${this.store.state.width} ${this.store.state.height}`);
      this.updateNodePositions(false);
    });

    this.bindEvents();
    this.renderGraph();
  }

  bindEvents() {
    this.eventBus.on('zoom:in', () => {
      this.svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 1.3);
    });

    this.eventBus.on('zoom:out', () => {
      this.svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 0.7);
    });

    this.eventBus.on('zoom:reset', () => {
      this.svg.transition().duration(500).call(this.zoomBehavior.transform, d3.zoomIdentity);
    });

    this.eventBus.on('layout:update', ({ animate = true } = {}) => {
      this.updateNodePositions(animate);
    });
  }

  renderGraph() {
    const g = this.containerGroup;
    g.selectAll('*').remove();

    g.append('g').attr('class', 'layer-rings');
    g.append('g').attr('class', 'layer-edges');
    g.append('g').attr('class', 'layer-nodes');
    g.append('g').attr('class', 'layer-labels');

    this.updateNodePositions(false);
  }

  isNodeDimmed(d, layout) {
    if (layout.isTreeMode || layout.isLayerMode) {
      if (d.isCenter) return true;
      return !layout.subgraphNodes.has(d.id);
    }
    return false;
  }

  updateNodePositions(animate = true) {
    let strategy = this.radialStrategy;
    if (this.store.state.treeFocusNodeId) {
      strategy = this.treeStrategy;
    } else if (this.store.state.selectedRingIndex) {
      strategy = this.layerStrategy;
    }

    const layout = strategy.calculate(this.store);
    const g = this.containerGroup;
    const duration = animate ? 750 : 0;

    // 1. RENDER RINGS
    const ringsGroup = g.select('.layer-rings');
    ringsGroup.selectAll('*').remove();

    if (!layout.isTreeMode) {
      const centerX = this.store.state.width / 2;
      const centerY = this.store.state.height / 2;

      for (let i = 1; i <= 10; i++) {
        const rOuter = layout.ringRadii[i];
        const rInner = layout.ringRadii[i - 1] || 0;

        const ringSector = d3.arc()
          .innerRadius(rInner)
          .outerRadius(rOuter)
          .startAngle(0)
          .endAngle(2 * Math.PI);

        ringsGroup.append('path')
          .attr('d', ringSector())
          .attr('transform', `translate(${centerX}, ${centerY})`)
          .attr('class', 'ring-area-hover')
          .classed('active-layer', this.store.state.selectedRingIndex === i)
          .on('mousemove', (event) => this.showRingTooltip(event, `Nível ${i}`))
          .on('mouseleave', () => this.hideRingTooltip())
          .on('click', (event) => {
            event.stopPropagation();
            this.hideRingTooltip();
            const newIndex = (this.store.state.selectedRingIndex === i) ? null : i;
            this.store.setState({ selectedRingIndex: newIndex, treeFocusNodeId: null });
            this.eventBus.emit('panel:hide');
            this.updateNodePositions(true);
          });

        ringsGroup.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', rOuter)
          .attr('class', 'ring-line');
      }
    }

    // 2. RENDER EDGES (Conexões) with d3.join()
    const edgesGroup = g.select('.layer-edges');
    const edgeData = this.store.state.arestas.map(e => ({
      ...e,
      id: `${e.origem}->${e.destino}`
    }));

    const edgesMerged = edgesGroup.selectAll('.edge-line')
      .data(edgeData, d => d.id)
      .join(
        enter => enter.append('line').attr('class', 'edge-line').attr('marker-end', 'url(#arrow)'),
        update => update,
        exit => exit.remove()
      )
      .classed('dimmed', d => {
        if (layout.isTreeMode || layout.isLayerMode) {
          return !(layout.subgraphNodes.has(d.origem) && layout.subgraphNodes.has(d.destino));
        }
        return false;
      });

    if (animate) {
      edgesMerged.transition().duration(duration)
        .attr('x1', d => layout.nodePositions[d.origem]?.x || 0)
        .attr('y1', d => layout.nodePositions[d.origem]?.y || 0)
        .attr('x2', d => layout.nodePositions[d.destino]?.x || 0)
        .attr('y2', d => layout.nodePositions[d.destino]?.y || 0);
    } else {
      edgesMerged
        .attr('x1', d => layout.nodePositions[d.origem]?.x || 0)
        .attr('y1', d => layout.nodePositions[d.origem]?.y || 0)
        .attr('x2', d => layout.nodePositions[d.destino]?.x || 0)
        .attr('y2', d => layout.nodePositions[d.destino]?.y || 0);
    }

    // 3. RENDER NODES (Vértices) with d3.join()
    const nodesGroup = g.select('.layer-nodes');
    const profObj = this.store.state.profissoes.find(p => p.id === this.store.state.selectedProfessionId);
    const centerNode = {
      id: 'CENTER_PROFESSION',
      nome: profObj ? profObj.nome : 'Profissão',
      isCenter: true
    };
    const allNodes = [centerNode, ...this.store.state.disciplinas];

    const nodesMerged = nodesGroup.selectAll('.node-group')
      .data(allNodes, d => d.id)
      .join(
        enter => {
          const group = enter.append('g').attr('class', 'node-group');
          group.append('circle');
          return group;
        },
        update => update,
        exit => exit.remove()
      );

    nodesMerged.select('circle')
      .attr('class', d => d.isCenter ? 'node-circle center-node' : 'node-circle')
      .attr('r', d => d.isCenter ? 18 : 8)
      .attr('fill', d => {
        if (d.isCenter) return 'var(--accent-color)';
        const eixo = d.eixoFormacao || '';
        return EIXO_COLORS[eixo] || EIXO_COLORS.empty;
      });

    if (animate) {
      nodesMerged.transition().duration(duration)
        .attr('transform', d => {
          const pos = layout.nodePositions[d.id] || { x: 0, y: 0 };
          return `translate(${pos.x}, ${pos.y})`;
        });
    } else {
      nodesMerged.attr('transform', d => {
        const pos = layout.nodePositions[d.id] || { x: 0, y: 0 };
        return `translate(${pos.x}, ${pos.y})`;
      });
    }

    nodesMerged.classed('dimmed', d => this.isNodeDimmed(d, layout));

    nodesGroup.selectAll('.node-group').sort((a, b) => {
      const aDim = this.isNodeDimmed(a, layout);
      const bDim = this.isNodeDimmed(b, layout);
      if (aDim && !bDim) return -1;
      if (!aDim && bDim) return 1;
      return 0;
    });

    // 4. RENDER LABELS with d3.join()
    const labelsGroup = g.select('.layer-labels');
    const labelNodes = this.store.state.disciplinas;

    const labelsMerged = labelsGroup.selectAll('.label-group')
      .data(labelNodes, d => d.id)
      .join(
        enter => {
          const group = enter.append('g').attr('class', 'label-group');
          group.append('rect').attr('class', 'label-bg');
          group.append('text')
            .attr('class', 'node-label')
            .attr('dy', 22)
            .attr('text-anchor', 'middle');
          return group;
        },
        update => update,
        exit => exit.remove()
      );

    labelsMerged.select('text').text(d => d.nome);

    if (animate) {
      labelsMerged.transition().duration(duration)
        .attr('transform', d => {
          const pos = layout.nodePositions[d.id] || { x: 0, y: 0 };
          return `translate(${pos.x}, ${pos.y})`;
        });
    } else {
      labelsMerged.attr('transform', d => {
        const pos = layout.nodePositions[d.id] || { x: 0, y: 0 };
        return `translate(${pos.x}, ${pos.y})`;
      });
    }

    labelsMerged.each(function () {
      const group = d3.select(this);
      const textNode = group.select('text').node();
      const rectNode = group.select('rect');
      if (textNode) {
        try {
          const bbox = textNode.getBBox();
          if (bbox.width > 0 && bbox.height > 0) {
            const paddingX = 6;
            const paddingY = 3;
            rectNode
              .attr('x', bbox.x - paddingX)
              .attr('y', bbox.y - paddingY)
              .attr('width', bbox.width + paddingX * 2)
              .attr('height', bbox.height + paddingY * 2);
          }
        } catch (e) {
          // Fallback
        }
      }
    });

    labelsMerged.classed('dimmed', d => this.isNodeDimmed(d, layout));

    // Interaction Events
    nodesMerged
      .on('mouseenter', (event, d) => {
        if (d.isCenter) {
          this.showRingTooltip(event, `${d.nome}`);
          return;
        }
        if (this.isNodeDimmed(d, layout)) return;
        this.store.state.hoveredNodeId = d.id;
        this.updateLabelsVisibility(layout);
        this.highlightConnections(d.id);
      })
      .on('mouseleave', (event, d) => {
        if (d.isCenter) {
          this.hideRingTooltip();
          return;
        }
        if (this.isNodeDimmed(d, layout)) return;
        this.store.state.hoveredNodeId = null;
        this.updateLabelsVisibility(layout);
        this.resetEdgeHighlights();
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.isCenter) {
          this.hideRingTooltip();
          this.eventBus.emit('modal:show');
          return;
        }
        if (this.isNodeDimmed(d, layout)) return;

        this.store.setState({ treeFocusNodeId: d.id, selectedRingIndex: null });
        this.eventBus.emit('panel:show', d);
        this.updateNodePositions(true);
      });

    this.updateGraphVisibility();
    this.updateLabelsVisibility(layout);
  }

  updateGraphVisibility() {
    const g = this.containerGroup;
    if (!g) return;

    const { activeEixosFilters, activeNaturezaFilters, disciplinas } = this.store.state;

    g.selectAll('.node-group').each(function (d) {
      if (d.isCenter) return;
      const eixo = d.eixoFormacao || "";
      const natureza = d.natureza || "";
      const isVisible = activeEixosFilters.has(eixo) && activeNaturezaFilters.has(natureza);
      d3.select(this).style('display', isVisible ? 'block' : 'none');
    });

    g.selectAll('.label-group').each(function (d) {
      const eixo = d.eixoFormacao || "";
      const natureza = d.natureza || "";
      const isVisible = activeEixosFilters.has(eixo) && activeNaturezaFilters.has(natureza);
      d3.select(this).style('display', isVisible ? 'block' : 'none');
    });

    g.selectAll('.edge-line').each(function (d) {
      const orig = disciplinas.find(x => x.id === d.origem);
      const dest = disciplinas.find(x => x.id === d.destino);
      const origVisible = orig && activeEixosFilters.has(orig.eixoFormacao || "") && activeNaturezaFilters.has(orig.natureza || "");
      const destVisible = dest && activeEixosFilters.has(dest.eixoFormacao || "") && activeNaturezaFilters.has(dest.natureza || "");
      d3.select(this).style('display', (origVisible && destVisible) ? 'block' : 'none');
    });
  }

  updateLabelsVisibility(layout = null) {
    const g = this.containerGroup;
    if (!g) return;

    if (!layout) {
      let strategy = this.radialStrategy;
      if (this.store.state.treeFocusNodeId) {
        strategy = this.treeStrategy;
      } else if (this.store.state.selectedRingIndex) {
        strategy = this.layerStrategy;
      }
      layout = strategy.calculate(this.store);
    }

    const { hoveredNodeId } = this.store.state;

    g.selectAll('.label-group').each(function (d) {
      let isVisible = false;
      const isDimmed = (layout.isTreeMode || layout.isLayerMode)
        ? (!d.isCenter && !layout.subgraphNodes.has(d.id))
        : false;

      if (!isDimmed) {
        if ((layout.isTreeMode || layout.isLayerMode) && layout.subgraphNodes.has(d.id)) {
          isVisible = true;
        } else if (hoveredNodeId === d.id) {
          isVisible = true;
        }
      }

      const group = d3.select(this);
      group.classed('visible', isVisible);
      if (isVisible && hoveredNodeId === d.id) {
        group.raise();
      }
    });
  }

  highlightConnections(nodeId) {
    const g = this.containerGroup;
    g.selectAll('.edge-line')
      .classed('highlighted', d => d.origem === nodeId || d.destino === nodeId)
      .attr('marker-end', d => (d.origem === nodeId || d.destino === nodeId) ? 'url(#arrow-active)' : 'url(#arrow)');
  }

  resetEdgeHighlights() {
    const g = this.containerGroup;
    g.selectAll('.edge-line')
      .classed('highlighted', false)
      .attr('marker-end', 'url(#arrow)');
  }

  showRingTooltip(event, text) {
    let tooltip = document.getElementById('ring-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'ring-tooltip';
      tooltip.className = 'ring-tooltip';
      this.container.appendChild(tooltip);
    }

    const containerRect = this.container.getBoundingClientRect();
    const x = event.clientX - containerRect.left + 14;
    const y = event.clientY - containerRect.top + 14;

    tooltip.textContent = text;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add('visible');
  }

  hideRingTooltip() {
    const tooltip = document.getElementById('ring-tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }
}
