/// <reference types="jquery" />
/// <reference types="jqueryui" />
import { RelationSelector } from "../selector/relation_selector";
export interface KnownRelation {
    selectorObj: RelationSelector;
    nodes: (HTMLElement | null)[];
    relationOutput: (HTMLElement | null)[][];
    highlighted: boolean;
    highlightNodesTime?: number;
    highlightNodes?: JQuery<HTMLElement>[];
}
/**
 * Highlight relations that can be found on the page on hover.
 */
export declare class RelationHighlighter {
    currentlyHighlighted: JQuery<HTMLElement>[];
    highlightColors: string[];
    knownRelations: KnownRelation[];
    constructor();
    clearCurrentlyHighlighted(): void;
    /**
     * Retrieve known relations from the server.
     */
    getKnownRelations(): void;
    /**
     * Massage and reformat server response about known relations.
     * @param resp server response
     */
    private preprocessKnownRelations;
    /**
     * Given an element, find most relevant relation and highlight.
     * @param element element to highlight
     */
    highlightRelevantRelation(element: HTMLElement): void;
    /**
     * Highlight the relation.
     * @param relation elements in relation
     * @param display whether to show highlight nodes or not
     * @param pointerEvents whether to enable or disable CSS pointer-events on
     *   highlight nodes
     * @returns highlighted nodes
     */
    highlightRelation(relation: (HTMLElement | null)[][], display: boolean, pointerEvents: boolean): JQuery<HTMLElement>[];
    /**
     * Unhighlight the relation.
     */
    unhighlight(): void;
}
