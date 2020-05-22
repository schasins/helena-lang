export declare namespace MainpanelNode {
    interface Interface {
        text?: string;
        textContent?: string;
        link?: string;
        xpath?: string;
        value?: string;
        frame?: number;
        source_url?: string;
        top_frame_source_url?: string;
        date?: number;
        linkScraping?: boolean;
        scraped_attribute?: string;
    }
    /**
     * Get a {@link MainpanelNode.Interface} from a DOM node.
     * @param node DOM node
     */
    function fromDOMNode(node: Node | null): Interface;
    /**
     * Given a DOM node, get the relevant text for Helena purposes.
     * @param node the node
     * @param recurse whether we should recurse or not
     */
    function getNodeText(node: Node, recurse?: boolean): string;
    /**
     * Converts {@link HTMLElement}s in a relation into {@link MainpanelNode}s.
     * @param relation the relation of elements
     */
    function convertRelation(relation: (HTMLElement | null)[][]): Interface[][];
}
