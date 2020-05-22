/**
 * DOM events to filter (i.e. ignore) during scrape mode (e.g. when the Alt
 *   button is pressed down).
 */
export declare namespace ScrapeModeFilters {
    /**
     * Filter out extra Ctrl or Alt key events from being recorded, specifically
     *   for Chrome on Windows in which repeated events are fired when key is
     *   held down, whereas it is a single event on Mac.
     */
    function ignoreExtraCtrlAlt(event: KeyboardEvent): boolean;
}
