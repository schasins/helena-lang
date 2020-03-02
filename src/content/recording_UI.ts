import * as $ from "jquery";
import * as _ from "underscore";

import { ScrapeModeHandlers } from "./scrape_mode_handlers";
import { ScrapingTooltip } from "./scraping_tooltip";

declare global {
  interface Window {
    // TODO: cjbaik: move this to content script.
    additional_recording_handlers: {
      scrape: Function;
      visualization: Function;
    },
    additional_recording_filters: {
      scrape: Function;
      ignoreExtraKeydowns: Function;
    },
    additional_recording_handlers_on: {
      scrape: boolean;
      visualization: boolean;
    },
    additional_recording_filters_on: {
      scrape: boolean;
      ignoreExtraKeydowns: boolean;
    }
  }
}

/** 
 * Handlers for user events on the content side while recording.
 */
export namespace RecordingHandlers {
  /**
   * Handler for context menu events. Prevents the right-click menu from opening
   *   during recording. Important because interactions with the context menu
   *   won't be recorded, and Helena won't be able to replay them.
   * @param event context menu event
   */
  export function contextmenuHandler(event: MouseEvent) {
    if (window.helenaState.currentlyRecording()) {
      // prevents right click from working
      event.preventDefault();
      if (navigator.appVersion.toLocaleLowerCase().indexOf("win") !== -1) {
        alert("Trying to open a new tab? Try CTRL+click instead!");
      } else if (navigator.appVersion.toLocaleLowerCase().indexOf("mac") !== -1) {
        alert("Trying to open a new tab? Try CMD+click instead!");
      } else { // linux or unix, depends on computer 
        alert("Trying to open a new tab? Use a keyboard shortcut (like CTRL+click) instead!");
      }
    }
  }

  /**
   * Handler for mouseover events. 
   * @param event mouseover event
   */
  export function mouseoverHandler(event: MouseEvent) {
    if (window.helenaState.currentlyRecording()) {
      new ScrapingTooltip(MiscUtilities.targetFromEvent(event));
      RelationPreview.relationHighlight(MiscUtilities.targetFromEvent(event));
    }
    // just a backup in case the checks on keydown and keyup fail to run, as
    //   seems to happen sometimes with focus issues
    updateScraping(event);
    if (window.helenaState.currentlyScraping() &&
        window.helenaState.currentlyRecording()) {
      ScrapeModeHandlers.mousein(event);
    }
  }

  /**
   * Handler for mouseout events. 
   * @param event mouseout event
   */
  export function mouseoutHandler(event: MouseEvent) {
    if (window.helenaState.currentlyRecording()) {
      ScrapingTooltip.destroy(MiscUtilities.targetFromEvent(event));
      RelationPreview.relationUnhighlight();
    }
    // just a backup in case the checks on keydown and keyup fail to run, as
    //   seems to happen sometimes with focus issues
    updateScraping(event);
    if (window.helenaState.currentlyScraping() && window.helenaState.currentlyRecording()) {
      ScrapeModeHandlers.mouseout(event);
    }
  }

  let altDown = false;

  export function updateScraping(event: MouseEvent) {
    updateScrapingTrackingVars(event);
    checkScrapingOn();
    checkScrapingOff();
  };

  function updateScrapingTrackingVars(event: MouseEvent) {
    if (event.altKey) {
      altDown = true;
    }
    else{
      altDown = false;
    }
  };

  function checkScrapingOn() {
    if (!window.helenaState.currentlyScraping() && (altDown)) {
      window.helenaState.activateScrapingMode();

      if (!window.helenaState.currentlyRecording()) {
        // don't want to run this visualization stuff if we're in replay mode
        //   rather than recording mode, even though of course we're recording
        //   during replay
        return;
      }
      // want highlight shown now, want clicks to fall through
      window.helenaState.highlightedElement = Highlight.highlightNode(
        window.helenaState.mostRecentMousemoveTarget, "#E04343", true, false);
    }
  };

  function checkScrapingOff() {
    if (window.helenaState.currentlyScraping() &&
        window.helenaState.currentlyRecording() && !(altDown)) {
      window.helenaState.disableScrapingMode();  
      Highlight.clearHighlight(window.helenaState.highlightedElement);
    }
  };

