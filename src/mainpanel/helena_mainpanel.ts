import * as _ from "underscore";
import * as Blockly from "blockly";

import { HelenaConsole } from "../common/utils/helena_console";

import { NodeVariable } from "./variables/node_variable";

import { HelenaLangObject } from "./lang/helena_lang";

import { LoadStatement } from "./lang/statements/browser/load";
import { LoopStatement } from "./lang/statements/control_flow/loop";
import { WaitStatement } from "./lang/statements/control_flow/wait";
import { TypeStatement } from "./lang/statements/page_action/type";
import { NodeVariableUse } from "./lang/values/node_variable_use";

import { RecorderUI } from "./ui/recorder_ui";
import { PageVariable } from "./variables/page_variable";
import { HelenaProgram, RunObject } from "./lang/program";
import { Revival } from "./revival";
import { Relation } from "./relation/relation";
import { TextRelation } from "./relation/text_relation";
import { Concatenate } from "./lang/values/concatenate";
import { HelenaNumber } from "./lang/values/number";
import { HelenaString } from "./lang/values/string";
import { BackStatement } from "./lang/statements/browser/back";
import { ClosePageStatement } from "./lang/statements/browser/close_page";
import { SkipBlock } from "./lang/statements/control_flow/skip_block";
import { ClickStatement } from "./lang/statements/page_action/click";
import { PulldownInteractionStatement } from "./lang/statements/page_action/pulldown_interaction";
import { ScrapeStatement } from "./lang/statements/page_action/scrape";
import { OutputRowStatement } from "./lang/statements/output_row";
import { Trace, Traces, DisplayTraceEvent } from "../common/utils/trace";
import { Environment } from "./environment";
import { DOMRingerEvent } from "../ringer-record-replay/common/event";
import { Utilities } from "../ringer-record-replay/common/utils";
import { Messages } from "../common/messages";

export enum NodeSources {
  RELATIONEXTRACTOR = 1,
  RINGER,
  PARAMETER,
  TEXTRELATION,
};

interface HelenaBlock extends Blockly.Block {
  helena: HelenaLangObject;
}

export class HelenaMainpanel {
  public static revivable: {
    [key: string]: Revival.Prototype
  } = {
    "NodeVariable": NodeVariable,
    "PageVariable": PageVariable,
    "Relation": Relation,
    "TextRelation": TextRelation,
    "HelenaProgram": HelenaProgram,
    "Concatenate": Concatenate,
    "NodeVariableUse": NodeVariableUse,
    "HelenaNumber": HelenaNumber,
    "HelenaString": HelenaString,
    "BackStatement": BackStatement,
    "ClosePageStatement": ClosePageStatement,
    "LoadStatement": LoadStatement,
    "LoopStatement": LoopStatement,
    "SkipBlock": SkipBlock,
    "WaitStatement": WaitStatement,
    "ClickStatement": ClickStatement,
    "PulldownInteractionStatement": PulldownInteractionStatement,
    "ScrapeStatement": ScrapeStatement,
    "TypeStatement": TypeStatement,
    "OutputRowStatement": OutputRowStatement
  };
  
  public allNodeVariablesSeenSoFar: NodeVariable[];
  public blocklyLabels: {
    [key: string]: string[]
  } = { text: [], numbers: [], other: [] };
  public currentReplayWindowId: number | null;
  public currentRunObjects: RunObject[];

  public blocklyNames: string[] = [];
  
  // when Blockly blocks are thrown away (in trash cah), you can undo it, but
  //   undoing it doesn't bring back the walstatement property that we add
  //   so...we'll keep track
  public blocklyToHelenaDict: {
    [key: string]: HelenaLangObject
  } = {};
  public demoMode: boolean;

  public recordingWindowIds: number[];
  public toolId = null;
  public UIObject: RecorderUI;

