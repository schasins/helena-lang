/// <reference types="jquery" />
/// <reference types="jqueryui" />
/**
 * Extend Element to allow tooltips to be attached.
 */
interface TooltipAdded {
    scrapingTooltip?: ScrapingTooltip;
}
/**
 * Tooltip for giving user feedback about the element they're hovering over.
 */
export declare class ScrapingTooltip {
    static DEFAULT_TOOLTIP_COLOR: string;
    tooltipElement: JQuery<HTMLElement>;
    /**
     * Create a tooltip for giving user feedback about the element.
     * @param element element to create tooltip for
     * @param tooltipColor color of tooltip
     */
    constructor(element: HTMLElement, tooltipColor?: string);
    /**
     * Remove this ScrapingTooltip from the element it is attached to.
     */
    destroy(): void;
    /**
     * Remove scraping tooltip from the element.
     */
    static destroy(element: HTMLElement & TooltipAdded): void;
}
export {};
