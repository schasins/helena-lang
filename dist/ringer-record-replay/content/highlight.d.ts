export declare namespace Highlight {
    /**
     * Highlight a node with a green rectangle. Uesd to indicate the target.
     * @param target the node
     * @param time delay after which to unhighlight
     */
    function highlightNode(target: HTMLElement, time: number): string;
    function dehighlightNode(id: string): void;
}
