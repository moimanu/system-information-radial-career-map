/**
 * Radial Career Map Application
 * Implementation based on requirements from planning.md, estrutura-de-dados.md, objetivo.md & arestas.json
 */

// Global Application State
const state = {
  profissoes: [],
  eixosFormacao: {},
  disciplinas: [],
  arestas: [],

  selectedProfessionId: null,
  activeEixosFilters: new Set(),
  activeNaturezaFilters: new Set(),
  hoveredRingIndex: null,
  selectedRingIndex: null, // Radial layer index selected via click
  hoveredNodeId: null,
  treeFocusNodeId: null, // Node selected for tree view mode

  // D3 Selection references
  svg: null,
  containerGroup: null,
  zoomBehavior: null,
  width: 0,
  height: 0
};

// Pastel Colors per Eixo
const EIXO_COLORS = {
  mat: "#aec6cf",  // Pastel Blue
  comp: "#ffb3ba", // Pastel Pink
  ti: "#b5ead7",   // Pastel Mint
  adm: "#ffdfba",  // Pastel Peach
  cpl: "#e2f0cb",  // Pastel Lime
  pso: "#c7ceea",  // Pastel Purple
  empty: "#d3d3d3" // Default Gray for empty/unspecified
};

// Raw Layer Mapping Normalization (1..10 layers)
function normalizeLayer(rawVal) {
  if (rawVal === undefined || rawVal === null || rawVal === "") return 10;
  const num = parseInt(rawVal, 10);
  if (isNaN(num)) return 10;

  // Direct values present in dataset: 1, 3, 5, 6, 7, 9
  // Mapping into 10 concentric layers
  switch (num) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
    case 4: return 4;
    case 5: return 5;
    case 6: return 6;
    case 7: return 7;
    case 8: return 8;
    case 9: return 9;
    default: return 10;
  }
}

// Helper to check if a node is currently dimmed (out of focus)
function isNodeDimmed(d, layout = null) {
  if (!layout) layout = computeLayout();
  if (layout.isTreeMode) {
    if (d.isCenter) return true;
    return !layout.subgraphNodes.has(d.id);
  }
  if (state.selectedRingIndex !== null) {
    if (d.isCenter) return true;
    const layer = normalizeLayer(d.camadasPorProfissao?.[state.selectedProfessionId]);
    return layer !== state.selectedRingIndex;
  }
  return false;
}

// Data Loader
async function loadData() {
  try {
    const [profRes, eixosRes, discRes, arestasRes] = await Promise.all([
      fetch('data/profissoes.json').then(r => r.json()),
      fetch('data/eixos-formacao.json').then(r => r.json()),
      fetch('data/disciplinas.json').then(r => r.json()),
      fetch('data/arestas.json').then(r => r.json())
    ]);

    state.profissoes = profRes;

    // eixos-formacao.json is an array with 1 object dictionary
    state.eixosFormacao = Array.isArray(eixosRes) ? eixosRes[0] : eixosRes;

    state.disciplinas = discRes;
    state.arestas = arestasRes;

    // Initialize active filters with all eixos enabled (plus empty string for unlabeled)
    Object.keys(state.eixosFormacao).forEach(key => state.activeEixosFilters.add(key));
    state.activeEixosFilters.add("");

    // Initialize active nature filters (Obrigatória, Optativa)
    state.activeNaturezaFilters.add("Obrigatória");
    state.activeNaturezaFilters.add("Optativa");
    state.activeNaturezaFilters.add("");

    if (state.profissoes.length > 0) {
      state.selectedProfessionId = state.profissoes[0].id;
    }

    initUI();
    initGraph();
    renderGraph();
  } catch (err) {
    console.error("Erro ao carregar os dados:", err);
  }
}