  function addOverlayDiv(observer: MutationObserver) {
    // TODO: cjbaik: move to separate file/use some form of templating framework
    let overlay = $("<div id='helena_overlay' style='position: fixed; width: 100%; height: 100%; \
                                  top: 0; left: 0; right: 0; bottom: 0; \
                                  background-color: rgba(0,0,0,0); \
                                  z-index: 2147483647; cursor: pointer;'></div>");
    let messageDiv = $("<div style='background-color: rgba(0,255,0,0.85); padding: 10px;'>\
      <div style='font-size:20px'>This page is being controlled by Helena.</div>\
      If you want to interact with this page anyway, click here to remove the overlay. Keep in mind that navigating away from the current page may disrupt the Helena process.\
      </div>");
    overlay.append(messageDiv);

    // if the user clicks on the box with the warning, go ahead and remove the
    //   whole overlay but stop the observer first, becuase we don't want to add
    //   it again because of the user's click and resultant removal
    messageDiv.click(function() {
      observer.disconnect();
      overlay.remove();
    });

    $("body").append(overlay);
  }

  let addedOverlay = false;
  export function applyReplayOverlayIfAppropriate(replayWindowId: number) {
    WALconsole.namedLog("tooCommon", "applyReplayOverlayIfAppropriate",
      replayWindowId, window.helenaState.windowId, addedOverlay);
    
    // only apply it if we're in the replay window, if we haven't already
    //   applied it, and if we're the top-level frame
    if (window.helenaState.windowId &&
        replayWindowId === window.helenaState.windowId && !addedOverlay &&
        self === top) {
      // ok, we're a page in the current replay window.  put in an overlay

      // and remember, don't add the overlay again in future
      addedOverlay = true;

      // ok, now one weird thing about this is this alters the structure of the
      // page if other nodes are added later which can prevent us from finding
      // things like, say, relations.  so we have to make sure to put it back at
      // the end of the body nodes list whenever new stuff gets added

      // select the target node
      let target = document.body;
      // create an observer instance
      // configuration of the observer:
      let config = { childList: true }
      let observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) { 
              // stop observing while we edit it ourself
              console.log("paused observing");
              observer.disconnect();
              $("#helena_overlay").remove();
              addOverlayDiv(observer);
              // and start again
              observer.observe(target, config);
          });
      });
      // pass in the target node, as well as the observer options
      observer.observe(target, config);

      // now actually add the overlay
      addOverlayDiv(observer);
    }
  };
}

// TODO: cjbaik: move this to a separate file, or initialize for a class
document.addEventListener('contextmenu', RecordingHandlers.contextmenuHandler, true);
document.addEventListener('mouseover', RecordingHandlers.mouseoverHandler, true);
document.addEventListener('mouseout', RecordingHandlers.mouseoutHandler, true);
document.addEventListener('keydown', RecordingHandlers.updateScraping, true);
document.addEventListener('keyup', RecordingHandlers.updateScraping, true);

/**
 * Highlight relations that can be found on the page on hover.
 */
namespace RelationPreview {
  /**
   * TODO: cjbaik: returned from Helena back-end server.
   *   Not sure what all parameters mean yet.
   */
  interface KnownRelationResponse {
    selector_version: number;
    selector: string;
    name: string;
    exclude_first: number;
    id: number;
    columns: {
      id: number;
      xpath: string;
      suffix: string;
      name: string;
    }[];
    num_rows_in_demonstration: number;
    next_type: number;
    next_button_selector: string;
  }

  /**
   * TODO: cjbaik: returned from Helena back-end server.
   *   Not sure what all parameters mean yet.
   */
  interface KnownRelation {
    selectorObj: {
      selector_version: number;
      selector: {
        tag: {
          pos: boolean;
          values: string[];
        };
        xpath: {
          pos: boolean;
          values: {
            index: string;
            iterable: boolean;
            nodeName: string;
          };
        }
      };
      name: string;
      exclude_first: number;
      id: number;
      columns: {
        xpath: string;
        suffix: {
          index: string;
          iterable: boolean;
          nodeName: string;
        }[];
        name: string;
        id: number;
      }[];
      num_rows_in_demonstration: number;
      next_type: number;
      next_button_selector: {
        frame_id: string;
        tag: string;
        text: string;
        xpath: string;
      } | null;
    },
    nodes: Element[];
    relationOutput: (Node | null)[][];
    highlighted: boolean;
    highlightNodesTime?: number;
    highlightNodes?: JQuery<HTMLElement>[];
  }

