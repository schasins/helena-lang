/**
 * Handlers for user events on the content side while recording.
 */
export declare namespace RecordingModeHandlers {
    /**
     * Prevents the right-click menu from opening during recording. Important
     *   because interactions with the context menu won't be recorded, and
     *   Helena won't be able to replay them.
     * @param event context menu event
     */
    function preventOpeningContextMenu(event: MouseEvent): void;
    /**
     * Handler for mouseover events.
     * @param event mouseover event
     */
    function mouseoverHandler(event: MouseEvent): void;
    /**
     * Handler for mouseout events.
     * @param event mouseout event
     */
    function mouseoutHandler(event: MouseEvent): void;
    function updateScraping(event: MouseEvent): void;
    function applyReplayOverlayIfAppropriate(replayWindowId: number): void;
}
