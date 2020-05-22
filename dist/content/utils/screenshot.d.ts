import { DOMRingerEvent } from "../../ringer-record-replay/common/event";
interface ScreenshotHTMLElement extends HTMLElement {
    html2canvasDataUrl: string;
    waitingForRender: boolean;
}
/**
 * Handles taking screenshots of nodes.
 */
export declare namespace Screenshot {
    /**
     * Take a screenshot of the referenced element.
     * @param element element
     * @param traceEvent event message
     */
    function take(element: ScreenshotHTMLElement, traceEvent: DOMRingerEvent): string | null | undefined;
}
export {};
