import * as _ from "underscore";

import { HelenaMainpanel, NodeSources } from "../helena_mainpanel";

import { ColumnSelector } from "../../content/selector/column_selector";
import { NextButtonSelector } from "../../content/selector/next_button_selector";

import { FreshRelationItemsMessage,
  NextButtonTextMessage } from "../../common/messages";

import { MainpanelNode } from "../../common/mainpanel_node";

import { NodeVariable } from "../../mainpanel/variables/node_variable";

import { Features } from "../../content/utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;

import { HelenaLangObject } from "../lang/helena_lang";

import { LoadStatement } from "../lang/statements/browser/load";
import { PulldownInteractionStatement } from "../lang/statements/page_action/pulldown_interaction";
import { RelationMessage } from "../../common/messages";
import { GenericRelation } from "./generic";
import { PageActionStatement } from "../lang/statements/page_action/page_action";
import { PageRelation, PageVariable } from "../variables/page_variable";
import { RunObject } from "../lang/program";

function shortPrintString(obj: object) {
  if (!obj) {
    return JSON.stringify(obj);
  }
  else{
    return JSON.stringify(obj).substring(0,20);
  }
}

function domain(url: string) {
  let domain = "";
  // don't need http and so on
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  }
  else {
    domain = url.split('/')[0];
  }
  // there can be site.com:1234 and we don't want that
  domain = domain.split(':')[0];
  return domain;
}

function findByXpath(
  objectList: (ColumnSelector.Interface | MainpanelNode.Interface)[],
  xpath: string) {
    const objs = objectList.filter((obj) => obj.xpath === xpath);
    if (objs.length === 0) { return null; }
    return objs[0];
}


function usedByPulldownStatement(statement: HelenaLangObject,
  firstRowXPaths: string[]) {
  if (statement instanceof PulldownInteractionStatement) {
    const xpath = (<PulldownInteractionStatement> statement).node;
    for (const cXpath of firstRowXPaths) {
      // so if the xpath of the pulldown menu appears in the xpath of the first
      //   row cell
      if (cXpath.includes(xpath)) {
        return true;
      }
    }
  }
  return false;
}

function highestPercentOfHasXpathPerRow(relation: MainpanelNode.Interface[][],
  limitToSearch: number) {
  if (relation.length < limitToSearch) {
    limitToSearch = relation.length;
  }
  let maxWithXpathsPercent = 0;
  for (let i = 0; i < limitToSearch; i++) {
    let numWithXpaths = relation[i].reduce((acc, cell) => {
      if (cell.xpath) {
        return acc + 1;
      } else {
        return acc
      }
    }, 0);
    let percentWithXpaths = numWithXpaths / relation[i].length;
    if (percentWithXpaths > maxWithXpathsPercent) {
      maxWithXpathsPercent = percentWithXpaths;
    }
  }
  return maxWithXpathsPercent;
}

export class Relation extends GenericRelation {
  public static counter = 0;
  
  public id: string;
  public selector: GenericFeatureSet | GenericFeatureSet[];
  public selectorVersion: number;
  public excludeFirst: number;
  public demonstrationTimeRelation: MainpanelNode.Interface[][];
  public numRowsInDemo: number;
  public pageVarName: string;
  public url: string;
  public nextType: number;
  public nextButtonSelector: NextButtonSelector.Interface | null;
  public frame: number;
  
  public firstRowXPaths: string[];
  public firstRowTexts: string[];
  public firstRowValues: string[];

  public relationScrapeWait: number;

  public getRowsCounter: number;
  public doneArray: boolean[];
  public relationItemsRetrieved: {
    [key: string]: any;       // TODO: cjbaik: what type is this?
  };
  // may still be interesting to track misses. may choose to send an extra next
  //   button press, something like that
  public missesSoFar: {
    [key: string]: number;
  };

  public getNextRowCounter: number;
  
  // for next buttons that are actually counting (page 1, 2, 3...), it's useful
  //   to keep track of this
  public currNextButtonText?: string;

