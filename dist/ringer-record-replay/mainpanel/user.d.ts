/// <reference types="chrome" />
/**
 * The interface for the user to interact with the replayer. Can be used to
 *   directly query the user.
 */
export declare class User {
    activeTab: chrome.tabs.TabActiveInfo | null;
    private log;
    panel: null;
    constructor();
    /**
     * Set which tab the user has selected.
     * @param tabInfo chrome TabActiveInfo
     */
    activatedTab(tabInfo: chrome.tabs.TabActiveInfo): void;
    /**
     * Question posed from the content script
     * @param prompt
     * @param port
     */
    contentScriptQuestion(prompt: string, port: chrome.runtime.Port): void;
    /**
     * Get activated tab.
     */
    /**
     * Query the user.
     * @param prompt Text to show the user
     * @param validation Check whether the answer is as exepcted
     * @param defaultAnswer Answer to use during automated periods
     * @param callback Continuation to pass answer into
     */
    private question;
}
