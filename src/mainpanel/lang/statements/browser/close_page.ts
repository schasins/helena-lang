import * as _ from "underscore";
import { HelenaLangObject } from "../../helena_lang";
import { PageVariable } from "../../../variables/page_variable";
import { RunObject, RunOptions } from "../../program";

export class ClosePageStatement extends HelenaLangObject {
  public pageVarCurr: PageVariable;
  constructor(pageVarCurr: PageVariable) {
    super();
    window.Revival.addRevivalLabel(this);
    // setBlocklyLabel(this, "close");
    this.pageVarCurr = pageVarCurr;
  }

  public toStringLines() {
    // close statements are now invisible cleanup, not normal statements, so
    //   don't use the line below for now
    // return [this.pageVarCurr.toString() + ".close()" ];
    return [];
  }

  public run(runObject: RunObject, rbbcontinuation: Function,
      rbboptions: RunOptions) {
    const self = this;
    console.log("run close statement");

    const tabId = this.pageVarCurr.currentTabId();
    if (tabId !== undefined && tabId !== null) {
      console.log("ClosePageStatement run removing tab",
        this.pageVarCurr.currentTabId());

      // we want to remove the tab, but we should never do that if we actually
      //   mapped the wrong tab and this tab belongs somewhere else
      // todo: in future, prevent it from mapping the wrong tab in the first
      //   place!  might involve messing with ringer layer
      // but also with setCurrentTabId, but mostly I think with the ringer layer
      const okToRemoveTab = runObject.program.pageVars.every(
        (pageVar: PageVariable) =>
          pageVar.currentTabId() !== self.pageVarCurr.currentTabId() ||
          pageVar === self.pageVarCurr
      );
      if (okToRemoveTab) {
        const tabId = this.pageVarCurr.currentTabId();
        if (!tabId) {
          throw new ReferenceError("tabId is undefined.");
        }
        chrome.tabs.remove(tabId, () => {
          self.pageVarCurr.clearCurrentTabId();
          const portManager = ports; // the ringer portsmanager object
          portManager.removeTabInfo(tabId);
          rbbcontinuation(rbboptions);
        });
      } else {
        // it's still ok to clear current tab, but don't close it
        self.pageVarCurr.clearCurrentTabId();
        rbbcontinuation(rbboptions);
      }
    } else {
      window.WALconsole.log("Warning: trying to close tab for pageVar that " +
        "didn't have a tab associated at the moment.  Can happen after " +
        "continue statement.");
      rbbcontinuation(rbboptions);
    }
  }
}