import css from './stylesheet.css'
import cytoscape from 'cytoscape'

const cy = cytoscape({
  container: document.getElementById('sigma-container'),
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#ffffff'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ceefff'
      }
    }
  ],
});

let eles = null
let id = 0
const getId = (x) => id + '-' + x
document.getElementById('input').addEventListener('keyup', function () {
  const matrix = decodeGraph6(this.value)
  if (eles)
    cy.remove(eles)
  eles = []
  id++

  // Add nodes
  for (let i = 0; i < matrix.length; i++) {
    eles.push({
      'data': {
        'id': getId(i),
      },
      'group': 'nodes'
    })
  }

  // Add edges
  for (let i = 0; i < matrix.length - 1; i++)
    for (let j = i + 1; j < matrix.length; j++)
      if (matrix[i][j])
        eles.push({
          'data': {
            'id': getId(i + '-' + j),
            'source': getId(i),
            'target': getId(j),
          },
          'group': 'edges'
        })


  eles = cy.add(eles);
  cy.layout({
    name: 'cose'
  }).run()
});

// http://users.cecs.anu.edu.au/~bdm/data/formats.txt
const decodeGraph6 = (input) => {
  input = input || ''

  // Adjacency matrix width
  // TODO: support n > 62
  // If 0 <= n <= 62, define N(n) to be the single byte n+63.
  // If 63 <= n <= 258047, define N(n) to be the four bytes
  //   126 R(x), where x is the bigendian 18-bit binary form of n.
  // If 258048 <= n <= 68719476735, define N(n) to be the eight bytes
  //   126 126 R(x), where x is the bigendian 36-bit binary form of n.
  if (input.length >= Math.round(63 * 62 / 2 / 6 + 1)) {
    alert("The input graph is too large. Sorry!")
    return
  }
  let width = input.charCodeAt(0) - 63
  const binVectorLength = width * (width - 1) / 2

  // Create binary vector of the adjacency matrix
  const binVector = input.split('').slice(1).map(char => {
    const charCode = char.charCodeAt(0) - 63
    // Big endian
    return Array.from({ length: 6 }, (v, k) => (charCode & 2 ** (5 - k)) !== 0);
  }).reduce((acc, x) => acc.concat(x), [])

  // Create adjacency matrix
  const matrix = Array.from({ length: width },
    () => Array.from({ length: width }, () => false));
  let i = 0, row = 0, col = 1
  while (i < binVectorLength) {
    matrix[row][col] = binVector[i++]
    row = (row + 1) % col
    col += row === 0
  }

  return matrix
}