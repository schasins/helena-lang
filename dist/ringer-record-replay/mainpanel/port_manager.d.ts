/// <reference types="chrome" />
import { RingerMessage, PortInfo } from "../common/messages";
export interface TabInfo {
    top: PortInfo[];
    frames: PortInfo[];
}
interface SingleTopTabInfo {
    top?: PortInfo;
    frames: PortInfo[];
}
/**
 * Manages mappings between ports, tabs, iframes, etc.
 */
export declare class PortManager {
    private log;
    numPorts: number;
    portIdToPort: {
        [key: string]: chrome.runtime.Port;
    };
    portIdToPortInfo: {
        [key: string]: PortInfo;
    };
    portIdToTabId: {
        [key: string]: number;
    };
    portIdToWindowId: {
        [key: string]: number;
    };
    tabIdToPortIds: {
        [key: number]: string[];
    };
    tabIdToTab: {
        [key: number]: chrome.tabs.Tab;
    };
    tabIdToTabInfo: {
        [key: number]: TabInfo;
    };
    tabIdToWindowId: {
        [key: number]: number;
    };
    constructor();
    /**
     * When a port connects, store its metadata.
     * @param port
     */
    connectPort(port: chrome.runtime.Port): void;
    /**
     * Gets a new id from the content script.
     * @param value
     * @param sender
     */
    getNewId(value: PortInfo, sender: chrome.runtime.MessageSender): string | undefined;
    /**
     * Get a {@link chrome.runtime.Port} given a port id.
     * @param portId
     */
    getPort(portId: string): chrome.runtime.Port;
    /**
     * Get a {@link chrome.tabs.Tab} from the tab id.
     * @param tabId
     */
    getTabFromTabId(tabId: number): chrome.tabs.Tab;
    /**
     * Get tab id given a port id.
     * @param portId
     */
    getTabId(portId: string): number;
    /**
     * Get tab info.
     * @param tabId
     */
    getTabInfo(tabId: number): SingleTopTabInfo | null;
    /**
     * Get window id given a port id.
     * @param portId
     */
    getWindowId(portId: string): number;
    /**
     * Delete information about the port.
     * @param portId
     */
    removePort(portId: string): void;
    /**
     * Delete information about the tab.
     * @param tabId
     */
    removeTab(tabId: number): void;
    /**
     * Delete all information about the tab.
     * @param tabId
     */
    removeTabInfo(tabId: number): void;
    /**
     * Send message to all content scripts.
     * @param message
     */
    sendToAll(message: RingerMessage): void;
    /**
     * Remove tabs that are not currently open.
     * @param openTabs list of currently open tabs.
     */
    updateRemovedTabs(openTabs: chrome.tabs.Tab[]): void;
    /**
     * Update the URL associated with the port.
     * @param port
     * @param url
     */
    updateUrl(port: chrome.runtime.Port, url: string): void;
}
export {};
