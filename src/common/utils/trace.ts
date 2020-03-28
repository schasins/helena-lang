import { MainpanelNode } from "../mainpanel_node";
import { HelenaConsole } from "./helena_console";
import { PageVariable } from "../../mainpanel/variables/page_variable";
import { StatementTypes } from "../../mainpanel/lang/statements/statement_types";

export type TraceType = TraceEvent[];

export interface Delta {
  divergingProp: string;
  changed: {
    prop: {
      [key: string]: any;
    };
  }
}

interface DisplayInfo {
  causedBy?: TraceEvent;
  causesLoads?: TraceEvent[];
  inputPageVar?: PageVariable;
  manual?: boolean;
  pageVar?: PageVariable;
  visible?: boolean;
}

interface DOMEventInfo {
  ___additionalData___: {
    temporaryStatementIdentifier: number;
  };
  scrape: MainpanelNode.Interface;
  visualization: string;
}

export interface FrameData {
  iframeIndex: number;
  port: number;
  tab: number;
  topURL: string;
  URL: string;
  windowId: number;
}

export interface TraceEvent {
  additional?: DOMEventInfo;
  additionalDataTmp?: {
    display?: DisplayInfo;
  }
  data: {
    altKey: boolean;
    ctrlKey: boolean;
    ctrlKeyOnLinux: boolean;
    frameId: number;
    keyCode?: number;
    shiftKey: boolean;
    metaKey: boolean;
    metaKeyOnMac: boolean;
    parentFrameId: number;
    tabId: number;
    type: string;
    url: string;
    windowId: number;
  };
  forceReplay: boolean;
  frame: FrameData;
  mayBeSkippable?: boolean;
  meta: {
    deltas: Delta[];
  };
  state: string;
  target: {
    snapshot: MainpanelNode.Interface;
    xpath: string;
  };
  targetTimeout: number;
  timing: {
    ignoreWait: boolean;
    waitTime: number;
  };
  type: string;
}

export interface DOMTraceEvent extends TraceEvent {
  additional: DOMEventInfo;
}

export interface DisplayTraceEvent extends DOMTraceEvent {
  additionalDataTmp: {
    display: DisplayInfo;
  }
}

/**
 * Handling a trace (i.e. a list of Ringer events).
 */
export namespace Trace {
  const statementToEventMapping = {
    mouse: ['click','dblclick','mousedown','mousemove','mouseout','mouseover',
      'mouseup'],
    keyboard: ['keydown','keyup','keypress','textinput','paste','input'],
    dontcare: ['blur']
  };

  export function completedEventType(ev: TraceEvent) {
    return (ev.type === "completed" && ev.data.type === "main_frame") ||
      (ev.type === "webnavigation" && ev.data.type === "onCompleted" &&
       ev.data.parentFrameId === -1);
  }

  export function lastTopLevelCompletedEvent(trace: TraceType) {
    for (let i = trace.length - 1; i >= 0; i--){
      const ev = trace[i];
      if (completedEventType(ev)) {
        return ev;
      }
    }
    throw new ReferenceError("No top level completed event!");
  }

  export function tabId(ev: TraceEvent) {
    return ev.data.tabId;
  }

  export function frameId(ev: TraceEvent) {
    return ev.data.frameId;
  }

  export function lastTopLevelCompletedEventTabId(trace: TraceType) {
    const ev = lastTopLevelCompletedEvent(trace);
    return ev?.data.tabId;
  }

  export function tabsInTrace(trace: TraceType) {
    const tabs: number[] = [];
    for (const ev of trace) {
      if (completedEventType(ev)){
        if (!tabs.includes(ev.data.tabId)) {
          tabs.push(ev.data.tabId);
        }
      }
    }  
    return tabs;
  }

  export function prepareForDisplay(ev: TraceEvent) {
    // this is where this tool chooses to store temporary data that we'll
    //   actually clear out before sending it back to r+r
    if (!ev.additionalDataTmp) {
      ev.additionalDataTmp = {};
    } 
    ev.additionalDataTmp.display = {};
    return <DisplayTraceEvent> ev;
  }

  export function getLoadURL(ev: TraceEvent) {
    const url = ev.data.url;
    // to canonicalize urls that'd be treated the same, remove slash at end
    return strip(url, "/");
  }

  export function getDOMURL(ev: TraceEvent) {
    const url = ev.frame.topURL;
    // to canonicalize urls that'd be treated the same, remove slash at end
    return strip(url, "/");
  }

  export function getTabId(ev: TraceEvent) {
    if (ev.type === "dom") {
      HelenaConsole.warn("yo, this function isn't for dom events");
    }
    const tabId = ev.data.tabId;
    return tabId;
  }

  export function getDOMPort(ev: TraceEvent) {
    return ev.frame.port;
  }

  export function getVisible(ev: TraceEvent) {
    return ev.additionalDataTmp?.display?.visible;
  }

  export function setVisible(ev: DisplayTraceEvent, val: boolean) {
    ev.additionalDataTmp.display.visible = val;
  }

  export function getManual(ev: DisplayTraceEvent) {
    return ev.additionalDataTmp.display.manual;
  }

  export function setManual(ev: DisplayTraceEvent, val: boolean) {
    ev.additionalDataTmp.display.manual = val;
  }

