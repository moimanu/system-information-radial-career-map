import { getSubgraphNodes, computeTreeLevels, simpleHash } from '../domain/GraphQueries.js';
import { normalizeLayer } from '../domain/LayerNormalizer.js';

/**
 * TreeLayout - Strategy for calculating positions in hierarchical tree focus layout mode.
 */
export class TreeLayout {
  calculate(store) {
    const {
      width,
      height,
      treeFocusNodeId,
      selectedProfessionId,
      disciplinas,
      arestas,
      selectedRingIndex
    } = store.state;

    const centerX = width / 2;
    const centerY = height / 2;

    const maxRadius = 500;
    const baseStep = maxRadius / 10;
    const ringRadii = [];
    const targetR10 = maxRadius;

    for (let i = 1; i <= 10; i++) {
      if (selectedRingIndex && !treeFocusNodeId) {
        if (i === selectedRingIndex) {
          ringRadii[i] = targetR10;
        } else if (i < selectedRingIndex) {
          ringRadii[i] = (targetR10 / selectedRingIndex) * i;
        } else {
          ringRadii[i] = targetR10;
        }
      } else {
        ringRadii[i] = baseStep * i;
      }
    }

    const subgraphNodes = getSubgraphNodes(treeFocusNodeId, arestas);
    const levels = computeTreeLevels(treeFocusNodeId, subgraphNodes, arestas);

    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    const totalLevels = levelKeys.length;
    const levelHeight = Math.min(100, (height - 160) / Math.max(1, totalLevels));
    const startY = 80;

    const nodePositions = {};

    levelKeys.forEach((lvl, lvlIdx) => {
      const nodesInLvl = levels[lvl];
      const count = nodesInLvl.length;
      const y = startY + lvlIdx * levelHeight;

      nodesInLvl.forEach((nodeId, idx) => {
        const x = (width / (count + 1)) * (idx + 1);
        nodePositions[nodeId] = { x, y, isFocused: true };
      });
    });

    disciplinas.forEach(d => {
      if (!nodePositions[d.id]) {
        const rawLayer = d.camadasPorProfissao?.[selectedProfessionId] || 10;
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

    nodePositions['CENTER_PROFESSION'] = { x: centerX, y: 35, isFocused: false };

    return { ringRadii, nodePositions, isTreeMode: true, subgraphNodes };
  }
}
