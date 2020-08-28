export type Point = [number, number] // [x,y]

export type TemplateKeys = 'fibonacci' | 'knapsack' | 'coinChange' | 'fastPower'

export type Variable = { name: string; value: string }
export type FunctionData = {
  params: Variable[]
  body: string
  variables?: Variable[] // variáveis que o escopo da função precisa conseguir acessar
}

// adjList[u]: [{v, w}, ...], sendo u -w-> v
export type AdjList = { v: number; w?: number }[][]
export type EdgeList = { u: number; v: number; w?: number }[]

export type TreeNode = {
  id: number // >= 0
  parent: TreeNode | null
  children: TreeNode[]

  x: number
  y: number
  mod: number // modifier, valor pendente para ser incrementado no x de todos os filhos do nó atual, o que não inclui ele mesmo
  thread?: TreeNode // aponta para o próximo nó do contour
}