// Initialize UI Controls (Dropdown & Filters)
function initUI() {
  // Populate Profession Dropdown
  const select = document.getElementById('profession-select');
  select.innerHTML = '';
  state.profissoes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    state.selectedProfessionId = e.target.value;
    state.treeFocusNodeId = null; // Exit tree view if profession changes
    hideDetailPanel();
    hideProfessionModal();
    updateNodePositions(true);
  });

  // Profession Modal Control Events
  document.getElementById('close-profession-modal')?.addEventListener('click', hideProfessionModal);
  document.getElementById('btn-confirm-profession')?.addEventListener('click', hideProfessionModal);

  const modalOverlay = document.getElementById('profession-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideProfessionModal();
      }
    });
  }

  // Populate Eixos Filters
  const filtersContainer = document.getElementById('eixos-filters');
  filtersContainer.innerHTML = '';

  const eixosList = Object.entries(state.eixosFormacao);
  // Add empty option if any discipline has empty eixo
  //eixosList.push(["", "Outros / Não Definido"]);

  eixosList.forEach(([key, name]) => {
    const label = document.createElement('label');
    label.className = 'eixo-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.activeEixosFilters.has(key);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.activeEixosFilters.add(key);
      } else {
        state.activeEixosFilters.delete(key);
      }
      updateNodePositions(true);
    });

    const colorDot = document.createElement('span');
    colorDot.className = 'eixo-color-dot';
    colorDot.style.backgroundColor = EIXO_COLORS[key] || EIXO_COLORS.empty;

    label.appendChild(checkbox);
    label.appendChild(colorDot);
    label.appendChild(document.createTextNode(name));

    filtersContainer.appendChild(label);
  });

  // Populate Natureza Filters (Obrigatória / Optativa)
  const naturezaContainer = document.getElementById('natureza-filters');
  if (naturezaContainer) {
    naturezaContainer.innerHTML = '';
    const naturezaList = ["Obrigatória", "Optativa"];

    naturezaList.forEach(natureza => {
      const label = document.createElement('label');
      label.className = 'eixo-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = state.activeNaturezaFilters.has(natureza);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.activeNaturezaFilters.add(natureza);
        } else {
          state.activeNaturezaFilters.delete(natureza);
        }
        updateNodePositions(true);
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(natureza));

      naturezaContainer.appendChild(label);
    });
  }

  // Panel Close Button
  document.getElementById('close-panel').addEventListener('click', () => {
    hideDetailPanel();
    if (state.treeFocusNodeId) {
      state.treeFocusNodeId = null;
      updateNodePositions(true);
    }
  });

  // Zoom Button Controls
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    state.svg.transition().duration(300).call(state.zoomBehavior.scaleBy, 1.3);
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    state.svg.transition().duration(300).call(state.zoomBehavior.scaleBy, 0.7);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    state.treeFocusNodeId = null;
    hideDetailPanel();
    state.svg.transition().duration(500).call(
      state.zoomBehavior.transform,
      d3.zoomIdentity
    );
    updateNodePositions(true);
  });
}

