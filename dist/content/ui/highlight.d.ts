/// <reference types="jquery" />
/// <reference types="jqueryui" />
interface Highlightable {
    highlightElement?: HTMLElement;
}
export declare namespace Highlight {
    function highlightNode(target: HTMLElement, color: string, display?: boolean, pointerEvents?: boolean): JQuery<HTMLElement> | undefined;
    function isHighlight(node: HTMLElement): boolean;
    function getHighlightedElement(node: HTMLElement & Highlightable): HTMLElement | undefined;
    function clearHighlight(highlightNode?: JQuery<HTMLElement>): void;
    function clearAllHighlights(): void;
}
export {};
