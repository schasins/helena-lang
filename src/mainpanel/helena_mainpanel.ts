import * as _ from "underscore";
import * as Blockly from "blockly";

import { EventMessage } from "../common/messages";

import { NodeVariable } from "./variables/node_variable";

import { GenericRelation } from "./relation/generic";
import { TextRelation } from "./relation/text_relation";

import { HelenaLangObject } from "./lang/helena_lang";

import { StatementTypes } from "./lang/statements/statement_types";
import { LoadStatement } from "./lang/statements/browser/load";
import { LoopStatement } from "./lang/statements/control_flow/loop";
import { WaitStatement } from "./lang/statements/control_flow/wait";
import { PulldownInteractionStatement } from "./lang/statements/page_action/pulldown_interaction";
import { TypeStatement } from "./lang/statements/page_action/type";

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

  public static nodeRepresentation(stmt: HelenaLangObject,
    linkScraping = false) {
    if (stmt.currentNode instanceof NodeVariable) {
      // todo: this isn't really correct.  we could reuse a node scraped or
      //   clicked before, and then it would be bound already.  fix this.
      const alreadyBound =
        stmt.currentNode.getSource() === NodeSources.RELATIONEXTRACTOR;
      let nodeRep = stmt.currentNode.toString(alreadyBound, stmt.pageVar);
      if (linkScraping) {
        nodeRep += ".link";
      }
      return nodeRep;
    }
    if (stmt.trace[0].additional.visualization === "whole page") {
      return "whole page";
    }
    if (linkScraping) {
      // we don't have a better way to visualize links than just giving text
      return stmt.trace[0].additional.scrape.link;
    }
    return `<img src='${stmt.trace[0].additional.visualization}'` +
      " style='max-height: 150px; max-width: 350px;'>";
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

  public static outputPagesRepresentation(statement: HelenaLangObject) {
    let prefix = "";
    if (statement.outputPageVars.length > 0) {
      prefix = statement.outputPageVars.map(
        (pv) => pv.toString()
      ).join(", ") + " = ";
    }
    return prefix;
  }

  // returns true if we successfully parameterize this node with this relation,
  //   false if we can't
  public static parameterizeNodeWithRelation(statement: HelenaLangObject,
      relation: GenericRelation, pageVar: PageVariable) {
    // note: may be tempting to use the columns' xpath attributes to decide
    //   this, but this is not ok!  now that we can have mutliple suffixes
    //   associated with a column, that xpath is not always correct but we're
    //   in luck because we know the selector has just been applied to the
    //   relevant page (to produce relation.demonstrationTimeRelation and from
    //   that relation.firstRowXpaths) so we can learn from those attributes
    //   which xpaths are relevant right now, and thus which ones the user would
    //   have produced in the current demo
    
    // if the relation is a text relation, we actually don't want to do the
    //   below, because it doesn't represent nodes, only texts
    if (relation instanceof TextRelation) {
      return null;
    }

    // hey, this better be in the same order as relation.columns and
    //   relation.firstRowXpaths!
    // todo: maybe add some helper functions to get rid of this necessity? since
    //   it may not be clear in there...
    const nodeRepresentations = relation.firstRowNodeRepresentations();

    for (let i = 0; i < relation.firstRowXPaths.length; i++) {
      const firstRowXpath = relation.firstRowXPaths[i];
      if (firstRowXpath === statement.origNode || 
          (statement instanceof PulldownInteractionStatement &&
            firstRowXpath.indexOf(statement.origNode) > -1)) {
        statement.relation = relation;
        const name = relation.columns[i].name;
        var nodeRep = nodeRepresentations[i];

        // not ok to just overwrite currentNode, because there may be multiple
        //   statements using the old currentNode, and becuase we're interested
        //   in keeping naming consistent, they should keep using it so...just
        //   overwrite some things
        if (!statement.currentNode) {
          // have to check if there's a current node because if we're dealing
          //   with pulldown menu there won't be
          statement.currentNode = new NodeVariable();
        }
        statement.currentNode.setName(name? name : null);
        statement.currentNode.nodeRep = nodeRep;
        statement.currentNode.setSource(NodeSources.RELATIONEXTRACTOR);
        // statement.currentNode = new NodeVariable(name, nodeRep, null, null,
        //   NodeSources.RELATIONEXTRACTOR); // note that this means the
        //   elements in the firstRowXPaths and the elements in columns must be
        //   aligned!
        // ps. in theory the above commented out line should have just worked
        //   because we could search all prior nodes to see if any is the same
        //   but we just extracted the relation from a fresh run of the script,
        //   so any of the attributes we use (xpath, text, or even in some cases
        //   url) could have changed, and we'd try to make a new node, and mess
        //   it up since we know we want to treat this as the same as a prior
        //   one, better to just do this

        // the statement should track whether it's currently parameterized for a
        //   given relation and column obj
        statement.relation = relation;
        statement.columnObj = relation.columns[i];

        return relation.columns[i]; 
      }
    }
    return null;
  }

  public static unParameterizeNodeWithRelation(statement: HelenaLangObject,
    relation: GenericRelation) {
    if (statement.relation === relation) {
      statement.relation = null;
      statement.columnObj = null;
      const columnObject = statement.columnObj;
      statement.columnObj = null;
      statement.currentNode = HelenaMainpanel.makeNodeVariableForTrace(
        statement.trace);
      return columnObject;
    }
    return null;
  }

  public static currentNodeXpath(statement: HelenaLangObject,
      environment: EnvironmentPlaceholder) {
    if (statement.currentNode instanceof NodeVariable) {
      return statement.currentNode.currentXPath(environment);
    }
    // this means currentNode better be an xpath if it's not a variable use!
    return statement.currentNode;
  }

  public static currentTab(statement: HelenaLangObject) {
    return statement.pageVar.currentTabId();
  }

  public static originalTab(statement: HelenaLangObject) {
    return statement.pageVar.originalTabId();
  }

  public static cleanTrace(trace: EventMessage[]) {
    const cleanTrace = [];
    for (const event of trace) {
      cleanTrace.push(cleanEvent(event));
    }
    return cleanTrace;
  }

  public static requireFeatures(statement: HelenaLangObject,
      featureNames: string[]) {
    if (featureNames.length > 0) { 
      if (!statement.node) {
        // sometimes statement.node will be empty, as when we add a scrape
        //   statement for known relation item, with no trace associated 
        window.WALconsole.warn("Hey, you tried to require some features, but " +
          "there was no Ringer trace associated with the statement.", statement,
          featureNames);
      }
      // note that statement.node stores the xpath of the original node
      window.ReplayTraceManipulation.requireFeatures(statement.trace,
        statement.node, featureNames);
      window.ReplayTraceManipulation.requireFeatures(statement.cleanTrace,
        statement.node, featureNames);
    }
  }

  public static setBlocklyLabel(obj: HelenaLangObject, label: string) {
    //console.log("setBlocklyLabel", obj, label, obj.___revivalLabel___);
    obj.blocklyLabel = label;

    // it's important that we keep track of what things within the
    //   HelenaMainpanel object are blocks and which aren't
    // this may be a convenient way to do it, since it's going to be obvious if
    //   you introduce a new block but forget to call this whereas if you
    //   introduce a new function and forget to add it to a blacklist, it'll get
    //   called randomly, will be hard to debug
    const name = obj.___revivalLabel___;
    HelenaMainpanel.blocklyNames.push(name);
    HelenaMainpanel.blocklyNames = [...new Set(HelenaMainpanel.blocklyNames)];
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

  public static helenaSeqToBlocklySeq(statementsLs: HelenaLangObject[],
    workspace: Blockly.Workspace) {
    // get the individual statements to produce their corresponding blockly
    //   blocks

    // the one we'll ultimately return, in case it needs to be attached to
    //   something outside
    let firstNonNull = null;

    let lastBlock = null;
    let lastStatement = null;

    let invisibleHead = [];

    // for (var i = 0; i < statementsLs.length; i++) {
    for (const statement of statementsLs) {
      const newBlock: Blockly.Block = statement.genBlocklyNode(lastBlock,
        workspace);
      // within each statement, there can be other program components that will
      //   need blockly representations but the individual statements are
      //   responsible for traversing those
      if (newBlock !== null) {
        // handle the fact that there could be null-producing nodes in the
        //   middle, and need to connect around those
        lastBlock = newBlock;
        lastStatement = statement;
        lastStatement.invisibleHead = [];
        lastStatement.invisibleTail = [];
        // also, if this is our first non-null block it's the one we'll want to
        //   return
        if (!firstNonNull) {
          firstNonNull = newBlock;
          // oh, and let's go ahead and set that invisible head now
          statement.invisibleHead = invisibleHead;
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
        statement.nullBlockly = true;

        // one special case.  if we don't have a non-null lastblock, we'll have
        //   to keep this for later
        // we prefer to make things tails of earlier statements, but we can make
        //   some heads if necessary
        if (!lastBlock || !lastStatement) {
          invisibleHead.push(statement);
        } else {
          lastStatement.invisibleTail.push(statement);
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
    const thisNodeHelena = HelenaMainpanel.getWAL(blocklyBlock).getHelena();
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
    return HelenaMainpanel.getWAL(nextBlock).getHelenaSeq();
  }

  public static setWAL(block: Blockly.Block, WALEquiv: HelenaLangObject) {
    let helenaBlock = <HelenaBlock> block;
    helenaBlock.helena = WALEquiv;
    WALEquiv.block = helenaBlock;
    HelenaMainpanel.blocklyToHelenaDict[block.id] = WALEquiv;
  }

  public static getWAL(block: Blockly.Block): HelenaLangObject {
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

  public static usedByTextStatement(statement: HelenaLangObject,
      parameterizeableStrings: (string | null)[]) {
    if (!parameterizeableStrings) {
      return false;
    }

    if (!(statement instanceof TypeStatement ||
          statement instanceof LoadStatement)) {
      return false;
    }

    for (const curString of parameterizeableStrings) {
      if (!curString) continue;

      const lowerString = curString.toLowerCase();
      if (statement.typedStringLower?.includes(lowerString)) {
        // for typestatement
        return true;
      }

      if (statement.cUrl) {
        const currURL = statement.cUrl();
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