  constructor(obj: RecorderUI) {
    this.allNodeVariablesSeenSoFar = [];
    this.currentReplayWindowId = null;
    this.currentRunObjects = [];
    this.demoMode = false;
    this.recordingWindowIds = [];

    this.addMessageListeners();

    this.UIObject = obj;
    Environment.setUIObject(obj);

    // time to apply labels for revival purposes
    for (const prop in HelenaMainpanel.revivable) {
      HelenaConsole.log("making revival label for ", prop);
      Revival.introduceRevivalLabel(prop, HelenaMainpanel.revivable[prop]);
    }

    // make one so we'll add the blocklylabel
    new WaitStatement();
  }

  private addMessageListeners() {
    Messages.listenForMessage("content", "mainpanel",
      "currentReplayWindowId", () => {
        Messages.sendMessage("mainpanel", "content",
          "currentReplayWindowId", { window: this.currentReplayWindowId });
      }
    );
  }

  // some of the things we do within the objects that represent the programs,
  //   statements, and expressions should update the UI object that's serving
  //   as the IDE.  the UI object should implement all of these functions, or
  //   whatever subset of them the user will be able to trigger by using the
  //   Helena language as the interface allows:
  /*
    UIObject.updateDisplayedScript(bool updateBlockly)
    UIObject.updateDisplayedRelations(bool stillInProgress)
    UIObject.addNewRowToOutput(str idOfProgramRunTab, array displayTextCells)
    UIObject.updateRowsSoFar(str idOfProgramRunTab, int fullDatasetLength)
    UIObject.addDialog(str title, str dialogText, dict buttonTextToHandlers)
    UIObject.showRelationEditor(Relation rel, int chromeTabId)
    UIObject.continueAfterDialogue(str text, str buttonText, cont continuation)
    Tab tab = UIObject.newRunTab(RunObject ro)
  */

  public resetForNewScript() {
    // if the user is going to be starting a fresh script, it shouldn't be
    //   allowed to use variables from a past script or scripts
    this.allNodeVariablesSeenSoFar = [];
  }

  // it's ok to just run with this unless you want to only load programs
  //   associated with your own helena-using tool
  /*
  public static setHelenaToolId(tid) {
    HelenaMainpanel.toolId = tid;
    console.log("Setting toolId", HelenaMainpanel.toolId);
  }
  public static getHelenaToolId() {
    return HelenaMainpanel.toolId;
  }
  */

  public static makeOpsDropdown(ops: { [key: string]: Function}) {
    const opsDropdown = [];
    for (const key in ops) {
      opsDropdown.push([key, key]);
    }
    return opsDropdown;
  }

  public static makeNodeVariableForTrace(trace: Trace) {
    let recordTimeNodeSnapshot = null;
    let imgData = null;
    // may get 0-length trace if we're just adding a scrape statement by editing
    //   (as for a known column in a relation)
    if (trace.length > 0) {
      // 0 bc this is the first ev that prompted us to turn it into the given
      //   statement, so must use the right node
      const ev = <DOMRingerEvent> trace[0];
      recordTimeNodeSnapshot = ev.target.snapshot;
      imgData = ev.additional.visualization;
    }
    return new NodeVariable(null, null, recordTimeNodeSnapshot, imgData,
      NodeSources.RINGER); // null bc no preferred name
  }

  public static urlMatch(text: string, currentUrl: string) {
    return urlMatchSymmetryHelper(text, currentUrl) ||
           urlMatchSymmetryHelper(currentUrl, text);
  }

  public static cleanTrace(trace: Trace) {
    const cleanTrace = [];
    for (const event of trace) {
      cleanTrace.push(cleanEvent(<DisplayTraceEvent> event));
    }
    return cleanTrace;
  }

  public addToolboxLabel(label: string, category = "other") {
    this.blocklyLabels[category].push(label);
    this.blocklyLabels[category] =
      [...new Set(this.blocklyLabels[category])];
  }

