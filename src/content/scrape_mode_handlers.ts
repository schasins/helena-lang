import { EventMessage } from "./event";

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
   * Send scraped data to the mainpanel for visualization.
   *   This line must run after the r+r content script runs so that the
   *   additional_recording_handlers object exists.
   * TODO: cjbaik: move this to `content_script.js` after it is converted to TS
   */
  window.additional_recording_handlers.scrape = function(node: Node,
    eventMessage: EventMessage) {
    let data: MainpanelNodeRep = NodeRep.nodeToMainpanelNodeRepresentation(node,
      window.helenaState.tabTopUrl);
    // convention is SHIFT means we want to scrape the link, not the text 
    let linkScraping = eventMessage.data.shiftKey || eventMessage.data.metaKey;
    data.linkScraping = linkScraping;
    if (eventMessage.data.type === "click") {
      utilities.sendMessage("content", "mainpanel", "scrapedData", data);
    } // send it to the mainpanel for visualization
    return data;
  };

  /**
   * Filter out extra Ctrl or Alt key events from being recorded, specifically
   *   for Chrome on Windows in which repeated events are fired when key is
   *   held down, whereas it is a single event on Mac.
   * TODO: cjbaik: move this to `content_script.js` after it is converted to TS
   */
  window.additional_recording_filters.scrape = function (event: KeyboardEvent) {
    // key code 18: alt; key code 17: ctrl
    return (event.keyCode === 18 || event.keyCode === 17) &&
        (event.type === "keypress" || event.type === "keydown");
  };

  let currKeyState: {
    [key: number]: boolean;
  } = {}; // keeps track of the keys that are currently being pressed down

  /**
   * Because Windows has this habit of producing multiple keypress, keydown
   *   events for a continued key press, we want to throw out events that are
   *   repeats of events we've already seen. This change fixes a major issue
   *   with running Helena on Windows, in that the top-level tool chooses to
   *   ignore events that can be accomplished without running Ringer (e.g.
   *   scraping relation items), but keydown events can only be accomplished by
   *   Ringer.  So replay gets slow because of having to replay all the Ringer
   *   events for each row of the relation.
   * Note: if we run into issues where holding a key down in a recording
   *   produces a bad replay, look here first.
   * TODO: cjbaik: move this to `content_script.js` after it is converted to TS
   */
  window.additional_recording_filters.ignoreExtraKeydowns = 
    function(event: KeyboardEvent) {
    // for now, we'll ignore multiple keypresses for all keys
    //   (not just ctrl and alt)
    if (event.type === "keypress" || event.type === "keydown") { 
      // first seen, record that it's being pressed down
      if (!currKeyState[event.keyCode]) { 
        currKeyState[event.keyCode] = true;
        return false;
      } else {  // not first seen, ignore
        return true;
      }
    } else if (event.type === "keyup") {
      // key is no longer being pressed, no longer need to keep track of it
      currKeyState[event.keyCode] = false;
      return false;
    }
    return false;
  }

  // we always want this filter to be on when recording
  // TODO: cjbaik: move this to `content_script.js` after it is converted to TS
  window.additional_recording_filters_on.ignoreExtraKeydowns = true;

  /**
   * Mousemove handler in scraping mode. Updates state of most recent element
   *   that was hovered over.
   * @param event mousemove event
   */
  export function mousemove(event: Event) {
    window.helenaState.mostRecentMousemoveTarget = event.target;
  }

  /**
   * Mousein handler in scraping mode. Updates highlighted element.
   * @param event mousein event
   */
  export function mousein(event: Event) {
    if (!window.helenaState.currentlyRecording()) {
      // don't want to run this visualization stuff if we're in replay mode
      //   rather than recording mode, even though of course we're recording
      //   during replay
      return;
    }
    Highlight.clearHighlight(window.helenaState.highlightedElement);
    window.helenaState.highlightedElement = Highlight.highlightNode(
      MiscUtilities.targetFromEvent(event), "#E04343", true, false);
  }

  /**
   * Mouseout handler in scraping mode. Clears highlight if present.
   * @param event mouseout event
   */
  export function mouseout(event: Event) {
    Highlight.clearHighlight(window.helenaState.highlightedElement);
  }

  /**
   * Click handler in scraping mode. Prevents event from propagating such that
   *   links won't be followed, etc.
   * @param event click event
   */
  export function click(event: Event) {
    if (window.helenaState.currentlyScraping()) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }
}

// TODO: cjbaik: move these to a file with all document listeners?
document.addEventListener('mousemove', ScrapeModeHandlers.mousemove, true);
document.addEventListener('click', ScrapeModeHandlers.click, true);