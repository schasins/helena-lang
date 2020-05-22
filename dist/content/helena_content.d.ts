/// <reference types="jquery" />
/// <reference types="jqueryui" />
import { RelationHighlighter } from "./ui/relation_highlighter";
import { ContentSelector } from "./selector/relation_selector";
/**
 * Stores Helena's global state variables for the content scripts.
 */
export declare class HelenaContent {
    /**
     * Whether scraping is enabled/disabled.
     */
    scrapeMode: boolean;
    /**
     * Information about the Tab in which the content script is running.
     */
    tabId?: number;
    windowId?: number;
    tabTopUrl?: string;
    /**
     * Keep track of the last Element the user was hovering over so that it can be
     *   highlighted when the user enters scrape mode.
     */
    mostRecentMousemoveTarget?: EventTarget | null;
    /**
     * Keep track of keys currently being pressed down as a map from keyCode to
     *   boolean (true means pressed).
     */
    currentlyPressedKeys?: {
        [key: number]: boolean;
    };
    /**
     * Highlighted element when in scrape mode.
     */
    highlightedElement?: JQuery<HTMLElement>;
    /**
     * Record and replay state.
     */
    currentRecordingWindows?: number[];
    currentReplayWindowId?: number;
    currentSelectorToEdit: ContentSelector | null;
    relationHighlighter: RelationHighlighter;
    /**
     * Fast mode: good for speed, bad for evolving webpages.
     */
    ringerUseXpathFastMode: boolean;
    currentlyRecording(): boolean | 0 | undefined;
    /**
     * Returns true if currently scraping (e.g. Alt key held down).
     */
    currentlyScraping(): boolean;
    /**
     * Activates Helena's scrape mode.
     */
    activateScrapeMode(): void;
    /**
     * Disables Helena's scrape mode.
     */
    disableScrapeMode(): void;
    /**
     * Highlights relevant relation to element.
     * @param element element
     */
    highlightRelevantRelation(element: HTMLElement): void;
    /**
     * Unhighlights highlighted relation.
     */
    unhighlightRelation(): void;
    constructor();
    /**
     * Polls mainpanel and background for state, presumably because you can't
     *   directly access this information in content scripts.
     */
    private pollForState;
    /**
     * Initialize hooks for when recording starts.
     */
    private initializeStartRecordingHooks;
    /**
     * Initializes recording mode handlers.
     */
    private initializeRecordingModeHandlers;
    /**
     * Initializes recording mode filters (i.e. things not to record).
     */
    private initializeRecordingModeFilters;
    /**
     * Initializes scrape mode filters (i.e. things not to record).
     */
    private initializeScrapeModeFilters;
    /**
     * Initializes scrape mode (e.g. when Alt button pressed) handlers.
     */
    private initializeScrapeModeHandlers;
    private listenForMainpanelMessages;
}