  public static attachToPrevBlock(currBlock: Blockly.Block,
      prevBlock: Blockly.Block) {
    if (currBlock && prevBlock) {
      const prevBlockConnection = prevBlock.nextConnection;
      const thisBlockConnection = currBlock.previousConnection;
      prevBlockConnection.connect(thisBlockConnection);
    } else {
      HelenaConsole.warn("Woah, tried to attach to a null prevBlock!");
    }
  }

  // for things like loops that have bodies, attach the nested blocks
  public static attachNestedBlocksToWrapper(wrapperBlock: Blockly.Block | null,
      firstNestedBlock: Blockly.Block | null) {
    if (!wrapperBlock || !firstNestedBlock) {
      HelenaConsole.warn("Woah, tried attachNestedBlocksToWrapper with",
        wrapperBlock, firstNestedBlock);
      return;
    }
    const parentConnection = wrapperBlock.getInput('statements').connection;
    const childConnection = firstNestedBlock.previousConnection;
    parentConnection.connect(childConnection);
  }

  public static attachToInput(leftBlock: Blockly.Block,
      rightBlock: Blockly.Block, name: string) {
    if (!leftBlock || !rightBlock || !name) {
      HelenaConsole.warn("Woah, tried attachToInput with", leftBlock,
        rightBlock, name);
      return;
    }
    const parentConnection = leftBlock.getInput(name).connection;
    const childConnection = rightBlock.outputConnection;
    parentConnection.connect(childConnection);
  }

  public static attachInputToOutput(leftBlock: Blockly.Block,
      rightBlock: Blockly.Block) {
    if (!leftBlock || !rightBlock) {
      HelenaConsole.warn("Woah, tried attachInputToOutput with", leftBlock,
        rightBlock);
      return;
    }
    const outputBlockConnection = rightBlock.outputConnection;
    const inputBlockConnection = leftBlock.inputList[0].connection;
    outputBlockConnection.connect(inputBlockConnection);
  }

  public static helenaSeqToBlocklySeq(stmts: HelenaLangObject[],
    workspace: Blockly.WorkspaceSvg) {
    // get the individual statements to produce their corresponding blockly
    //   blocks

    // the one we'll ultimately return, in case it needs to be attached to
    //   something outside
    let firstNonNull = null;

    let lastBlock = null;
    let lastStatement = null;

    let invisibleHead = [];

    // for (var i = 0; i < statementsLs.length; i++) {
    for (const stmt of stmts) {
      const newBlock = stmt.genBlocklyNode(lastBlock, workspace);
      // within each statement, there can be other program components that will
      //   need blockly representations but the individual statements are
      //   responsible for traversing those
      if (newBlock !== null) {
        // handle the fact that there could be null-producing nodes in the
        //   middle, and need to connect around those
        lastBlock = newBlock;
        lastStatement = stmt;
        lastStatement.invisibleHead = [];
        lastStatement.invisibleTail = [];
        // also, if this is our first non-null block it's the one we'll want to
        //   return
        if (!firstNonNull) {
          firstNonNull = newBlock;
          // oh, and let's go ahead and set that invisible head now
          stmt.invisibleHead = invisibleHead;
        }
      } else {
        // ok, a little bit of special stuff when we do have null nodes
        // we want to still save them, even though we'll be using the blockly
        //   code to generate future versions of the program so we'll need to
        //   associate these invibislbe statements with others and then the only
        //   thing we'll need to do is when we go the other direction
        //   (blockly->helena)
        // we'll have to do some special processing to put them back in the
        //   normal structure
        stmt.nullBlockly = true;

        // one special case.  if we don't have a non-null lastblock, we'll have
        //   to keep this for later
        // we prefer to make things tails of earlier statements, but we can make
        //   some heads if necessary
        if (!lastBlock || !lastStatement) {
          invisibleHead.push(stmt);
        } else {
          lastStatement.invisibleTail?.push(stmt);
        }
      }
    }

    if (!firstNonNull) {
      throw new ReferenceError("Did not find any non-null blocks.");
    }

    return firstNonNull;
    // todo: the whole invisible head, invisible tail thing isn't going to be
    //   any good if we have no visible statements in this segment.  So rare
    //   that spending time on it now is probably bad, but should be considered
    //   eventually
  }

