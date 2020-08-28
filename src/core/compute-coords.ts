// a partir de uma adjList, determina a melhores coordenadas (x,y) de cada nó
import { Point, TreeNode, AdjList } from '../types'

export function computeCoords(adjList: AdjList, rootId = 0) {
  const rawCoords: Point[] = Array(adjList.length).fill([-1, -1])
  const rawTopLeft: Point = [0, 0]
  const rawBottomRight: Point = [0, 0]

  if (adjList.length > 0) {
    const root: TreeNode = {
      id: rootId,
      parent: null,
      children: [],
      x: 0,
      y: 0,
      mod: 0,
    }

    initNodes(root) // constroi o objeto root a partir da adjList
    firstTraversal(root) // post-order traversal
    lastTraversal(root) // pre-order traversal
  }

  return { rawCoords, rawTopLeft, rawBottomRight }

  /**/

  function initNodes(node: TreeNode, nodeId = rootId, nodeDepth = 0) {
    // for each child of node
    for (const { v: childId } of adjList[nodeId]) {
      const child = {
        id: childId,
        parent: node,
        x: 0,
        y: nodeDepth + 1,
        mod: 0,
        children: [],
      }
      node.children.push(child)
      initNodes(child, childId, nodeDepth + 1)
    }
  }

  function firstTraversal(node: TreeNode): TreeNode {
    if (node.children.length === 0) return node
    if (node.children.length === 1) {
      node.x = firstTraversal(node.children[0]).x
      return node
    }

    let prevX: number | null = null

    // para cada par de subárvores filhas left e right
    for (let i = 1; i < node.children.length; i++) {
      const left = firstTraversal(node.children[i - 1])
      const right = firstTraversal(node.children[i])
      // post-order traversal below

      if (prevX !== null) left.x = prevX

      // console.log('before shift:', left.id, right.id, left.x, right.x)
      shiftRightSubtree(left, right)
      // console.log('after shift:', left.id, right.id, left.x, right.x)

      prevX = right.x
    }

    // centraliza node entre seus filhos
    const qtyChilds = node.children.length
    const leftMostX = node.children[0].x
    const rightMostX = node.children[qtyChilds - 1].x
    node.x =
      qtyChilds % 2 === 0
        ? (leftMostX + rightMostX) / 2
        : node.children[(qtyChilds - 1) / 2].x

    return node
  }

  // atualiza o x real dos nós e constroi o retorno
  function lastTraversal(node: TreeNode, accMod = 0) {
    node.x += accMod
    // console.log(node.id, node.x, node.y)

    rawCoords[node.id] = [node.x, node.y]
    rawBottomRight[0] = Math.max(rawBottomRight[0], node.x)
    rawBottomRight[1] = Math.max(rawBottomRight[1], node.y)

    for (const child of node.children) lastTraversal(child, accMod + node.mod)
  }
}

// desloca toda a subárvore enraizada por right para o mais próximo possível da subárvora enraizada por left de forma que não haja conflitos
function shiftRightSubtree(left: TreeNode, right: TreeNode) {
  let { li, ri, lo, ro, offset, loffset, roffset } = contour(left, right)

  right.x += offset
  right.mod += offset

  if (right.children.length > 0) roffset += offset

  // se as subárvores left e right tem alturas diferentes, linka a thread
  if (ri && !li) {
    lo.thread = ri
    lo.mod = roffset - loffset
  } else if (li && !ri) {
    ro.thread = li
    ro.mod = loffset - roffset
  }
}

// retorna os contornos das sub-árvores left e tree
function contour(
  left: TreeNode,
  right: TreeNode,
  maxOffset?: number,
  loffset = 0,
  roffset = 0,
  leftOuter?: TreeNode,
  rightOuter?: TreeNode
): {
  li: TreeNode
  ri: TreeNode
  lo: TreeNode
  ro: TreeNode
  offset: number
  loffset: number
  roffset: number
} {
  const delta = left.x + loffset - (right.x + roffset) + 1
  maxOffset = Math.max(maxOffset || delta, delta)

  if (!leftOuter) leftOuter = left
  if (!rightOuter) rightOuter = right

  const lo = nextLeft(leftOuter) // left outer
  const li = nextRight(left) // left inner?
  const ri = nextLeft(right) // right inner?
  const ro = nextRight(rightOuter) // right outer

  if (li && ri) {
    loffset += left.mod
    roffset += right.mod
    return contour(li, ri, maxOffset, loffset, roffset, lo, ro)
  }

  return {
    li,
    ri,
    lo: leftOuter,
    ro: rightOuter,
    offset: maxOffset,
    loffset,
    roffset,
  }
}

// retorna o próximo nó depois de node no contorno
function nextRight(node: TreeNode) {
  return node.thread || node.children[node.children.length - 1] || null
}
function nextLeft(node: TreeNode) {
  return node.thread || node.children[0] || null
}
