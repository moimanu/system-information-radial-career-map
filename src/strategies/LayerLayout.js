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
    const subgraphNodes = new Set(layerNodes.map(d => d.id));
    const baseRadius = 220;
    const requiredRadiusForSpacing = N > 0 ? (N * 160) / (2 * Math.PI) : baseRadius;
    const layerRadius = Math.max(baseRadius, requiredRadiusForSpacing);
    const nodePositions = {};

    nodePositions['LAYER_CENTER_NODE'] = {
      x: centerX,
      y: centerY,
      layerName: `Nível ${selectedRingIndex}`
    };

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