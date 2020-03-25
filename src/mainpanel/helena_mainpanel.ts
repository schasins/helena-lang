import * as _ from "underscore";
import * as Blockly from "blockly";

import { EventMessage } from "../common/messages";

import { NodeVariable } from "./variables/node_variable";

import { HelenaLangObject } from "./lang/helena_lang";

import { StatementTypes } from "./lang/statements/statement_types";
import { LoadStatement } from "./lang/statements/browser/load";
import { LoopStatement } from "./lang/statements/control_flow/loop";
import { WaitStatement } from "./lang/statements/control_flow/wait";
import { TypeStatement } from "./lang/statements/page_action/type";
import { NodeVariableUse } from "./lang/values/node_variable_use";

import { RecorderUI } from "./ui/recorder_ui";
import { PageVariable } from "./variables/page_variable";
import { HelenaProgram } from "./lang/program";

let statementToEventMapping = {
  mouse: ['click','dblclick','mousedown','mousemove','mouseout','mouseover',
    'mouseup'],
  keyboard: ['keydown','keyup','keypress','textinput','paste','input'],
  dontcare: ['blur']
};

export enum NodeSources {
  RELATIONEXTRACTOR = 1,
  RINGER,
  PARAMETER,
  TEXTRELATION,
};

interface Indexable {
  // cjbaik: This is for the `updateBlocklyBlocks` function.
  // TODO: cjbaik: can we update that function and avoid this index sig?
  [key: string]: any;
}

export class HelenaMainpanel {
  public static toolId = null;

  public static blocklyLabels: {
    [key: string]: string[]
  } = { text: [], numbers: [], other: [] };

  public static blocklyNames: string[] = [];


  // when Blockly blocks are thrown away (in trash cah), you can undo it, but
  //   undoing it doesn't bring back the walstatement property that we add
  //   so...we'll keep track
  public static blocklyToHelenaDict: {
    [key: string]: HelenaLangObject
  } = {};
  
  public static UIObject: RecorderUI;

