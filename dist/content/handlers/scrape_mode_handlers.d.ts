import { MainpanelNode } from "../../common/mainpanel_node";
import { DOMRingerEvent } from "../../ringer-record-replay/common/event";
/**
 * Handlers during "scrape mode" when scraping is activated (e.g. when the Alt
 *   button is pressed down).
 */
export declare namespace ScrapeModeHandlers {
    /**
     * Send scraped data to the mainpanel for visualization. This line must run
     *   after the Ringer content script runs so that the
     *   additional_recording_handlers object exists.
     */
    function sendScrapedDataToMainpanel(node: Node, ev: DOMRingerEvent): MainpanelNode.Interface;
    /**
     * Updates {@link HelenaContent.mostRecentMousemoveTarget} on mousemove.
     * @param event mousemove event
     */
    function updateMousemoveTarget(event: Event): void;
    /**
     * Highlights element that triggered a mousein event.
     * @param event mousein event
     */
    function highlightMouseinElement(event: Event): void;
    /**
     * Clears highlight on mouseout.
     * @param event mouseout event
     */
    function unhighlightMouseoutElement(event: Event): void;
    /**
     * Prevents click from propagating such that links won't be followed, etc.
     * @param event click event
     */
    function preventClickPropagation(event: Event): void;
}
