import { normalizeLayer } from '../domain/LayerNormalizer.js';

/**
 * LayerLayout - Strategy for calculating positions when a specific ring/layer is selected.
 * Isolates the selected layer: hides all other layers, sets a central label node (Nível X),
 * calculates dynamic radial spacing for node labels, and creates an orbital connecting ring.
 */
export class LayerLayout {
  calculate(store) {
    const {
      width,
      height,
      selectedRingIndex,
      selectedProfessionId,
      disciplinas,
      activeEixosFilters,
      activeNaturezaFilters
    } = store.state;

    const centerX = width / 2;
    const centerY = height / 2;

    // Filter disciplines belonging strictly to the selected layer and active filters
    const layerNodes = disciplinas.filter(d => {
      const eixo = d.eixoFormacao || "";
      const natureza = d.natureza || "";
      if (activeEixosFilters.has(eixo) && activeNaturezaFilters.has(natureza)) {
        const rawLayer = d.camadasPorProfissao?.[selectedProfessionId] || 10;
        return normalizeLayer(rawLayer) === selectedRingIndex;
      }
      return false;
    });

    const N = layerNodes.length;

    // Subgraph nodes: only the vertices of this specific layer
    const subgraphNodes = new Set(layerNodes.map(d => d.id));

    // Dynamic & responsive radius calculation based on vertex count
    // Ensures enough circumferential arc length (min ~160px per node label)
    const baseRadius = 220;
    const requiredRadiusForSpacing = N > 0 ? (N * 160) / (2 * Math.PI) : baseRadius;
    const layerRadius = Math.max(baseRadius, requiredRadiusForSpacing);

    const nodePositions = {};

    // Center node is strictly the layer level label (e.g., "Nível 3")
    nodePositions['LAYER_CENTER_NODE'] = {
      x: centerX,
      y: centerY,
      layerName: `Nível ${selectedRingIndex}`
    };

    // Calculate angular positions around the central ring
    layerNodes.forEach((d, j) => {
      const angle = (2 * Math.PI * j) / Math.max(1, N) - Math.PI / 2;
      nodePositions[d.id] = {
        x: centerX + layerRadius * Math.cos(angle),
        y: centerY + layerRadius * Math.sin(angle),
        layer: selectedRingIndex,
        angle: angle
      };
    });

    return {
      ringRadii: [layerRadius],
      layerRadius,
      nodePositions,
      isTreeMode: false,
      isLayerMode: true,
      subgraphNodes
    };
  }
}