  constructor(relationId: string, name: string,
      selector: GenericFeatureSet | GenericFeatureSet[],
      selectorVersion: number, excludeFirst: number,
      columns: ColumnSelector.Interface[],
      demonstrationTimeRelation: MainpanelNode.Interface[][],
      numRowsInDemo: number, pageVarName: string, url: string,
      nextType: number, nextButtonSelector: NextButtonSelector.Interface | null,
      frame: number) {
    super();
    
    window.Revival.addRevivalLabel(this);

    this.id = relationId;
    this.selector = selector;
    this.selectorVersion = selectorVersion;
    this.excludeFirst = excludeFirst;
    this.columns = columns;
    this.demonstrationTimeRelation = demonstrationTimeRelation;
    this.numRowsInDemo = numRowsInDemo;
    this.pageVarName = pageVarName;
    this.url = url;
    this.nextType = nextType;
    this.nextButtonSelector = nextButtonSelector;

    // note that right now this frame comes from our relation-finding stage.
    //   might want it to come from record
    this.frame = frame;

    if (!name) {
      Relation.counter += 1;
      this.name = "list_" + Relation.counter;
    } else {
      this.name = name;
    }

    window.WALconsole.log(this);
    this.processColumns();
    this.updateFirstRowInfo();

    this.getRowsCounter = 0;
    this.doneArray = [];
    this.relationItemsRetrieved = {};
    this.missesSoFar = {};

    this.getNextRowCounter = 0;
  }

  public demonstrationTimeRelationText() {
    return this.demonstrationTimeRelation.map(
      (row: MainpanelNode.Interface[]) => {
        return row.map((cell: MainpanelNode.Interface) => cell.text);
      }
    );
  }

  public firstRowNodeRepresentations() {
    return this.demonstrationTimeRelation[0];
  }

  public nodeVariables() {
    if (!this.nodeVars || this.nodeVars.length < 1) {
      this.nodeVars = [];
      const nodeReps = this.firstRowNodeRepresentations();
      for (let i = 0; i < nodeReps.length; i++) {
        const name = this.columns[i].name;
        if (!name) {
          throw ReferenceError("Column has no name.");
        }
        this.nodeVars.push(new NodeVariable(name, nodeReps[i], null, null,
          NodeSources.RELATIONEXTRACTOR));
      }
    }
    return this.nodeVars;
  }

  public updateNodeVariables(environment: EnvironmentPlaceholder,
      pageVar: PageVariable) {
    window.WALconsole.log("updateNodeVariables Relation");
    const nodeVariables = this.nodeVariables();
    const columns = this.columns; // again, nodeVariables and columns must be aligned
    for (let i = 0; i < columns.length; i++) {
      let currNodeRep = this.getCurrentNodeRep(pageVar, columns[i]);
      nodeVariables[i].setCurrentNodeRep(environment, currNodeRep);
    }
    window.WALconsole.log("updateNodeVariables Relation completed");
  }

  public processColumns(oldColumns?: ColumnSelector.Interface[]) {
    for (let i = 0; i < this.columns.length; i++) {
      // should later look at whether this index is good enough
      this.processColumn(this.columns[i], i, oldColumns);
    }
  };

  private processColumn(colObject: ColumnSelector.Interface, index: number,
    oldColObjects?: ColumnSelector.Interface[]) {
    let oldColObject;
    if (colObject.name === null || colObject.name === undefined) {
      // a filler name that we'll use for now
      colObject.name = `${this.name}_item_${(index+1)}`;
      if (oldColObjects) {
        if (!colObject.xpath) {
          throw new ReferenceError("Column object has no XPath.");
        }

        // let's search the old col objects, see if any share an xpath and have
        //   a name for us
        oldColObject = <ColumnSelector.Interface> findByXpath(oldColObjects,
          colObject.xpath);
        if (oldColObject) {
          colObject.name = oldColObject.name;
        }
      }
    }

    // let's keep track of whether it's scraped by the current program
    if (colObject.scraped === undefined) {
      if (oldColObject) {
        colObject.scraped = oldColObject.scraped;
      } else {
        colObject.scraped = false;
      }
    }
    
    if (this.demonstrationTimeRelation[0]) {
      if (!colObject.xpath) {
        throw new ReferenceError("Column object has no XPath.");
      }
      // for now we're aligning the demonstration items with everything else via
      //   xpath.  may not always be best
      let firstRowCell = <MainpanelNode.Interface> findByXpath(
        this.demonstrationTimeRelation[0], colObject.xpath);
      if (!firstRowCell && colObject.xpath.toLowerCase().includes("/option[")) {
        // we're in the weird case where we interacted with a pulldown.  assume
        //   the options remain the same even though we never recorded the
        //   option during record-time
        // only one column for pulldown menus
        firstRowCell = this.demonstrationTimeRelation[0][0];
      }
      if (firstRowCell) {
        colObject.firstRowXpath = firstRowCell.xpath;
        colObject.firstRowText = firstRowCell.text;
        colObject.firstRowValue = firstRowCell.value;
      }
    }
    colObject.index = index;
  }

