const Big = require('big.js')

const TRUST_EDGE = 'trust'

function helper (graph, source, target, visited) {
  if (source === target) {
    return new Big(1)
  }
  if (visited.includes(source)) {
    return new Big(0)
  }
  let newVisited = visited.slice(0) // clone array
  newVisited.push(source)
  const trustClaims = graph.outEdges(source).filter(e => e.name === TRUST_EDGE)
  const doubts = trustClaims.map((claim) => {
    const confidence = new Big(graph.edge(claim.v, claim.w, TRUST_EDGE))
    const fromSuccessor = helper(
      graph,
      claim.w,
      target,
      newVisited
    )
    const throughSuccessor = fromSuccessor.times(confidence)
    return new Big(1).minus(throughSuccessor)
  })
  const totalDoubt = doubts.reduce((acc, cur) => acc.times(cur), new Big(1))
  return new Big(1).minus(totalDoubt)
}

function jacobs (graph, source, target, config) {
  return helper(graph, source, target, [], new Big(config.confidence || 0.5), config.gradient)
}

module.exports = jacobs
