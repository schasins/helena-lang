export namespace XPath {
  export interface XPathNode {
    nodeName?: string;
    index?: string;
    iterable?: boolean;
  }

  export class SuffixXPathList extends Array {
    selectorIndex?: number;
    suffixRepresentation?: XPathNode;
  }

  /**
   * Find the common ancestor of multiple elements.
   * @param elements elements
   */
  export function findCommonAncestor(elements: (HTMLElement | null)[]) {
    if (elements.length === 0) {
      throw new ReferenceError("Cannot get common ancestor of 0 nodes.");
    }

    // this doesn't handle null nodes, so filter those out first
    elements = elements.filter((el) => el && $(el).parents().length);
    let xPathLists = elements.map((node) =>
      OldXPathList.xPathToXPathList(fromNode(node)));
    let firstXPathList = xPathLists[0];
    // TODO: cjbaik eliminate this `var` call; but don't want to mess with logic
    for (var i = 0; i < firstXPathList.length; i++) {
      let all_match = xPathLists.every((curXPathList) =>
        curXPathList[i].nodeName === firstXPathList[i].nodeName &&
        curXPathList[i].index === firstXPathList[i].index &&
        curXPathList[i].iterable === firstXPathList[i].iterable);
      if (!all_match) {
        break;
      }
    }
    let last_matching = i - 1;
    let ancestor_xpath_list = firstXPathList.slice(0, last_matching + 1);
    let ancestor_nodes = xPathToNodes(
      OldXPathList.xPathToString(ancestor_xpath_list));
    return <HTMLElement> ancestor_nodes[0];
  }

  /**
   * Check whether node has at least one descendant matching each suffix.
   * @param node node
   * @param suffixes list of suffixes
   */
  function matchesAllSuffixes(node: Node, suffixes: XPathNode[][]){
    let elXPath = OldXPathList.xPathToXPathList(fromNode(node));
    //check whether this node has an entry for all desired suffixes
    for (const suffix of suffixes) {
      let suffixXPath = OldXPathList.xPathToString(elXPath.concat(suffix));
      let suffixNodes = xPathToNodes(suffixXPath);
      if (suffixNodes.length === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Finds a sibling of a descendant of given element matching suffixes.
   * @param element element
   * @param suffixes list of {@link SuffixXPathList}s
   */
  export function findDescendantSiblingMatchingSuffixes(element: HTMLElement,
    suffixes: SuffixXPathList[]) {
    let elXPath = OldXPathList.xPathToXPathList(fromNode(element));
    
    // start at the end of the xpath, move back towards root
    for (let i = (elXPath.length - 1); i >= 0; i--) {
      let index = parseInt(elXPath[i].index);
      
      elXPath[i].index = index + 1; // modify XPath, try next sibling
      let siblingNodes = xPathToNodes(OldXPathList.xPathToString(elXPath));
      elXPath[i].index = index;     // return index to original value
    
      if (siblingNodes.length > 0) {
        // [cjbaik: I presume it's not possible to have > 1 node here?]
        let siblingNode = siblingNodes[0];
        if (matchesAllSuffixes(siblingNode, suffixes)) {
          return <HTMLElement> siblingNode;
        }
      }
    }
    return null;
  }

  /**
   * Get the suffix of the descendant with respect to the ancestor.
   * @param ancestor ancestor node
   * @param descendant descendant node
   */
  export function suffixFromAncestor(ancestor: Node, descendant: Node):
    XPathNode[] {
    let ancestorList = OldXPathList.xPathToXPathList(fromNode(ancestor));
    let descList = OldXPathList.xPathToXPathList(fromNode(descendant));
    return descList.slice(ancestorList.length, descList.length);
  }

  /**
   * Convert a DOM node to an XPath expression representing the path from the
   *   document element.
   * @param node the DOM node
   */
  export function fromNode(node?: Node | null): string | null {
    // a special case for events that happen on document
    if (node === document){
      return "document";
    }

    if (node === null || node === undefined){
      return null;
    }

    let element = <HTMLElement> node;

    if (element.tagName.toLowerCase() === 'html') {
      return element.tagName;
    }

    // if there is no parent node then this element has been disconnected
    // from the root of the DOM tree
    if (!element.parentElement) {
      return '';
    }

    let ix = 0;
    let siblings = element.parentElement.children;
    for (let i = 0, ii = siblings.length; i < ii; i++) {
      let sibling = siblings[i];
      if (sibling === element) {
        return fromNode(element.parentElement) + '/' + element.tagName +
              '[' + (ix + 1) + ']';
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
    throw new ReferenceError('Child node does not belong to its own parent!');
  }
}