  constructor(obj: RecorderUI) {
    HelenaMainpanel.UIObject = obj;
    window.Environment.setUIObject(obj);

    // time to apply labels for revival purposes
    for (const prop in HelenaMainpanel) {
      console.error("TODO: cjbaik: fix this reference to pub!");
      if (typeof (<Indexable> HelenaMainpanel)[prop] === "function") {
        window.WALconsole.log("making revival label for ", prop);
        window.Revival.introduceRevivalLabel(prop,
          (<Indexable> HelenaMainpanel)[prop]);
      }
    }

    // make one so we'll add the blocklylabel
    new WaitStatement();
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

  public static resetForNewScript() {
    // if the user is going to be starting a fresh script, it shouldn't be
    //   allowed to use variables from a past script or scripts
    window.allNodeVariablesSeenSoFar = [];
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

  // helper function. returns the StatementType (see above) that we should
  //   associate with the argument event, or null if the event is invisible
  public static statementType(ev: EventMessage) {
    if (ev.type === "completed" || ev.type === "manualload" ||
        ev.type === "webnavigation") {
      if (!window.EventM.getVisible(ev)) {
        return null; // invisible, so we don't care where this goes
      }
      return StatementTypes.LOAD;
    } else if (ev.type === "dom") {
      if (statementToEventMapping.dontcare.indexOf(ev.data.type) > -1) {
        return null; // who cares where blur events go
      }
      let lowerXPath = ev.target.xpath.toLowerCase();
      if (lowerXPath.indexOf("/select[") > -1) {
        // this was some kind of interaction with a pulldown, so we have something special for this
        return StatementTypes.PULLDOWNINTERACTION;
      } else if (statementToEventMapping.mouse.includes(ev.data.type)) {
        if (ev.additional.scrape) {
          if (ev.additional.scrape.linkScraping) {
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

  public static firstVisibleEvent(trace: EventMessage[]) {
    for (const ev of trace) {
      const st = HelenaMainpanel.statementType(ev);
      if (st !== null) {
        return ev;
      }
    }
    throw new ReferenceError("No visible events in trace!");
  }

  public static makeOpsDropdown(ops: { [key: string]: Function}) {
    const opsDropdown = [];
    for (const key in ops) {
      opsDropdown.push([key, key]);
    }
    return opsDropdown;
  }

  public static makeNodeVariableForTrace(trace: EventMessage[]) {
    let recordTimeNodeSnapshot = null;
    let imgData = null;
    if (trace.length > 0) { // may get 0-length trace if we're just adding a scrape statement by editing (as for a known column in a relation)
      var ev = trace[0]; // 0 bc this is the first ev that prompted us to turn it into the given statement, so must use the right node
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

  public static cleanTrace(trace: EventMessage[]) {
    const cleanTrace = [];
    for (const event of trace) {
      cleanTrace.push(cleanEvent(event));
    }
    return cleanTrace;
  }

  public static addToolboxLabel(label: string, category = "other") {
    HelenaMainpanel.blocklyLabels[category].push(label);
    HelenaMainpanel.blocklyLabels[category] =
      [...new Set(HelenaMainpanel.blocklyLabels[category])];
  }

  public static attachToPrevBlock(currBlock: Blockly.Block,
      prevBlock: Blockly.Block) {
    if (currBlock && prevBlock) {
      const prevBlockConnection = prevBlock.nextConnection;
      const thisBlockConnection = currBlock.previousConnection;
      prevBlockConnection.connect(thisBlockConnection);
    } else {
      window.WALconsole.warn("Woah, tried to attach to a null prevBlock!");
    }
  }

  // for things like loops that have bodies, attach the nested blocks
  public static attachNestedBlocksToWrapper(wrapperBlock: Blockly.Block | null,
      firstNestedBlock: Blockly.Block | null) {
    if (!wrapperBlock || !firstNestedBlock) {
      window.WALconsole.warn("Woah, tried attachNestedBlocksToWrapper with",
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
      window.WALconsole.warn("Woah, tried attachToInput with", leftBlock,
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
      window.WALconsole.warn("Woah, tried attachInputToOutput with", leftBlock,
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

  public static blocklySeqToHelenaSeq(blocklyBlock: Blockly.Block):
      HelenaLangObject[] {
    if (!blocklyBlock) {
      return [];
    }
    
    // grab the associated helena component and call the getHelena method
    const thisNodeHelena = HelenaMainpanel.getHelenaStatement(blocklyBlock).getHelena();
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
    const suffix = HelenaMainpanel.blocklySeqToHelenaSeq(nextBlocklyBlock);
    return helenaSeqForThisBlock.concat(suffix);
  }

  public static getHelenaFromBlocklyRoot(blocklyBlock: Blockly.Block) {
    return HelenaMainpanel.blocklySeqToHelenaSeq(blocklyBlock);
  }

  public static getInputSeq(blocklyBlock: Blockly.Block, inputName: string) {
    const nextBlock = blocklyBlock.getInput(inputName).connection.targetBlock();
    if (!nextBlock) {
      return [];
    }
    return (<NodeVariableUse> HelenaMainpanel.getHelenaStatement(nextBlock)).getHelenaSeq();
  }

  public static setHelenaStatement(block: Blockly.Block, WALEquiv: HelenaLangObject) {
    let helenaBlock = <HelenaBlock> block;
    helenaBlock.helena = WALEquiv;
    WALEquiv.block = helenaBlock;
    HelenaMainpanel.blocklyToHelenaDict[block.id] = WALEquiv;
  }

  public static getHelenaStatement(block: Blockly.Block): HelenaLangObject {
    let helenaBlock = <HelenaBlock> block;
    if (!helenaBlock.helena) {
      helenaBlock.helena = HelenaMainpanel.blocklyToHelenaDict[helenaBlock.id];
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

  public static firstScrapedContentEventInTrace(trace: EventMessage[]) {
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

  public static getNodeVariableByName(name: string) {
    for (const nodeVar of window.allNodeVariablesSeenSoFar) {
      if (nodeVar.getName() === name) {
        return nodeVar;
      }
    }
    throw new ReferenceError("Invalid NodeVariable name.");
  }

  public static updateBlocklyBlocks(program: HelenaProgram | null) {
    // have to update the current set of blocks based on our pageVars,
    //   relations, so on

    // this is silly, but just making a new object for each of our statements is
    //   an easy way to get access to the updateBlocklyBlock function and still
    //   keep it an instance method/right next to the genBlockly function
    const toolBoxBlocks = ["Number", "NodeVariableUse", "String", "Concatenate",
      "IfStatement", "WhileStatement", "ContinueStatement", "BinOpString",
      "BinOpNum", "LengthString", "BackStatement", "ClosePageStatement",
      "WaitStatement", "WaitUntilUserReadyStatement", "SayStatement"];
    
    // let's also add in other nodes which may not have been used in programs
    // so far, but which we want to include in the toolbox no matter what
    const origBlocks = HelenaMainpanel.blocklyNames;
    const allDesiredBlocks = origBlocks.concat(toolBoxBlocks);

    for (const prop of allDesiredBlocks) {
      if (typeof (<Indexable> HelenaMainpanel)[prop] === "function") {
          try {
            console.error("TODO: cjbaik: fix this reference to `pub`");
            let obj = new (<Indexable> HelenaMainpanel)[prop]();

            if (obj && obj.updateBlocklyBlock) {
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
    }

    // let's just warn about what things (potentially blocks!) aren't being
    //   included
    for (const prop in HelenaMainpanel) {
      if (!allDesiredBlocks.includes(prop)) {
        window.WALconsole.log("NOT INCLUDING PROP:", prop);
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

function cleanEvent(ev: EventMessage): EventMessage {
  const displayData = window.EventM.getDisplayInfo(ev);
  window.EventM.clearDisplayInfo(ev);
  const cleanEvent = clone(ev);
  // now restore the true trace object
  window.EventM.setDisplayInfo(ev, displayData);
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