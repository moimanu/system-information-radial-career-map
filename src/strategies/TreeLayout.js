import { getSubgraphNodes, computeTreeLevels, simpleHash } from '../domain/GraphQueries.js';
import { normalizeLayer } from '../domain/LayerNormalizer.js';

/**
 * TreeLayout - Estratégia para cálculo de posições no modo de visualização em árvore (Tree Focus).
 * Refatorado para espaçar dinamicamente os vértices e permitir a leitura dos rótulos mesmo em níveis com muitos filhos.
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

    for (let i = 1; i <= 10; i++) {
      ringRadii[i] = baseStep * i;
    }

    const subgraphNodes = getSubgraphNodes(treeFocusNodeId, arestas);
    const levels = computeTreeLevels(treeFocusNodeId, subgraphNodes, arestas);
    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    const totalLevels = levelKeys.length;
    const minLevelHeight = 140;
    const levelHeight = Math.max(minLevelHeight, (height - 200) / Math.max(1, totalLevels - 1 || 1));
    const totalTreeHeight = (totalLevels - 1) * levelHeight;
    const startY = Math.max(120, centerY - totalTreeHeight / 2);
    const nodePositions = {};
    const parentMap = {};

    arestas.forEach(edge => {
      if (subgraphNodes.has(edge.origem) && subgraphNodes.has(edge.destino)) {
        if (!parentMap[edge.destino]) parentMap[edge.destino] = [];
        parentMap[edge.destino].push(edge.origem);
      }
    });

    const minNodeSpacing = 190;

    levelKeys.forEach((lvl, lvlIdx) => {
      const nodesInLvl = levels[lvl];

      if (lvlIdx > 0) {
        nodesInLvl.sort((a, b) => {
          const parentsA = parentMap[a] || [];
          const parentsB = parentMap[b] || [];
          const avgXA = parentsA.length > 0
            ? parentsA.reduce((acc, pId) => acc + (nodePositions[pId]?.x || centerX), 0) / parentsA.length
            : centerX;
          const avgXB = parentsB.length > 0
            ? parentsB.reduce((acc, pId) => acc + (nodePositions[pId]?.x || centerX), 0) / parentsB.length
            : centerX;
          return avgXA - avgXB;
        });
      }

      const count = nodesInLvl.length;
      const y = startY + lvlIdx * levelHeight;

      const requiredWidth = count * minNodeSpacing;
      const effectiveWidth = Math.max(width - 160, requiredWidth);

      const stepX = effectiveWidth / (count + 1);
      const startX = centerX - effectiveWidth / 2;

      nodesInLvl.forEach((nodeId, idx) => {
        const x = startX + stepX * (idx + 1);
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

    return { ringRadii, nodePositions, isTreeMode: true, isLayerMode: false, subgraphNodes };
  }
}