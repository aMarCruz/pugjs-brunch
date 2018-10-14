const hasOwnProperty = Object.hasOwnProperty

/**
 * Performs a deep cloning of an object.
 * @template T
 * @param {T} obj Object to clone
 * @returns {T}
 */
const deepClone = (obj) => {
  if (obj == null || typeof obj != 'object') {
    return obj
  }
  const copy = obj.constructor()
  for (const attr in obj) {
    if (hasOwnProperty.call(attr)) {
      copy[attr] = deepClone(obj[attr])
    }
  }
  return copy
}

module.exports = deepClone
