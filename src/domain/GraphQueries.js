/**
 * GraphQueries - Topological graph queries and sub-graph tree level depth calculation.
 */

export function getSubgraphNodes(targetId, arestas) {
  const subgraph = new Set([targetId]);

  function addAncestors(id) {
    arestas.forEach(edge => {
      if (edge.destino === id && !subgraph.has(edge.origem)) {
        subgraph.add(edge.origem);
        addAncestors(edge.origem);
      }
    });
  }

  function addDescendants(id) {
    arestas.forEach(edge => {
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

export function computeTreeLevels(targetId, subgraphSet, arestas) {
  const levels = {};
  const depthMap = { [targetId]: 0 };

  let queue = [targetId];
  while (queue.length > 0) {
    const curr = queue.shift();
    const currDepth = depthMap[curr];

    arestas.forEach(e => {
      if (e.destino === curr && subgraphSet.has(e.origem)) {
        if (depthMap[e.origem] === undefined || depthMap[e.origem] > currDepth - 1) {
          depthMap[e.origem] = currDepth - 1;
          queue.push(e.origem);
        }
      }
    });
  }

  queue = [targetId];
  while (queue.length > 0) {
    const curr = queue.shift();
    const currDepth = depthMap[curr];

    arestas.forEach(e => {
      if (e.origem === curr && subgraphSet.has(e.destino)) {
        if (depthMap[e.destino] === undefined || depthMap[e.destino] < currDepth + 1) {
          depthMap[e.destino] = currDepth + 1;
          queue.push(e.destino);
        }
      }
    });
  }

  Object.entries(depthMap).forEach(([id, depth]) => {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(id);
  });

  return levels;
}

export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