function showProfessionModal() {
  const modal = document.getElementById('profession-modal');
  const select = document.getElementById('profession-select');
  if (select && state.selectedProfessionId) {
    select.value = state.selectedProfessionId;
  }
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideProfessionModal() {
  const modal = document.getElementById('profession-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Initialize D3 Graph SVG & Layers
function initGraph() {
  const container = document.getElementById('graph-container');
  state.width = container.clientWidth;
  state.height = container.clientHeight;

  state.svg = d3.select('#radial-graph')
    .attr('viewBox', `0 0 ${state.width} ${state.height}`);

  // Setup SVG Defs for Arrowhead Marker
  const defs = state.svg.append('defs');
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

  // Create main zoomed container group
  state.containerGroup = state.svg.append('g').attr('class', 'zoom-container');

  // Zoom and Pan setup
  state.zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      state.containerGroup.attr('transform', event.transform);
    });

  state.svg.call(state.zoomBehavior);

  // Background Click Handler to Reset View
  state.svg.on('click', (event) => {
    if (event.target.tagName === 'svg') {
      if (state.treeFocusNodeId || state.selectedRingIndex) {
        state.treeFocusNodeId = null;
        state.selectedRingIndex = null;
        hideDetailPanel();
        updateNodePositions(true);
      }
    }
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    state.width = container.clientWidth;
    state.height = container.clientHeight;
    state.svg.attr('viewBox', `0 0 ${state.width} ${state.height}`);
    updateNodePositions(false);
  });
}

// Compute Node & Edge Positions for Radial vs Tree Mode
// Compute Node & Edge Positions for Radial vs Tree Mode
function computeLayout() {
  const centerX = state.width / 2;
  const centerY = state.height / 2;

  // Tamanho fixo em píxeis para o raio máximo (exemplo: 400px de raio total)
  const FIXED_RADIUS = 500;
  const maxRadius = FIXED_RADIUS;

  // 10 Radial Rings Radii (R1 to R10) com espaçamento fixo (40px entre cada anel)
  const baseStep = maxRadius / 10;
  const ringRadii = [];

  // If a radial layer is selected via click, expand its radius to level 10 radius (maxRadius)
  const targetR10 = maxRadius;

  for (let i = 1; i <= 10; i++) {
    if (state.selectedRingIndex && !state.treeFocusNodeId) {
      if (i === state.selectedRingIndex) {
        ringRadii[i] = targetR10;
      } else if (i < state.selectedRingIndex) {
        // Compress inner rings proportionally within maxRadius
        ringRadii[i] = (targetR10 / state.selectedRingIndex) * i;
      } else {
        ringRadii[i] = targetR10;
      }
    } else {
      ringRadii[i] = baseStep * i;
    }
  }

  // TREE FOCUS MODE REPOSITIONING
  if (state.treeFocusNodeId) {
    // Extract subgraph: origin path to target, and target to leaves
    const subgraphNodes = getSubgraphNodes(state.treeFocusNodeId);

    // Build tree levels (top-down)
    const levels = computeTreeLevels(state.treeFocusNodeId, subgraphNodes);

    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    const totalLevels = levelKeys.length;
    const levelHeight = Math.min(100, (state.height - 160) / Math.max(1, totalLevels));
    const startY = 80;

    const nodePositions = {};

    levelKeys.forEach((lvl, lvlIdx) => {
      const nodesInLvl = levels[lvl];
      const count = nodesInLvl.length;
      const y = startY + lvlIdx * levelHeight;

      nodesInLvl.forEach((nodeId, idx) => {
        const x = (state.width / (count + 1)) * (idx + 1);
        nodePositions[nodeId] = { x, y, isFocused: true };
      });
    });

    // Positions for non-subgraph nodes (dimmed in background)
    state.disciplinas.forEach(d => {
      if (!nodePositions[d.id]) {
        // Place in radial background position
        const rawLayer = d.camadasPorProfissao?.[state.selectedProfessionId] || 10;
        const layer = normalizeLayer(rawLayer);
        const r = ringRadii[layer];
        const hash = simpleHash(d.id);
        const angle = (hash % 360) * (Math.PI / 180);
        nodePositions[d.id] = {
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          isFocused: false
        };
      }
    });

    // Center profession node at top header area
    nodePositions['CENTER_PROFESSION'] = { x: centerX, y: 35, isFocused: false };

    return { ringRadii, nodePositions, isTreeMode: true, subgraphNodes };
  }

  // RADIAL MODE (DEFAULT)
  const layerGroups = {};
  for (let i = 1; i <= 10; i++) layerGroups[i] = [];

  // Group ONLY active/visible disciplines per layer for balanced redistribution
  state.disciplinas.forEach(d => {
    const eixo = d.eixoFormacao || "";
    const natureza = d.natureza || "";
    if (state.activeEixosFilters.has(eixo) && state.activeNaturezaFilters.has(natureza)) {
      const rawLayer = d.camadasPorProfissao?.[state.selectedProfessionId] || 10;
      const layer = normalizeLayer(rawLayer);
      layerGroups[layer].push(d);
    }
  });

  const nodePositions = {};
  nodePositions['CENTER_PROFESSION'] = { x: centerX, y: centerY };

  // Distribute active nodes evenly across 10 concentric layers
  for (let layer = 1; layer <= 10; layer++) {
    const nodes = layerGroups[layer];
    const N = nodes.length;
    const r = ringRadii[layer];
    const angularOffset = (layer % 2 === 0 ? 0.3 : 0); // Offset to prevent overlap across layers

    nodes.forEach((d, j) => {
      const angle = (2 * Math.PI * j) / Math.max(1, N) + angularOffset - Math.PI / 2;
      nodePositions[d.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        layer: layer,
        angle: angle
      };
    });
  }

  // Fallback position for hidden/filtered out nodes so positions object is complete
  state.disciplinas.forEach(d => {
    if (!nodePositions[d.id]) {
      const rawLayer = d.camadasPorProfissao?.[state.selectedProfessionId] || 10;
      const layer = normalizeLayer(rawLayer);
      const r = ringRadii[layer] || maxRadius;
      nodePositions[d.id] = { x: centerX, y: centerY + r, layer: layer, angle: 0 };
    }
  });

  return { ringRadii, nodePositions, isTreeMode: false, subgraphNodes: null };
}

// Helper: Extract Subgraph for Tree Focus Mode (Parents -> Target -> Children)
function getSubgraphNodes(targetId) {
  const subgraph = new Set([targetId]);

  // Upstream: ancestors (origem -> target)
  function addAncestors(id) {
    state.arestas.forEach(edge => {
      if (edge.destino === id && !subgraph.has(edge.origem)) {
        subgraph.add(edge.origem);
        addAncestors(edge.origem);
      }
    });
  }

  // Downstream: descendants (target -> destino)
  function addDescendants(id) {
    state.arestas.forEach(edge => {
      if (edge.origem === id && !subgraph.has(edge.destino)) {
        subgraph.add(edge.destino);
        addDescendants(edge.destino);
      }
    });
  }

  addAncestors(targetId);
  addDescendants(targetId);

  return subgraph;
}

// Helper: Calculate tree levels (depths) relative to target node
function computeTreeLevels(targetId, subgraphSet) {
  const levels = {};
  const depthMap = { [targetId]: 0 };

  // Topological / BFS level assignment
  // Compute negative depths for ancestors
  let queue = [targetId];
  while (queue.length > 0) {
    const curr = queue.shift();
    const currDepth = depthMap[curr];

    state.arestas.forEach(e => {
      if (e.destino === curr && subgraphSet.has(e.origem)) {
        if (depthMap[e.origem] === undefined || depthMap[e.origem] > currDepth - 1) {
          depthMap[e.origem] = currDepth - 1;
          queue.push(e.origem);
        }
      }
    });
  }

  // Compute positive depths for descendants
  queue = [targetId];
  while (queue.length > 0) {
    const curr = queue.shift();
    const currDepth = depthMap[curr];

    state.arestas.forEach(e => {
      if (e.origem === curr && subgraphSet.has(e.destino)) {
        if (depthMap[e.destino] === undefined || depthMap[e.destino] < currDepth + 1) {
          depthMap[e.destino] = currDepth + 1;
          queue.push(e.destino);
        }
      }
    });
  }

  // Group node IDs by depth level
  Object.entries(depthMap).forEach(([id, depth]) => {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(id);
  });

  return levels;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Initial Drawing & Data Binding
function renderGraph() {
  const g = state.containerGroup;
  g.selectAll('*').remove();

  // Sub-groups for layering
  g.append('g').attr('class', 'layer-rings');
  g.append('g').attr('class', 'layer-edges');
  g.append('g').attr('class', 'layer-nodes');
  g.append('g').attr('class', 'layer-labels');

  updateNodePositions(false);
}

// Main Render & Update Function with Smooth Animations
function updateNodePositions(animate = true) {
  const layout = computeLayout();
  const g = state.containerGroup;
  const duration = animate ? 750 : 0;

  // 1. RENDER RINGS
  const ringsGroup = g.select('.layer-rings');
  ringsGroup.selectAll('*').remove();

  if (!layout.isTreeMode) {
    const centerX = state.width / 2;
    const centerY = state.height / 2;

    for (let i = 1; i <= 10; i++) {
      const rOuter = layout.ringRadii[i];
      const rInner = layout.ringRadii[i - 1] || 0;

      // Annular path (donut sector) for exact layer section hover
      const ringSector = d3.arc()
        .innerRadius(rInner)
        .outerRadius(rOuter)
        .startAngle(0)
        .endAngle(2 * Math.PI);

      ringsGroup.append('path')
        .attr('d', ringSector())
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .attr('class', 'ring-area-hover')
        .classed('active-layer', state.selectedRingIndex === i)
        .on('mousemove', (event) => {
          showRingTooltip(event, `Nível ${i}`);
        })
        .on('mouseleave', () => {
          hideRingTooltip();
        })
        .on('click', (event) => {
          event.stopPropagation();
          hideRingTooltip();
          // Toggle selection if clicking the same ring, otherwise select new ring
          state.selectedRingIndex = (state.selectedRingIndex === i) ? null : i;
          state.treeFocusNodeId = null;
          hideDetailPanel();
          updateNodePositions(true);
        });

      // Dashed Ring Boundary Line
      ringsGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', rOuter)
        .attr('class', 'ring-line');
    }
  }

  // 2. RENDER EDGES (Conexões)
  const edgesGroup = g.select('.layer-edges');

  const edgeData = state.arestas.map(e => ({
    ...e,
    id: `${e.origem}->${e.destino}`
  }));

  const edges = edgesGroup.selectAll('.edge-line')
    .data(edgeData, d => d.id);

  edges.exit().remove();

  const edgesEnter = edges.enter()
    .append('line')
    .attr('class', 'edge-line')
    .attr('marker-end', 'url(#arrow)');

  const edgesMerged = edgesEnter.merge(edges);

  edgesMerged.classed('dimmed', d => {
    if (layout.isTreeMode) {
      return !(layout.subgraphNodes.has(d.origem) && layout.subgraphNodes.has(d.destino));
    }
    if (state.selectedRingIndex) {
      const origLayer = normalizeLayer(state.disciplinas.find(x => x.id === d.origem)?.camadasPorProfissao?.[state.selectedProfessionId]);
      const destLayer = normalizeLayer(state.disciplinas.find(x => x.id === d.destino)?.camadasPorProfissao?.[state.selectedProfessionId]);
      return origLayer !== state.selectedRingIndex && destLayer !== state.selectedRingIndex;
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

  // 3. RENDER NODES (Vértices)
  const nodesGroup = g.select('.layer-nodes');

  // Prepare full node array (Center profession + disciplines)
  const profObj = state.profissoes.find(p => p.id === state.selectedProfessionId);
  const centerNode = {
    id: 'CENTER_PROFESSION',
    nome: profObj ? profObj.nome : 'Profissão',
    isCenter: true
  };

  const allNodes = [centerNode, ...state.disciplinas];

  const nodes = nodesGroup.selectAll('.node-group')
    .data(allNodes, d => d.id);

  nodes.exit().remove();

  const nodesEnter = nodes.enter()
    .append('g')
    .attr('class', 'node-group');

  // Node Circle
  nodesEnter.append('circle')
    .attr('class', d => d.isCenter ? 'node-circle center-node' : 'node-circle')
    .attr('r', d => d.isCenter ? 18 : 8);

  const nodesMerged = nodesEnter.merge(nodes);

  // Apply colors to discipline nodes
  nodesMerged.select('circle')
    .attr('fill', d => {
      if (d.isCenter) return 'var(--accent-color)';
      const eixo = d.eixoFormacao || '';
      return EIXO_COLORS[eixo] || EIXO_COLORS.empty;
    });

  // Apply positions with animation
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

  // Dimming non-focused nodes in Tree Mode or Layer Mode
  nodesMerged.classed('dimmed', d => isNodeDimmed(d, layout));

  // Sort node DOM elements so dimmed nodes are placed first (lowest z-index/stacking order)
  nodesGroup.selectAll('.node-group').sort((a, b) => {
    const aDim = isNodeDimmed(a, layout);
    const bDim = isNodeDimmed(b, layout);
    if (aDim && !bDim) return -1;
    if (!aDim && bDim) return 1;
    return 0;
  });

  // 4. RENDER LABELS (Top layer rendered on top of nodes and edges, center node label omitted)
  const labelsGroup = g.select('.layer-labels');
  const labelNodes = state.disciplinas; // Central vertex label is omitted

  const labels = labelsGroup.selectAll('.label-group')
    .data(labelNodes, d => d.id);

  labels.exit().remove();

  const labelsEnter = labels.enter()
    .append('g')
    .attr('class', 'label-group');

  labelsEnter.append('rect')
    .attr('class', 'label-bg');

  labelsEnter.append('text')
    .attr('class', 'node-label')
    .attr('dy', 22)
    .attr('text-anchor', 'middle')
    .text(d => d.nome);

  const labelsMerged = labelsEnter.merge(labels);

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

  // Calculate background rect dimensions for all labels
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
        // Fallback for DOM ready
      }
    }
  });

  labelsMerged.classed('dimmed', d => isNodeDimmed(d, layout));

  // Interaction Events
  nodesMerged
    .on('mouseenter', (event, d) => {
      if (d.isCenter) {
        showRingTooltip(event, `${d.nome} (Clique para alterar profissão)`);
        return;
      }
      if (isNodeDimmed(d, layout)) return;
      state.hoveredNodeId = d.id;
      updateLabelsVisibility();
      highlightConnections(d.id);
    })
    .on('mouseleave', (event, d) => {
      if (d.isCenter) {
        hideRingTooltip();
        return;
      }
      if (isNodeDimmed(d, layout)) return;
      state.hoveredNodeId = null;
      updateLabelsVisibility();
      resetEdgeHighlights();
    })
    .on('click', (event, d) => {
      event.stopPropagation();
      if (d.isCenter) {
        hideRingTooltip();
        showProfessionModal();
        return;
      }
      if (isNodeDimmed(d, layout)) return;

      state.treeFocusNodeId = d.id;
      showDetailPanel(d);
      updateNodePositions(true);
    });

  updateGraphVisibility();
  updateLabelsVisibility();
}

// Filter Visibility according to Eixo and Natureza Checkboxes
function updateGraphVisibility() {
  const g = state.containerGroup;
  if (!g) return;

  g.selectAll('.node-group').each(function (d) {
    if (d.isCenter) return;
    const eixo = d.eixoFormacao || "";
    const natureza = d.natureza || "";
    const isVisible = state.activeEixosFilters.has(eixo) && state.activeNaturezaFilters.has(natureza);
    d3.select(this).style('display', isVisible ? 'block' : 'none');
  });

  g.selectAll('.label-group').each(function (d) {
    const eixo = d.eixoFormacao || "";
    const natureza = d.natureza || "";
    const isVisible = state.activeEixosFilters.has(eixo) && state.activeNaturezaFilters.has(natureza);
    d3.select(this).style('display', isVisible ? 'block' : 'none');
  });

  g.selectAll('.edge-line').each(function (d) {
    const orig = state.disciplinas.find(x => x.id === d.origem);
    const dest = state.disciplinas.find(x => x.id === d.destino);
    const origVisible = orig && state.activeEixosFilters.has(orig.eixoFormacao || "") && state.activeNaturezaFilters.has(orig.natureza || "");
    const destVisible = dest && state.activeEixosFilters.has(dest.eixoFormacao || "") && state.activeNaturezaFilters.has(dest.natureza || "");
    d3.select(this).style('display', (origVisible && destVisible) ? 'block' : 'none');
  });
}

// Strict Label Visibility Controller according to planning.md UX requirements:
// - ALL labels hidden by default
// - Hover on node exposes node label
// - Hover on radial ring area exposes labels of nodes in that layer
// - Tree view mode shows labels of focused tree nodes
// - Never show all labels at once
function updateLabelsVisibility() {
  const g = state.containerGroup;
  if (!g) return;

  const layout = computeLayout();

  g.selectAll('.label-group').each(function (d) {
    let isVisible = false;

    // Check if the node is currently dimmed (out of focus)
    let isDimmed = isNodeDimmed(d, layout);

    // Only allow label to be visible if node is not dimmed
    if (!isDimmed) {
      if (layout.isTreeMode && layout.subgraphNodes.has(d.id)) {
        isVisible = true;
      } else if (state.hoveredNodeId === d.id) {
        isVisible = true;
      } else if (state.selectedRingIndex !== null) {
        const rawLayer = d.camadasPorProfissao?.[state.selectedProfessionId] || 10;
        const layer = normalizeLayer(rawLayer);
        if (layer === state.selectedRingIndex) {
          isVisible = true;
        }
      }
    }

    const group = d3.select(this);
    group.classed('visible', isVisible);
    if (isVisible && state.hoveredNodeId === d.id) {
      group.raise();
    }
  });
}

// Highlight Connections on Node Hover
function highlightConnections(nodeId) {
  const g = state.containerGroup;
  g.selectAll('.edge-line')
    .classed('highlighted', d => d.origem === nodeId || d.destino === nodeId)
    .attr('marker-end', d => (d.origem === nodeId || d.destino === nodeId) ? 'url(#arrow-active)' : 'url(#arrow)');
}

function resetEdgeHighlights() {
  const g = state.containerGroup;
  g.selectAll('.edge-line')
    .classed('highlighted', false)
    .attr('marker-end', 'url(#arrow)');
}

// Side Detail Panel
function showDetailPanel(d) {
  const panel = document.getElementById('detail-panel');
  document.getElementById('discipline-code').textContent = d.codigo || d.id;
  document.getElementById('discipline-name').textContent = d.nome;
  document.getElementById('discipline-period').textContent = d.periodo || 'N/A';

  const eixoName = state.eixosFormacao[d.eixoFormacao] || d.eixoFormacao || 'Outros';
  document.getElementById('discipline-eixo').textContent = eixoName;
  document.getElementById('discipline-natureza').textContent = d.natureza || 'N/A';
  document.getElementById('discipline-metodologia').textContent = d.abordagemMetodologica || 'N/A';

  const ch = d.cargaHoraria || {};
  document.getElementById('discipline-ch').textContent = ch.total || 0;
  document.getElementById('ch-teorica').textContent = ch.teorica || 0;
  document.getElementById('ch-pratica').textContent = ch.pratica || 0;

  document.getElementById('discipline-ementa').textContent = d.ementa || 'Nenhuma ementa cadastrada.';
  document.getElementById('discipline-objetivos').textContent = d.objetivos || 'Nenhum objetivo cadastrado.';
  document.getElementById('discipline-bib-basica').textContent = d.bibliografiaBasica || 'Nenhuma bibliografia cadastrada.';
  document.getElementById('discipline-bib-comp').textContent = d.bibliografiaComplementar || 'Nenhuma bibliografia cadastrada.';

  panel.classList.remove('hidden');
}

function hideDetailPanel() {
  document.getElementById('detail-panel').classList.add('hidden');
}

// Ring Hover Tooltip (Follows cursor on ring hover in any situation)
function showRingTooltip(event, text) {
  let tooltip = document.getElementById('ring-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'ring-tooltip';
    tooltip.className = 'ring-tooltip';
    document.getElementById('graph-container').appendChild(tooltip);
  }

  const container = document.getElementById('graph-container').getBoundingClientRect();
  const x = event.clientX - container.left + 14;
  const y = event.clientY - container.top + 14;

  tooltip.textContent = text;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.classList.add('visible');
}

function hideRingTooltip() {
  const tooltip = document.getElementById('ring-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
  }
}

// Start Application on DOM Load
document.addEventListener('DOMContentLoaded', loadData);
