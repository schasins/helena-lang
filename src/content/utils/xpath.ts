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
    let ancestor_nodes = getNodes(
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
      let suffixNodes = getNodes(suffixXPath);
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
      let siblingNodes = getNodes(OldXPathList.xPathToString(elXPath));
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

  /**
   * Get DOM nodes matching the XPath expression on the current document.
   * @param xpath XPath expression
   */
  export function getNodes(xpath: string) {
    // a special case for events that happen on document
    if (xpath === "document") {
      return [document];
    }
    try {
      let lowerCaseXpath = xpath.toLowerCase();
      if (lowerCaseXpath.indexOf("/svg") > -1){
        // ok, have to mess around with the prefixes for the svg components
        let components = lowerCaseXpath.split("/");
        let foundSvg = false;
        for (let i = 0; i < components.length; i++){
          let c = components[i];
          if (c.startsWith("svg")){
            foundSvg = true;
          }
          if (foundSvg){
            components[i] = "svg:" + c;
          }
        }
        xpath = components.join("/");
      }
  
      let q = document.evaluate(xpath, document, (prefix: string) => { 
          if (prefix === 'svg') {
            return 'http://www.w3.org/2000/svg';
          }
          else {
            return null; // the default namespace
          }
        }, XPathResult.ANY_TYPE, null);
      let results = [];
  
      let next = q.iterateNext();
      while (next) {
        results.push(next);
        next = q.iterateNext();
      }
      return results;
    } catch (e) {
      console.error('xPath throws error when evaluated:', xpath);
    }
    return [];
  }

  /**
   * Returns the first {@link HTMLElement} corresponding to each supplied XPath
   *   expression.
   * @param xpaths XPath expressions
   */
  export function getFirstElementOfEach(xpaths: string[]) {
    if (!xpaths || xpaths.length === 0){
      console.warn("No xpaths supplied.");
      return [];
    }
    let elements = [];
    for (const xpath of xpaths) {
      let element = XPath.getNodes(xpath)[0];
      if (!element) {
        // todo: this may not be the right thing to do!
        // for now we're assuming that if we can't find a node at this xpath,
        //   it's because we jumbled in the nodes from a different page into the
        //   relation for this page (becuase no updat to url or something); but
        //   it may just mean that this page changed super super quickly, since
        //   the recording
        continue;
      }
      elements.push(<HTMLElement> element);
    }
    return elements;
  }
}