  public static getLoopIterationCounters(stmt: HelenaLangObject) {
    return getLoopIterationCountersHelper(stmt, []);
  }

  public blocklySeqToHelenaSeq(blocklyBlock: Blockly.Block):
      HelenaLangObject[] {
    if (!blocklyBlock) {
      return [];
    }
    
    // grab the associated helena component and call the getHelena method
    const thisNodeHelena = this.getHelenaStatement(blocklyBlock).getHelena();
    let invisibleHead = thisNodeHelena.invisibleHead;
    if (!invisibleHead) {invisibleHead = [];}
    let invisibleTail = thisNodeHelena.invisibleTail;
    if (!invisibleTail) {invisibleTail = [];}
    const helenaSeqForThisBlock =
      (invisibleHead.concat(thisNodeHelena)).concat(invisibleTail);

    const nextBlocklyBlock = blocklyBlock.getNextBlock();
    if (!nextBlocklyBlock) {
      return helenaSeqForThisBlock;
    }
    const suffix = this.blocklySeqToHelenaSeq(nextBlocklyBlock);
    return helenaSeqForThisBlock.concat(suffix);
  }

  public static getHelenaFromBlocklyRoot(blocklyBlock: Blockly.Block) {
    return window.helenaMainpanel.blocklySeqToHelenaSeq(blocklyBlock);
  }

  public getInputSeq(blocklyBlock: Blockly.Block, inputName: string) {
    const nextBlock = blocklyBlock.getInput(inputName).connection.targetBlock();
    if (!nextBlock) {
      return [];
    }
    return (<NodeVariableUse> this.getHelenaStatement(nextBlock)).getHelenaSeq();
  }

  public setHelenaStatement(block: Blockly.Block,
      helenaStmt: HelenaLangObject) {
    let helenaBlock = <HelenaBlock> block;
    helenaBlock.helena = helenaStmt;
    helenaStmt.block = helenaBlock;
    this.blocklyToHelenaDict[block.id] = helenaStmt;
  }

  public getHelenaStatement(block: Blockly.Block): HelenaLangObject {
    let helenaBlock = <HelenaBlock> block;
    if (!helenaBlock.helena) {
      helenaBlock.helena = this.blocklyToHelenaDict[helenaBlock.id];
      if (helenaBlock.helena) {
        helenaBlock.helena.block = helenaBlock;
        // the above line may look silly but when blockly drops blocks into the
        //   trashcan, they're restored with the same id but with a fresh object
        //   and the fresh object doesn't have WAL stored anymore, which is why
        //   we have to look in the dict but that also means the block object
        //   stored by the wal object is out of date, must be refreshed
      }
    }
    return helenaBlock.helena;
  }

  public static firstScrapedContentEventInTrace(trace: Trace) {
    for (const event of trace) {
      if (event.additional && event.additional.scrape &&
          event.additional.scrape.text) {
        return event;
      }
    }
    return null;
  }

  public static usedByTextStatement(stmt: HelenaLangObject,
      parameterizeableStrings: (string | null)[]) {
    if (!parameterizeableStrings) {
      return false;
    }

    if (!(stmt instanceof TypeStatement ||
          stmt instanceof LoadStatement)) {
      return false;
    }

    for (const curString of parameterizeableStrings) {
      if (!curString) continue;

      const lowerString = curString.toLowerCase();
      if (stmt instanceof TypeStatement &&
          stmt.typedStringLower?.includes(lowerString)) {
        // for typestatement
        return true;
      }

      if (stmt instanceof LoadStatement) {
        const currURL = stmt.cUrl();
        if (currURL &&
            HelenaMainpanel.urlMatch(currURL.toLowerCase(), lowerString)) {
          // for loadstatement
          return true;
        }
      }
    }
    return false;
  }

