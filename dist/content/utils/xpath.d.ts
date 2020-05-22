export declare namespace XPath {
    interface XPathNode {
        nodeName: string;
        index: string;
        iterable: boolean;
    }
    type XPathList = Array<XPathNode>;
    class SuffixXPathList extends Array<XPathNode> {
        selectorIndex?: number;
        suffixRepresentation?: SuffixXPathList;
    }
    /**
     * Find the common ancestor of multiple elements.
     * @param elements elements
     */
    function findCommonAncestor(elements: (HTMLElement | null)[]): HTMLElement;
    /**
     * Finds a sibling of a descendant of given element matching suffixes.
     * @param element element
     * @param suffixes list of {@link SuffixXPathList}s
     */
    function findDescendantSiblingMatchingSuffixes(element: HTMLElement, suffixes: (SuffixXPathList[] | undefined)[]): HTMLElement | null;
    /**
     * Get the suffix of the descendant with respect to the ancestor.
     * @param ancestor ancestor node
     * @param descendant descendant node
     */
    function suffixFromAncestor(ancestor: Node, descendant: Node): XPathNode[];
    /**
     * Convert a DOM node to an XPath expression representing the path from the
     *   document element.
     * @param node the DOM node
     */
    function fromNode(node?: Node | null): string;
    /**
     * Get DOM nodes matching the XPath expression on the current document.
     * @param xpath XPath expression
     */
    function getNodes(xpath: string): Node[];
    /**
     * Returns the first {@link HTMLElement} corresponding to each supplied XPath
     *   expression.
     * @param xpaths XPath expressions
     */
    function getFirstElementOfEach(xpaths: string[]): HTMLElement[];
    /**
     * Convert an XPath expression string to a list of {@link XPathNode}s.
     * @param xpath XPath expression
     */
    function toXPathNodeList(xpath: string): XPathNode[];
    /**
     * Check if `toCheck` is matchable by the {@link XPathList} `withIterables`
     *   which contains iterables/wildcards.
     * @param withIterables the list with iterables (i.e. generalized version)
     * @param toCheck the specific xpath to check
     * @returns true if matches, false otherwise
     */
    function matches(withIterables: XPathList, toCheck: XPathList): boolean;
    /**
     * Merge multiple {@link XPathList}s with overlapping sections using the
     *   `iterable` key in the XPathNode. This is equivalent to a wildcard
     *   in a XPath expression.
     * @param withIterables the list with iterables (i.e. merged version)
     * @param toMerge the xpath to merge in
     * @returns true if successful, false if cannot be merged
     */
    function merge(withIterables: XPathList, toMerge: XPathList): boolean;
    /**
     * "Shrink" a list of {@link XPathList}s by merging them into the smallest
     *   possible set.
     * @param listOfXPathLists list of {@link XPathList}s
     */
    function condenseList(listOfXPathLists: XPathList[]): XPathList[];
    /**
     * Return the string representation of the {@link XPathList}.
     * @param xPathList the XPath list
     */
    function toString(xPathList: XPathList): string;
}
