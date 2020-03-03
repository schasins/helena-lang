import { EventMessage } from "../utils/event";

/**********************************************************************
 * Handle scraping interaction
 **********************************************************************/

// TODO: cjbaik: move this to `node_rep.js` after that is converted to TS.
interface MainpanelNodeRep {
  text: string;
  textContent: string;
  link: string;
  xpath: string;
  value: string;
  frame: string | null;
  source_url: string;
  top_frame_source_url: string;
  date: number;
  linkScraping?: boolean;
}

export namespace ScrapeModeHandlers {
  /**
   * Send scraped data to the mainpanel for visualization. This line must run
   *   after the Ringer content script runs so that the
   *   additional_recording_handlers object exists.
   */
  export function sendScrapedDataToMainpanel(node: Node,
    eventMessage: EventMessage) {
    let data: MainpanelNodeRep = NodeRep.nodeToMainpanelNodeRepresentation(node,
      window.helenaContent.tabTopUrl);
    // convention is SHIFT means we want to scrape the link, not the text 
    let linkScraping = eventMessage.data.shiftKey || eventMessage.data.metaKey;
    data.linkScraping = linkScraping;
    if (eventMessage.data.type === "click") {
      utilities.sendMessage("content", "mainpanel", "scrapedData", data);
    } // send it to the mainpanel for visualization
    return data;
  };

  /**
   * Updates {@link HelenaContent.mostRecentMousemoveTarget} on mousemove.
   * @param event mousemove event
   */
  export function updateMousemoveTarget(event: Event) {
    window.helenaContent.mostRecentMousemoveTarget = event.target;
  }

  /**
   * Highlights element that triggered a mousein event.
   * @param event mousein event
   */
  export function highlightMouseinElement(event: Event) {
    if (!window.helenaContent.currentlyRecording()) {
      // don't want to run this visualization stuff if we're in replay mode
      //   rather than recording mode, even though of course we're recording
      //   during replay
      return;
    }
    Highlight.clearHighlight(window.helenaContent.highlightedElement);
    window.helenaContent.highlightedElement = Highlight.highlightNode(
      MiscUtilities.targetFromEvent(event), "#E04343", true, false);
  }

  /**
   * Clears highlight on mouseout.
   * @param event mouseout event
   */
  export function unhighlightMouseoutElement(event: Event) {
    Highlight.clearHighlight(window.helenaContent.highlightedElement);
  }

  /**
   * Prevents click from propagating such that links won't be followed, etc.
   * @param event click event
   */
  export function preventClickPropagation(event: Event) {
    if (window.helenaContent.currentlyScraping()) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }
}