  let knownRelations: KnownRelation[] = [];

  /**
   * Initialize known relations by retrieving from server and caching.
   */
  function setup() {
    WALconsole.log("running setup");
    // have to use postForMe right now to make the extension make a post request
    // because modern Chrome won't let us request http content from https pages
    // and we don't currently have ssl certificate for kaofang
    utilities.sendMessage("content", "background", "postForMe", {
      url: helenaServerUrl + '/allpagerelations',
      params: {url: window.location.href }
    });
    utilities.listenForMessageOnce("background", "content", "postForMe",
      function (resp: { relations: KnownRelationResponse[] }) {
        WALconsole.log(resp);
        preprocessKnownRelations(resp.relations);
      }
    );
  }

  // TODO: cjbaik: move this to `content_script.js` when Typescriptified
  // we need to tell the record+replay layer what we want to do when a tab
  //   learns it's recording
  window.addonStartRecording.push(setup);
  
  /**
   * Massage and reformat server response about known relations.
   */
  function preprocessKnownRelations(resp: KnownRelationResponse[]) {
    for (let i = 0; i < resp.length; i++) {
      let selectorObj = ServerTranslationUtilities.unJSONifyRelation(resp[i]);
      // first let's apply each of our possible relations to see which nodes
      //   appear in them
      let relationOutput = RelationFinder.interpretRelationSelector(resp[i]);
      let nodeList = _.flatten(relationOutput);

      // then let's make a set of highlight nodes for each relation, so we can
      //   toggle them between hidden and displayed based on user's hover
      //   behavior
      knownRelations.push(
        {
          selectorObj: selectorObj,
          nodes: nodeList,
          relationOutput: relationOutput,
          highlighted: false
        }
      );
    }  
  }

  /**
   * Given an element, find most relevant relation and highlight.
   * @param element element to highlight
   */
  export function relationHighlight(element: Element) {
    // for now we'll just pick whichever node includes the current node and has
    //   the largest number of nodes on the current page
    let winningRelation = null;
    let winningRelationSize = 0;
    for (let i = 0; i < knownRelations.length; i++) {
      let relationInfo = knownRelations[i];
      if (relationInfo.nodes.indexOf(element) > -1) {
        if (relationInfo.nodes.length > winningRelationSize) {
          winningRelation = relationInfo;
          winningRelationSize = relationInfo.nodes.length;
        }
      }
    }
    if (winningRelation) {
      // cool, we have a relation to highlight
      winningRelation.highlighted = true;
      
      // important to make the highlight nodes now, since the nodes might be
      // shifting around throughout interaction, especially if things still
      // loading
      let currTime = new Date().getTime();
      let highlightNodes: JQuery<HTMLElement>[] | null = null;

      if (winningRelation.highlightNodes &&
        winningRelation.highlightNodesTime &&
        ((currTime - winningRelation.highlightNodesTime) < 2000)) {
        // cache the highlight nodes for up to two second, then go ahead and
        //   recompute those positions
        highlightNodes = winningRelation.highlightNodes;
      } else {
        highlightNodes = RelationFinder.highlightRelation(
          winningRelation.relationOutput, false, false);
      }
      winningRelation.highlightNodes = highlightNodes;
      winningRelation.highlightNodesTime = new Date().getTime();

      for (let i = 0; i < highlightNodes.length; i++) {
        highlightNodes[i].css("display", "block");
      }
    }

  };

  /**
   * Unhighlight the relation.
   */
  export function relationUnhighlight() {
    for (let i = 0; i < knownRelations.length; i++) {
      let relationInfo = knownRelations[i];
      if (relationInfo.highlightNodes) {
        for (let j = 0; j < relationInfo.highlightNodes.length; j++) {
          relationInfo.highlightNodes[j].css("display", "none");
        }
      }
    }
  };
}
