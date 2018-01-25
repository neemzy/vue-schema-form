/**
 * Finds a form field by its name inside a node
 *
 * @param {Object} node
 * @param {String} fieldName
 *
 * @return {Object|Boolean} Node or false if it wasn't found
 */
export default function findFieldInNode(node, fieldName) {
  if ('children' in node) {
    if (fieldName in node.children) {
      return node.children[fieldName];
    }

    let field;

    Array.from(node.children).some(child => {
      const found = findFieldInNode(child, fieldName);

      if (found) {
        field = found;
      }

      return !!found;
    });

    if (field) {
      return field;
    }
  }

  return false;
}