  private updateFirstRowInfo() {
    this.firstRowXPaths = this.demonstrationTimeRelation[0].map(
      (cell) => cell.xpath? cell.xpath : "undefined"
    );
    this.firstRowTexts = this.demonstrationTimeRelation[0].map(
      (cell) => cell.text
    );
    this.firstRowValues = this.demonstrationTimeRelation[0].map(
      (cell) => <string> cell.value
    );
  }

  public setNewAttributes(selector: GenericFeatureSet | GenericFeatureSet[],
    selectorVersion: number, excludeFirst: number,
    columns: ColumnSelector.Interface[],
    demonstrationTimeRelation: MainpanelNode.Interface[][],
    numRowsInDemo: number, nextType: number,
    nextButtonSelector: NextButtonSelector.Interface | null) {
      this.selector = selector;
      this.selectorVersion = selectorVersion;
      this.excludeFirst = excludeFirst;
      this.demonstrationTimeRelation = demonstrationTimeRelation;
      this.numRowsInDemo = numRowsInDemo;
      this.nextType = nextType;
      this.nextButtonSelector = nextButtonSelector;

      this.updateFirstRowInfo();

      // now let's deal with columns.  recall we need the old ones, since they
      //   might have names we need
      const oldColumns = this.columns;
      this.columns = columns;
      this.processColumns(oldColumns);
  }

  public usedByStatement(stmt: HelenaLangObject) {
    if (!(stmt instanceof PageActionStatement ||
          stmt instanceof LoadStatement)) {
      return false;
    }

    if (stmt instanceof PageActionStatement &&
        stmt.pageVar?.name === this.pageVarName &&
        stmt.node && this.firstRowXPaths?.includes(stmt.node)) {
      return true;
    }

    if (HelenaMainpanel.usedByTextStatement(stmt, this.firstRowTexts)) {
      return true;
    }

    if (usedByPulldownStatement(stmt, this.firstRowXPaths)) {
      return true;
    }
    
    // ok, neither the node nor the typed text looks like this relation's cells
    return false;
  }

  public messageRelationRepresentation(): RelationMessage {
    return {
      id: this.id, 
      name: this.name, 
      selector: this.selector, 
      selector_version: this.selectorVersion, 
      exclude_first: this.excludeFirst, 
      columns: this.columns, 
      next_type: this.nextType, 
      next_button_selector: this.nextButtonSelector, 
      url: this.url, 
      num_rows_in_demonstration: this.numRowsInDemo,
      relation_scrape_wait: this.relationScrapeWait
    };
  }

  public getPrinfo(pageVar: PageVariable) {
    return pageVar.pageRelations[this.name + "_" + this.id];
  }
  
  public setPrinfo(pageVar: PageVariable, val: PageRelation) {
    pageVar.pageRelations[this.name + "_" + this.id] = val;
  }

  public noMoreRows(runObject: RunObject, pageVar: PageVariable,
    callback: Function, allowMoreNextInteractions: boolean) {
    // first let's see if we can try running the next interaction again to get
    //   some fresh stuff.  maybe that just didn't go through?
    let maxNextButtonAttempts = runObject.program.nextButtonAttemptsThreshold;
    if (maxNextButtonAttempts === undefined) {
      maxNextButtonAttempts =
        <number> window.DefaultHelenaValues.nextButtonAttemptsThreshold;
    }
    const prinfo = this.getPrinfo(pageVar);
    if (allowMoreNextInteractions &&
      prinfo.currentNextInteractionAttempts < maxNextButtonAttempts) {
      window.WALconsole.log("ok, we're going to try calling getNextRow again," +
        " running the next interaction again. currentNextInteractionAttempts: "+
        prinfo.currentNextInteractionAttempts);
      // so that we don't fall back into trying to grab rows from current page
      //   when what we really want is to run the next interaction again.
      prinfo.runNextInteraction = true;
      this.getNextRow(runObject, pageVar, callback);
    } else {
      // no more rows -- let the callback know we're done
      // clear the stored relation data also
      prinfo.currentRows = null;
      window.WALconsole.namedLog("prinfo", "changing prinfo.currentrows, setting to null bc no more rows");
      window.WALconsole.namedLog("prinfo", shortPrintString(prinfo));
      prinfo.currentRowsCounter = 0;
      prinfo.currentNextInteractionAttempts = 0;
      callback(false); 
    }
  }

