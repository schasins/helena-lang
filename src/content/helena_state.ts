import { RecordingHandlers } from "./recording_UI";
import { TabDetailsMessageContent, WindowsMessageContent,
  WindowIdMessageContent } from "../common/messages";

/**
 * Stores Helena's global state variables for the content scripts.
 */
export class HelenaState {
  /** 
   * Whether scraping is enabled/disabled.
   */
  scrapingMode: boolean;

  /**
   * Information about the Tab in which the content script is running.
   */
  tabId?: number;
  windowId?: number;
  tabTopUrl?: string;

  /**
   * Keep track of the last Element the user was hovering over so that it can be
   *   highlighted when the user enters scraping mode.
   */
  mostRecentMousemoveTarget?: EventTarget | null;

  /**
   * Highlighted element when in scraping mode.
   */
  highlightedElement?: JQuery<HTMLElement>;

  // Record + Replay state
  currentRecordingWindows?: number[];
  currentReplayWindowId?: number;

  public currentlyRecording() {
    // `recording` is defined in scripts/lib/record-replay/content_script.js,
    //   tells whether r+r layer currently recording
    // TODO: cjbaik: move `recording` to this class
    return window.recording === RecordState.RECORDING
      && this.windowId && this.currentRecordingWindows
      && this.currentRecordingWindows.indexOf(this.windowId) > -1;
  }

  /**
   * Returns true if currently scraping (e.g. Alt key held down).
   */
  public currentlyScraping() {
    return this.scrapingMode;
  }

  /**
   * Activates Helena's scraping mode.
   */
  public activateScrapingMode() {
    this.scrapingMode = true;

    // TODO: cjbaik: these only exist to enable the `scrape` handler and filter
    //   to be called. If the handler/filter are moved elsewhere, no need for it
    window.additional_recording_handlers_on.scrape = true;
    window.additional_recording_filters_on.scrape = true;
  }

  /**
   * Disables Helena's scraping mode.
   */
  public disableScrapingMode() {
    this.scrapingMode = false;

    // TODO: cjbaik: these only exist to enable the `scrape` handler and filter
    //   to be called. If the handler/filter are moved elsewhere, no need for it
    window.additional_recording_handlers_on.scrape = false;
    window.additional_recording_filters_on.scrape = false;
  }

  constructor() {
    let self = this;

    self.scrapingMode = false;

    self.listen();

    // TODO: cjbaik: switch this pattern to a port connection rather than
    //   doing this polling
    window.MiscUtilities.repeatUntil(
      function () {
          window.utilities.sendMessage("content", "mainpanel",
              "requestCurrentRecordingWindows", {});
      },
      function () {
          return !!self.currentRecordingWindows;
      },
      function () {},
      1000, true);

    window.MiscUtilities.repeatUntil(
      function () {
          window.utilities.sendMessage("content", "mainpanel",
              "currentReplayWindowId", {});
      },
      function () {
          return !!self.currentReplayWindowId;
      },
      function () {},
      1000, true);
    

    window.MiscUtilities.repeatUntil(
      function() {
          window.utilities.sendMessage("content", "background",
              "requestTabID", {});
      },
      function() {
          return (self.tabId && self.windowId);
      },
      function() {},
      1000, true);
  }

  /**
   * Listen for information from mainpanel messages.
   * [cjbaik: I presume this is because you can't directly get access to this
   *   information from the content script?]
   */
  private listen() {
    let self = this;

    window.utilities.listenForMessage("mainpanel", "content",
      "currentRecordingWindows", function (msg: WindowsMessageContent) {
        self.currentRecordingWindows = msg.window_ids;
    });

    window.utilities.listenForMessage("mainpanel", "content",
      "currentReplayWindowId", function (msg: WindowIdMessageContent) {
        self.currentReplayWindowId = msg.window; 
        RecordingHandlers.applyReplayOverlayIfAppropriate(msg.window);
    });

    window.utilities.listenForMessage("background", "content", "tabID",
      function (msg: TabDetailsMessageContent) {
        self.tabId = msg.tab_id;
        self.windowId = msg.window_id;
        self.tabTopUrl = msg.top_frame_url;
        console.log("tabId info", self.tabId, self.windowId,
            self.tabTopUrl);
      }
    );
  }
}