  export function getLoadOutputPageVar(ev: DisplayTraceEvent) {
    if (!ev.additionalDataTmp.display.pageVar) {
      throw new ReferenceError("Load output page variable undefined.");
    }
    return ev.additionalDataTmp.display.pageVar;
  }

  export function setLoadOutputPageVar(ev: DisplayTraceEvent,
      val: PageVariable) {
    ev.additionalDataTmp.display.pageVar = val;
  }

  export function getDOMInputPageVar(ev: DisplayTraceEvent): PageVariable {
    if (!ev.additionalDataTmp.display.inputPageVar) {
      throw new ReferenceError("DOM Input page variable undefined");
    }
    return ev.additionalDataTmp.display.inputPageVar;
  }

  export function setDOMInputPageVar(ev: DisplayTraceEvent, val: PageVariable) {
    ev.additionalDataTmp.display.inputPageVar = val;
  }

  export function getDOMOutputLoadEvents(ev: DisplayTraceEvent){
    if (ev.type !== "dom") { return; }
    return ev.additionalDataTmp.display.causesLoads;
  }

  export function setDOMOutputLoadEvents(ev: DisplayTraceEvent,
      val: TraceEvent[]) {
    if (ev.type !== "dom") { return; }
    ev.additionalDataTmp.display.causesLoads = val;
  }

  export function addDOMOutputLoadEvent(ev: DisplayTraceEvent,
      val: TraceEvent) {
    if (!ev.additionalDataTmp.display.causesLoads) {
      ev.additionalDataTmp.display.causesLoads = [];
    }
    ev.additionalDataTmp.display.causesLoads.push(val);
  }

  export function getLoadCausedBy(ev: DisplayTraceEvent) {
    return ev.additionalDataTmp.display.causedBy;
  }

  export function setLoadCausedBy(ev: DisplayTraceEvent, val: TraceEvent) {
    ev.additionalDataTmp.display.causedBy = val;
  }

  export function getDisplayInfo(ev: DisplayTraceEvent) {
    return ev.additionalDataTmp.display;
  }

  export function clearDisplayInfo(ev: DisplayTraceEvent) {
    delete ev.additionalDataTmp.display;
  }

  export function setDisplayInfo(ev: DisplayTraceEvent,
      displayInfo: DisplayInfo) {
    ev.additionalDataTmp.display = displayInfo;
  }

  export function setTemporaryStatementIdentifier(ev: TraceEvent, id: number) {
    if (!ev.additional) {
      // not a dom event, can't copy this stuff around
      return;
    }
    // this is where the r+r layer lets us store data that will actually be
    //   copied over to the new events (for dom events);  recall that it's
    //   somewhat unreliable because of cascading events; sufficient for us
    //   because cascading events will appear in the same statement, so can
    //   have same statement id, but be careful
    ev.additional.___additionalData___.temporaryStatementIdentifier = id;
  }

  export function getTemporaryStatementIdentifier(ev: TraceEvent) {
    if (!ev.additional) {
      // not a dom event, can't copy this stuff around
      return null;
    }
    return ev.additional.___additionalData___.temporaryStatementIdentifier;
  }

  export function statementType(ev: TraceEvent) {
    if (ev.type === "completed" || ev.type === "manualload" ||
        ev.type === "webnavigation") {
      if (!Trace.getVisible(ev)) {
        return null; // invisible, so we don't care where this goes
      }
      return StatementTypes.LOAD;
    } else if (ev.type === "dom") {
      if (statementToEventMapping.dontcare.indexOf(ev.data.type) > -1) {
        return null; // who cares where blur events go
      }
      let lowerXPath = ev.target.xpath.toLowerCase();
      if (lowerXPath.indexOf("/select[") > -1) {
        // this was some kind of interaction with a pulldown, so we have
        //   something special for this
        return StatementTypes.PULLDOWNINTERACTION;
      } else if (statementToEventMapping.mouse.includes(ev.data.type)) {
        const domEv = <DOMTraceEvent> ev;
        if (domEv.additional.scrape) {
          if (domEv.additional.scrape.linkScraping) {
            return StatementTypes.SCRAPELINK;
          }
          return StatementTypes.SCRAPE;
        }
        return StatementTypes.MOUSE;
      } else if (statementToEventMapping.keyboard.includes(ev.data.type)) {
        /*
        if (ev.data.type === "keyup") {
          return StatementTypes.KEYUP;
        }
        */
        //if ([16, 17, 18].indexOf(ev.data.keyCode) > -1) {
        //  // this is just shift, ctrl, or alt key.  don't need to show these to the user
        //  return null;
        //}
        return StatementTypes.KEYBOARD;
      }
    }
    // these events don't matter to the user, so we don't care where this goes
    return null;
  }

  export function firstVisibleEvent(trace: TraceType) {
    for (const ev of trace) {
      const st = statementType(ev);
      if (st !== null) {
        return <DisplayTraceEvent> ev;
      }
    }
    throw new ReferenceError("No visible events in trace!");
  }
}

function strip(str: string, remove: string) {
  while (str.length > 0 && remove.includes(str.charAt(0))) {
    str = str.substr(1);
  }
  while (str.length > 0 && remove.includes(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}