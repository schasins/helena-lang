export declare namespace MiscUtilities {
    function makeNewRecordReplayWindow(cont: Function, specifiedUrl?: string, winWidth?: number, winHeight?: number): void;
    function depthOf(object: any): number;
    function removeAttributeRecursive(obj: {
        [key: string]: any;
    }, attribute: string): void;
    function repeatUntil(repeatFunction: Function, untilFunction: Function, afterFunction: Function, interval: number, grow?: boolean): void;
    /**
     * Get the current, most up-to-date response from a message sent from the
     *   mainpanel to content script, to avoid having a backlog of repeated
     *   messages sent.
     * Caveat: If anything changes about the message, this is a bad way to handle
     *   it; e.g. if we have a counter in the message saying how many times it's
     *   been sent.
     * @param message message to send
     * @param handler handler for response
     */
    function registerCurrentResponseRequested(message: object, handler: Function): void;
    function dirtyDeepcopy(obj: object): any;
    function urlMatch(text: string, currentUrl: string): boolean;
}