  public gotMoreRows(pageVar: PageVariable, callback: Function,
    rel: MainpanelNode.Interface[][]) {
    const prinfo = this.getPrinfo(pageVar);
    // so that we don't fall back into this same case even though we now have
    //   the items we want
    prinfo.needNewRows = false;
    prinfo.currentRows = rel;
    window.WALconsole.namedLog("prinfo", "changing prinfo.currentrows, " +
      "setting to rel bc found more rows", rel);
    window.WALconsole.namedLog("prinfo", shortPrintString(prinfo));
    prinfo.currentRowsCounter = 0;
    prinfo.currentNextInteractionAttempts = 0;
    callback(true);
  }

  // the function that we'll call when we actually have to go back to a page for freshRelationItems
  private getRowsFromPageVar(runObject: RunObject, pageVar: PageVariable,
    callback: Function) {
    
    const self = this;
    if (!pageVar.currentTabId()) {
      window.WALconsole.warn("Hey!  How'd you end up trying to find a " +
       "relation on a page for which you don't have a current tab id?? " +
       "That doesn't make sense.", pageVar);
    }

    this.getRowsCounter += 1;
    this.doneArray.push(false);
    
    // once we've gotten data from any frame, this is the function we'll call to
    //   process all the results
    const handleNewRelationItemsFromFrame = (data: FreshRelationItemsMessage,
        frameId: string) => {
      const currentGetRowsCounter = self.getRowsCounter;
      if (self.doneArray[currentGetRowsCounter]) {
        return;
      }

      if (self.relationItemsRetrieved[frameId]) {
        // we actually already have data from this frame.  this can happen
        //   because pages are still updating what they're showing but it's a
        //   bit of a concern.  let's see what the data actually is, 
        // todo: we should make sure we're not totally losing data because of
        //   overwriting old data with new data, then only processing the new
        //   data...
        window.WALconsole.namedLog("getRelationItems", "Got data from a frame" +
          " for which we already have data", self.getRowsCounter);
        window.WALconsole.namedLog("getRelationItems", _.isEqual(data,
          self.relationItemsRetrieved[frameId]), data,
          self.relationItemsRetrieved[frameId]);
        // we definitely don't want to clobber real new items with anything
        //   that's not new items, so let's make sure we don't
        if (self.relationItemsRetrieved[frameId].type ===
              window.RelationItemsOutputs.NEWITEMS &&
            data.type !== window.RelationItemsOutputs.NEWITEMS) {
          return;
        }
        // we also don't want to clobber if the old data is actually longer than
        //   the new data...
        // if we have long data, it's a little weird that we wouldn't just have
        //   accepted it and moved on, but it does happen...
        if (self.relationItemsRetrieved[frameId].type ===
              window.RelationItemsOutputs.NEWITEMS &&
            data.type === window.RelationItemsOutputs.NEWITEMS &&
            self.relationItemsRetrieved[frameId].relation.length >
              data.relation.length) {
          window.WALconsole.namedLog("getRelationItems", "The new data is " +
            "also new items, but it's shorter than the others, so we're " +
            "actually going to throw it away for now.  May be something to " +
            "change later.");
          return;
        }
      }

      window.WALconsole.log("data", data);
      if (data.type === window.RelationItemsOutputs.NOMOREITEMS) {
        // NOMOREITEMS -> definitively out of items.
        //   this frame says this relation is done
        // to stop us from continuing to ask for freshitems
        self.relationItemsRetrieved[frameId] = data;
        window.WALconsole.namedLog("getRelationItems", "We're giving up on " +
          "asking for new items for one of ",
          Object.keys(self.relationItemsRetrieved).length, " frames. frameId: ",
          frameId, self.relationItemsRetrieved, self.missesSoFar);
      } else if (data.type === window.RelationItemsOutputs.NONEWITEMSYET ||
        (data.type === window.RelationItemsOutputs.NEWITEMS &&
          data.relation.length === 0)) {
        // todo: currently if we get data but it's only 0 rows, it goes here.  is that just an unnecessary delay?  should we just believe that that's the final answer?
        self.missesSoFar[frameId] += 1;
        window.WALconsole.namedLog("getRelationItems",
          "adding a miss to our count", frameId, self.missesSoFar[frameId]);
      } else if (data.type === window.RelationItemsOutputs.NEWITEMS) {
        // yay, we have real data!

        // ok, the content script is supposed to prevent us from getting the
        //   same thing that it already sent before but to be on the safe side,
        //   let's put in some extra protections so we don't try to advance too
        //   early and also so we don't get into a case where we keep getting
        //   the same thing over and over and should decide we're done but
        //   instead loop forever
        
        function extractUserVisibleAttributesFromRelation(
          rel: MainpanelNode.Interface[][]) {
            return rel.map((row) => row.map((d) => [d.text, d.link]));
        }

        const prinfo = self.getPrinfo(pageVar);

        if (prinfo.currentRows &&
            _.isEqual(
              extractUserVisibleAttributesFromRelation(prinfo.currentRows), 
              extractUserVisibleAttributesFromRelation(data.relation))) {
          window.WALconsole.namedLog("getRelationItems", "This really " +
            "shouldn't happen.  We got the same relation back from the " +
            "content script that we'd already gotten.");
          window.WALconsole.namedLog("getRelationItems", prinfo.currentRows);
          self.missesSoFar[frameId] += 1;
        } else {
          window.WALconsole.log("The relations are different.");
          window.WALconsole.log(prinfo.currentRows, data.relation);
          window.WALconsole.namedLog("getRelationItems", currentGetRowsCounter,
            data.relation.length);

          // to stop us from continuing to ask for freshitems
          self.relationItemsRetrieved[frameId] = data;

          // let's see if this one has xpaths for all of a row in the first few
          const aRowWithAllXpaths =
            highestPercentOfHasXpathPerRow(data.relation, 20) === 1;
          
          // and then see if the difference between the num rows and the
          //   target num rows is less than 90% of the target num rows 
          const targetNumRows = self.demonstrationTimeRelation.length;
          const diffPercent =
            Math.abs(data.relation.length - targetNumRows) / targetNumRows;
          
          // only want to do the below if we've decided this is the actual data
          //   if this is the only frame, then it's definitely the data
          if (Object.keys(self.relationItemsRetrieved).length == 1 ||
              (aRowWithAllXpaths && diffPercent < .9)) {
            self.doneArray[self.getRowsCounter] = true;
            self.gotMoreRows(pageVar, callback, data.relation);
            return;
          }
        }
      } else {
        window.WALconsole.log("There's freshRelationItems with unknown type.");
      }

      // so?  are we done?  if all frames indicated that there are no more, then
      //   we just need to stop because the page tried using a next button,
      //   couldn't find one, and just won't be getting us more data

      // false should be the value if all frames said NOMOREITEMS
      let stillPossibleMoreItems = false;
      for (const key in self.relationItemsRetrieved) {
        const obj = self.relationItemsRetrieved[key];
        if (!obj || obj.type !== window.RelationItemsOutputs.NOMOREITEMS) {
          // ok, there's some reason to think it might be ok, so let's actually
          //   go ahead and try again
          stillPossibleMoreItems = true;
        }
      }
      if (!stillPossibleMoreItems) {
        window.WALconsole.namedLog("getRelationItems",
          "all frames say we're done", self.getRowsCounter);
        self.doneArray[self.getRowsCounter] = true;
        
        // false because shouldn't try pressing the next button
        self.noMoreRows(runObject, pageVar, callback, false);
      } else {
        window.WALconsole.namedLog("getRelationItems", "we think we might " +
          "still get rows based on some frames not responding yet");
      }
    }

    function processEndOfCurrentGetRows(pageVar: PageVariable,
      callback: Function) {
      window.WALconsole.namedLog("getRelationItems",
        "processEndOfCurrentGetRows", self.getRowsCounter);
      
      // ok, we have 'real' (NEWITEMS or decided we're done) data for all of
      //   them, we won't be getting anything new, better just pick the best one
      self.doneArray[self.getRowsCounter] = true;
      const dataObjs = Object.keys(self.relationItemsRetrieved).map(
        (key) => self.relationItemsRetrieved[key]
      );
      const dataObjsFiltered = dataObjs.filter(
        (data) => data.type === window.RelationItemsOutputs.NEWITEMS
      );
      
      // ok, let's see whether any is close in length to our original one.
      //   otherwise have to give up. how should we decide whether to accept
      //   something close or to believe it's just done???

      for (const data of dataObjsFiltered) {
        // let's see if this one has xpaths for all of a row in the first few
        const percentColumns = highestPercentOfHasXpathPerRow(data.relation, 20);
        
        // and then see if the difference between the num rows and the target
        //   num rows is less than 20% of the target num rows 
        const targetNumRows = self.demonstrationTimeRelation.length;
        const diffPercent =
          Math.abs(data.relation.length - targetNumRows) / targetNumRows;
        if (percentColumns > .5 && diffPercent < .3) {
          window.WALconsole.namedLog("getRelationItems",
            "all defined and found new items", self.getRowsCounter);
          self.doneArray[self.getRowsCounter] = true;
          self.gotMoreRows(pageVar, callback, data.relation);
          return;
        }
      }

      // drat, even with our more flexible requirements, still didn't find one
      //   that works.  guess we're done?

      window.WALconsole.namedLog("getRelationItems",
        "all defined and couldn't find any relation items from any frames",
        self.getRowsCounter);
      self.doneArray[self.getRowsCounter] = true;

      // true because should allow trying the next button
      self.noMoreRows(runObject, pageVar, callback, true);
    }

    // let's go ask all the frames to give us relation items for the relation
    const tabId = pageVar.currentTabId();

    function requestFreshRelationItems(frames: number[]) {
      const currentGetRowsCounter = self.getRowsCounter;
      self.relationItemsRetrieved = {};
      self.missesSoFar = {};
      for (const frame in frames) {
        // keep track of which frames need to respond before we'll be ready to
        //   advance
        self.relationItemsRetrieved[frame] = false;
        self.missesSoFar[frame] = 0;
      }
      for (const frame in frames) {
        // for each frame in the target tab, we want to see if the frame
        //   retrieves good relation items. we'll pick the one we like best
        // todo: is there a better way?  after all, we do know the frame in
        //   which the user interacted with the first page at original
        //   record-time.  if we have next stuff happening, we might even know
        //   the exact frameId on this exact page
        
        // here's the function for sending the message once
        const sendGetRelationItems = () => {
          window.WALconsole.namedLog("getRelationItems",
            "requesting relation items", currentGetRowsCounter);
          window.utilities.sendFrameSpecificMessage("mainpanel", "content",
            "getFreshRelationItems", self.messageRelationRepresentation(), 
            tabId, frame, (msg: FreshRelationItemsMessage) => { 
              // question: is it ok to insist that every single frame returns a
              //   non-null one?  maybe have a timeout?  maybe accept once we
              //   have at least one good response from one of the frames?
              window.WALconsole.namedLog("getRelationItems",
                "Receiving response: ", frame, msg); 
              window.WALconsole.namedLog("getRelationItems",
                "getFreshRelationItems answer", msg);
              
              // when get response, call handleNewRelationItemsFromFrame
              //   (defined above) to pick from the frames' answers
              if (msg !== null && msg !== undefined) {
                handleNewRelationItemsFromFrame(msg, frame);
              }
            }
          );
        }
        // here's the function for sending the message until we decide we're
        //   done with the current attempt to get new rows, or until actually
        //   get the answer
        window.MiscUtilities.repeatUntil(sendGetRelationItems, () => {
          return self.doneArray[currentGetRowsCounter] ||
                 self.relationItemsRetrieved[frame];
        }, () => {}, 1000, true);
      }

      // and let's make sure that after our chosen timeout, we'll stop and just
      //   process whatever we have
      let desiredTimeout = runObject.program.relationFindingTimeoutThreshold;
      if (!desiredTimeout) {
        desiredTimeout =
          window.DefaultHelenaValues.relationFindingTimeoutThreshold;
      }
      // todo: this timeout should be configurable by the user, relation seconds
      //   timeout
      
      setTimeout(() => {
        window.WALconsole.namedLog("getRelationItems",
          "TIMEOUT, giving up on currentGetRows", currentGetRowsCounter);
        if (!self.doneArray[currentGetRowsCounter]) {
          self.doneArray[currentGetRowsCounter] = false;
          processEndOfCurrentGetRows(pageVar, callback);
        }
      }, desiredTimeout);
    }

    // if we're trying to get relation items from a page, we should have it
    //   visible
    if (!tabId) {
      throw new ReferenceError("Tab ID is undefined.");
    }
    chrome.tabs.update(tabId, { selected: true });

    // ok, let's figure out whether to send the message to all frames in the tab
    //   or only the top frame
    if (self.frame === 0) {
      // for now, it's only when the frame index is 0, meaning it's the
      //   top-level frame, that we decide on using a single frame ahead of time
      requestFreshRelationItems([0]);
    } else {
      chrome.webNavigation.getAllFrames({ tabId: tabId }, (details) => {
        const frames = details?.map((d) => d.frameId);
        if (frames) {
          requestFreshRelationItems(frames);
        }
      });
    }
  }

