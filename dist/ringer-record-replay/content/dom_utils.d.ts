export declare namespace DOMUtils {
    /**
     * Convert a DOM node to a xpath expression representing the path from the
     * document element.
     * @param node
     */
    function nodeToXPath(node: Node): string;
    /**
     * Convert a xpath expression to a set of matching nodes.
     * @param xpath
     */
    function xPathToNodes(xpath: string): Node[];
    /**
     * Convert a xpath expression representing the path from root to a node.
     * @param xpath
     */
    function simpleXPathToNode(xpath: string): Element[] | null;
}
