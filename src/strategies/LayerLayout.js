import { normalizeLayer } from '../domain/LayerNormalizer.js';

/**
 * LayerLayout - Strategy for calculating positions when a specific ring/layer is selected.
 * Displays the subgraph of disciplines belonging to that layer (and their direct edge connections),
 * with dynamic spacing for clear label legibility while keeping all other nodes at their default ring radii.
 */
export class LayerLayout {
  calculate(store) {
    const {
      width,
      height,
      selectedRingIndex,
      selectedProfessionId,
      disciplinas,
      arestas,
      activeEixosFilters,
      activeNaturezaFilters
    } = store.state;

    const centerX = width / 2;
    const centerY = height / 2;

    const maxRadius = 500;
    const baseStep = maxRadius / 10;
    const ringRadii = [];

    // Standard fixed ring radii (no deformation/expansion)
    for (let i = 1; i <= 10; i++) {
      ringRadii[i] = baseStep * i;
    }

    // Group disciplines by normalized layer
    const layerGroups = {};
    for (let i = 1; i <= 10; i++) layerGroups[i] = [];

    disciplinas.forEach(d => {
      const eixo = d.eixoFormacao || "";
      const natureza = d.natureza || "";
      if (activeEixosFilters.has(eixo) && activeNaturezaFilters.has(natureza)) {
        const rawLayer = d.camadasPorProfissao?.[selectedProfessionId] || 10;
        const layer = normalizeLayer(rawLayer);
        layerGroups[layer].push(d);
      }
    });

    // 1. Identify layer nodes for selectedRingIndex
    const layerNodes = layerGroups[selectedRingIndex] || [];

    // 2. Build subgraph: strictly the vertices belonging to selectedRingIndex
    const subgraphNodes = new Set(layerNodes.map(d => d.id));

    // 3. Node positions
    const nodePositions = {};
    nodePositions['CENTER_PROFESSION'] = { x: centerX, y: centerY };

    for (let layer = 1; layer <= 10; layer++) {
      const nodes = layerGroups[layer];
      const N = nodes.length;
      if (N === 0) continue;

      if (layer === selectedRingIndex) {
        // Dynamic & responsive radius calculation for the selected layer
        // Ensures minimum circumferential spacing for node labels
        const baseRadius = ringRadii[layer] || 100;
        const requiredRadiusForSpacing = (N * 150) / (2 * Math.PI);
        const r = Math.max(baseRadius, requiredRadiusForSpacing);

        nodes.forEach((d, j) => {
          const angle = (2 * Math.PI * j) / N - Math.PI / 2;
          nodePositions[d.id] = {
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle),
            layer: layer,
            angle: angle
          };
        });
      } else {
        // Standard orbital placement for non-selected layers
        const r = ringRadii[layer];
        const angularOffset = (layer % 2 === 0 ? 0.3 : 0);

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
    }

    // Fallback for any discipline not in nodePositions
    disciplinas.forEach(d => {
      if (!nodePositions[d.id]) {
        const rawLayer = d.camadasPorProfissao?.[selectedProfessionId] || 10;
        const layer = normalizeLayer(rawLayer);
        const r = ringRadii[layer] || maxRadius;
        nodePositions[d.id] = { x: centerX, y: centerY + r, layer: layer, angle: 0 };
      }
    });

    return {
      ringRadii,
      nodePositions,
      isTreeMode: false,
      isLayerMode: true,
      subgraphNodes
    };
  }
}