  public endOfLoopCleanup(pageVar: PageVariable, continuation: Function) {
    const self = this;

    // if we're not closing this page and we want to iterate through this
    //   relation again, it's critical that we clear out all the stuff that's
    //   stored about the relation now
    let gotAck = false;
    window.utilities.listenForMessageOnce("content", "mainpanel",
      "clearedRelationInfo", () => {
        gotAck = true;
        continuation();
    });

    const currentTabId = pageVar.currentTabId();
    if (currentTabId) {
      window.MiscUtilities.repeatUntil(() => {
        window.utilities.sendMessage("mainpanel", "content",
          "clearRelationInfo", self.messageRelationRepresentation(), null, null,
          [currentTabId]);
      }, () => gotAck, () => {}, 1000, false);
    } else {
      continuation();
    }
  }

  // has to be called on a page, since a relation selector can be applied to
  //   many pages. higher-level tool must control where to apply
  public getNextRow(runObject: RunObject,
    pageVar: PageVariable, callback: Function) {
    const self = this;

    // ok, what's the page info on which we're manipulating this relation?
    window.WALconsole.log(pageVar.pageRelations);

    // separate relations can have same name (no rule against that) and same id
    //   (undefined if not yet saved to server), but since we assign unique
    //   names when not saved to server and unique ides when saved to server,
    //   should be rare to have same both.  todo: be more secure in future
    let prinfo = this.getPrinfo(pageVar);
    window.WALconsole.namedLog("prinfo",
      "change prinfo, finding it for getnextrow", this.name, this.id);
    window.WALconsole.namedLog("prinfo", shortPrintString(prinfo));

    // if we haven't seen the frame currently associated with this pagevar, need
    //   to clear our state and start fresh
    if (prinfo === undefined) {
      // TODO: prinfo type sep
      prinfo = {
        currentRows: null,
        currentRowsCounter: 0,
        currentTabId: pageVar.currentTabId(),
        currentNextInteractionAttempts: 0
      };
      this.setPrinfo(pageVar, prinfo);
      window.WALconsole.namedLog("prinfo",
        "change prinfo, prinfo was undefined", this.name, this.id);
      window.WALconsole.namedLog("prinfo", shortPrintString(prinfo));
    }

    // now that we have the page info to manipulate, what do we need to do to get the next row?
    window.WALconsole.log("getnextrow", this, prinfo.currentRowsCounter);
    if ((prinfo.currentRows === null || prinfo.needNewRows) &&
        !prinfo.runNextInteraction) {
      // cool!  no data right now, so we have to go to the page and ask for some
      this.getRowsFromPageVar(runObject, pageVar, callback);
    } else if ((prinfo.currentRows &&
                prinfo.currentRowsCounter + 1 >= prinfo.currentRows.length) ||
              prinfo.runNextInteraction) {
      // have to turn that flag back off so we don't fall back into here after
      //   running the next interaction
      prinfo.runNextInteraction = false;
      self.getNextRowCounter += 1;
      // ok, we had some data but we've run out.  time to try running the next
      //   button interaction and see if we can retrieve some more

      // the one exception, the case where we don't even want to bother asking
      //   the page is if we already know. there's no next button, no way to get
      //   additional pages.  in that case, just know the loop is done and call
      //   the callback with false as the moreRows argument
      if (this.nextType === window.NextTypes.NOMOREITEMS ||
          (!this.nextButtonSelector &&
            this.nextType !== window.NextTypes.SCROLLFORMORE )) {
        callback(false);
        return;
      }

      // the function for continuing once we've done a next interaction
      const continueWithANewPage = () => {
        // cool, and now let's start the process of retrieving fresh items by
        //   calling this function again
        prinfo.needNewRows = true;
        self.getNextRow(runObject, pageVar, callback);
      }

      // here's what we want to do once we've actually clicked on the next
      //   button, more button, etc
      // essentially, we want to run getNextRow again, ready to grab new data
      //   from the page that's now been loaded or updated
      let stopRequestingNext = false;
      window.utilities.listenForMessageOnce("content", "mainpanel",
        "runningNextInteraction", () => {
        const currentGetNextRowCounter = self.getNextRowCounter;
        window.WALconsole.namedLog("getRelationItems", currentGetNextRowCounter,
          "got nextinteraction ack");
        prinfo.currentNextInteractionAttempts += 1;
        window.WALconsole.log("we've tried to run the get next interaction " +
          "again, got an acknowledgment, so now we'll stop requesting next");
        stopRequestingNext = true;
        continueWithANewPage();
      });

      window.utilities.listenForMessageOnce("content", "mainpanel",
        "nextButtonText", (data: NextButtonTextMessage) => {
          self.currNextButtonText = data.text;
      });


      // here's us telling the content script to take care of clicking on the
      //   next button, more button, etc
      if (!pageVar.currentTabId()) {
        window.WALconsole.log("Hey!  How'd you end up trying to click next " +
        "button on a page for which you don't have a current tab id?? " +
        "That doesn't make sense.", pageVar);
      }
      const startRequestNextInteraction = (new Date()).getTime();

      // 2 minutes timeout for when we just try reloading the page;
      //   todo: is this something we even hit?
      const relationFindingTimeout = 120000;
      const sendRunNextInteraction = () => {
        window.WALconsole.log("we're trying to send a next interaction again");
        const currTime = (new Date()).getTime();
        // let's check if we've hit our timeout
        if ((currTime - startRequestNextInteraction) > relationFindingTimeout) {
          // ok, we've crossed the threshold time and the next button still
          //   didn't work.  let's try refreshing the tab
          window.WALconsole.log("we crossed the time out between when we " +
            "started requesting the next interaction and now. " +
            "we're going to try refreshing");
          stopRequestingNext = true;

          const tabId = pageVar.currentTabId();
          if (!tabId) {
            throw new ReferenceError("tabId is undefined.");
          }
          chrome.tabs.get(tabId, () => {
            if (chrome.runtime.lastError) {
              // tab doesn't actually even exist. the only way we could continue
              //   is just restart from the beginning because this is a list
              //   page.  so we just don't know what else to do
              console.log(chrome.runtime.lastError.message);
              window.WALconsole.warn("No idea what to do, so we're breaking" +
                " -- a list page just wasn't present, so didn't know what to" +
                " do next.");
              return;
            } else {
                window.WALconsole.log("refreshing the page now.");
                // Tab exists.  so we can try reloading it, see how it goes
                chrome.tabs.reload(tabId, {}, () => {
                  // ok, good, it's reloaded.  ready to go on with normal
                  //   processing as though this reloaded page is our new page
                  continueWithANewPage();
                });
            }
          });
        }
        // ok, haven't hit the timeout so just keep trying the next interaction
        const currentGetNextRowCounter = self.getNextRowCounter;
        window.WALconsole.namedLog("getRelationItems", currentGetNextRowCounter,
          "requestNext");
        const msg = self.messageRelationRepresentation();
        msg.prior_next_button_text = self.currNextButtonText;
        window.utilities.sendMessage("mainpanel", "content",
          "runNextInteraction", msg, null, null, [ pageVar.currentTabId() ]);};
      window.MiscUtilities.repeatUntil(sendRunNextInteraction,
        () => stopRequestingNext, () => {}, 17000, false);
    } else {
      // we still have local rows that we haven't used yet. just advance the
      //   counter to change which is our current row
      // the easy case :)
      prinfo.currentRowsCounter += 1;
      callback(true);
    }
  }