  public getNodeVariableByName(name: string) {
    for (const nodeVar of this.allNodeVariablesSeenSoFar) {
      if (nodeVar.getName() === name) {
        return nodeVar;
      }
    }
    throw new ReferenceError("Invalid NodeVariable name.");
  }

  /**
   * Updates blocks available for the toolbox based on our pageVars, relations,
   *   and so on.
   * @param program 
   */
  public updateToolboxBlocks(program: HelenaProgram | null) {
    // this is silly, but just making a new object for each of our statements is
    //   an easy way to get access to the updateBlocklyBlock function and still
    //   keep it an instance method/right next to the genBlockly function
    // const toolBoxBlocks = ["Number", "NodeVariableUse", "String", "Concatenate",
    //   "IfStatement", "WhileStatement", "ContinueStatement", "BinOpString",
    //   "BinOpNum", "LengthString", "BackStatement", "ClosePageStatement",
    //   "WaitStatement", "WaitUntilUserReadyStatement", "SayStatement"];
    
    const toolBoxBlocks = ["HelenaNumber", "NodeVariableUse", "HelenaString",
      "Concatenate", "BackStatement", "ClosePageStatement", "WaitStatement"];
    
    // let's also add in other nodes which may not have been used in programs
    // so far, but which we want to include in the toolbox no matter what
    const origBlocks = this.blocklyNames;
    const allDesiredBlocks = origBlocks.concat(toolBoxBlocks);
    for (const prop of allDesiredBlocks) {
      try {
        let obj = new HelenaMainpanel.revivable[prop]();

        if (obj && obj instanceof HelenaLangObject) {
          if (program) {
            obj.updateBlocklyBlock(program, program.pageVars,
              program.relations)
          } else {
            obj.updateBlocklyBlock();
          }
        }
      } catch(err) {
        console.log("Couldn't create new object for prop:", prop,
          "probably by design.");
        console.log(err);
      }
    }

    // let's just warn about what things (potentially blocks!) aren't being
    //   included
    for (const prop in HelenaMainpanel.revivable) {
      if (!allDesiredBlocks.includes(prop)) {
        HelenaConsole.log("NOT INCLUDING PROP:", prop);
      }
    }
    return;
  }

  public static makeVariableNamesDropdown(prog: HelenaProgram) {
    const varNames = prog.getAllVariableNames();
    const varNamesDropDown = [];
    for (const varName of varNames) {
      varNamesDropDown.push([varName, varName]);
    }
    return varNamesDropDown;
  }

  public static makePageVarsDropdown(pageVars: PageVariable[]) {
    let pageVarsDropDown = [];
    for (const pageVar of pageVars) {
      const pageVarStr = pageVar.toString();
      pageVarsDropDown.push([pageVarStr, pageVarStr]);
    }
    return pageVarsDropDown;
  }
}

/*
function makeRelationsDropdown(relations) {
  var relationsDropDown = [];
  for (var i = 0; i < relations.length; i++) {
    var relationStr = relations[i].name;
    relationsDropDown.push([relationStr, relationStr]);
  }
  return relationsDropDown;
}*/

function urlMatchSymmetryHelper(t1: string, t2: string) {
  // todo: there might be other ways that we could match the url. don't need to
  //   match the whole thing
  
  // don't need www, etc, any lingering bits on the end that get added...
  if (t1.replace("http://", "https://") === t2) {
    return true;
  }
  return false;
}

function cleanEvent(ev: DisplayTraceEvent): DisplayTraceEvent {
  const displayData = Traces.getDisplayInfo(ev);
  Traces.clearDisplayInfo(ev);
  const cleanEvent = Utilities.clone(ev);
  // now restore the true trace object
  Traces.setDisplayInfo(ev, displayData);
  return cleanEvent;
}

function getLoopIterationCountersHelper(s: HelenaLangObject, acc: number[]):
    number[] {
  if (s === null || s === undefined) {
    return acc;
  }
  if (s instanceof LoopStatement) {
    acc.unshift(s.rowsSoFar);
  }
  return getLoopIterationCountersHelper(s.parent, acc);
}