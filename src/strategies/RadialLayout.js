import { normalizeLayer } from '../domain/LayerNormalizer.js';

/**
 * RadialLayout - Strategy for calculating positions in concentric ring layout mode.
 */
export class RadialLayout {
  calculate(store) {
    const {
      width,
      height,
      selectedRingIndex,
      treeFocusNodeId,
      selectedProfessionId,
      disciplinas,
      activeEixosFilters,
      activeNaturezaFilters
    } = store.state;

    const centerX = width / 2;
    const centerY = height / 2;

    const maxRadius = 500;
    const baseStep = maxRadius / 10;
    const ringRadii = [];

    for (let i = 1; i <= 10; i++) {
      ringRadii[i] = baseStep * i;
    }

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

    const nodePositions = {};
    nodePositions['CENTER_PROFESSION'] = { x: centerX, y: centerY };

    for (let layer = 1; layer <= 10; layer++) {
      const nodes = layerGroups[layer];
      const N = nodes.length;
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

    disciplinas.forEach(d => {
      if (!nodePositions[d.id]) {
        const rawLayer = d.camadasPorProfissao?.[selectedProfessionId] || 10;
        const layer = normalizeLayer(rawLayer);
        const r = ringRadii[layer] || maxRadius;
        nodePositions[d.id] = { x: centerX, y: centerY + r, layer: layer, angle: 0 };
      }
    });

    return { ringRadii, nodePositions, isTreeMode: false, isLayerMode: false, subgraphNodes: null };
  }
}