  public getCurrentNodeRep(pageVar: PageVariable,
    columnObject: ColumnSelector.Interface) {
    const prinfo = pageVar.pageRelations[this.name + "_" + this.id]
    window.WALconsole.namedLog("prinfo",
      "change prinfo, finding it for getCurrentNodeRep", this.name, this.id);
    window.WALconsole.namedLog("prinfo", shortPrintString(prinfo));

    if (prinfo === undefined) {
      window.WALconsole.log("Bad!  Shouldn't be calling getCurrentLink on a " +
        "pageVar for which we haven't yet called getNextRow.");
      return null;
    }
    if (prinfo.currentRows === undefined) {
      window.WALconsole.log("Bad!  Shouldn't be calling getCurrentLink on a " +
        "prinfo with no currentRows.", prinfo);
        return null;
    }
    if (prinfo.currentRows === null) {
      window.WALconsole.namedLog("prinfo", "the bad state");
      return null;
    }
    if (prinfo.currentRows[prinfo.currentRowsCounter] === undefined) {
      window.WALconsole.log("Bad!  Shouldn't be calling getCurrentLink on a " +
        "prinfo with a currentRowsCounter that doesn't correspond to a row " +
        "in currentRows.", prinfo);
      return null;
    }
    if (!columnObject.index) {
      throw new ReferenceError("No column index set.");
    }
    // in the current row, value at the index associated with nodeName
    return prinfo.currentRows[prinfo.currentRowsCounter][columnObject.index];
  }

  public saveToServer() {
    // sample: $($.post('http://localhost:3000/saverelation', { relation: {name: "test", url: "www.test2.com/test-test2", selector: "test2", selector_version: 1, num_rows_in_demonstration: 10}, columns: [{name: "col1", xpath: "a[1]/div[1]", suffix: "div[1]"}] } ));
    
    // note that JSONifyRelation does stable stringification
    const rel = window.ServerTranslationUtilities.JSONifyRelation(this);
    window.MiscUtilities.postAndRePostOnFailure(
      helenaServerUrl + '/saverelation', { relation: rel }, () => {}, false);
  }
}