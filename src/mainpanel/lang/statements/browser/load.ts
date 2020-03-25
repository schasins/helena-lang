import * as Blockly from "blockly";

import { HelenaMainpanel } from "../../../helena_mainpanel";

import { NodeVariable } from "../../../variables/node_variable";
import { NodeVariableUse } from "../../values/node_variable_use";

import { HelenaLangObject } from "../../helena_lang";

import { String } from "../../values/string";
import { Concatenate } from "../../values/concatenate";

import { EventMessage } from "../../../../common/messages";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { RunObject, HelenaProgram, RunOptions,
  TraceContributions } from "../../program";

export class LoadStatement extends HelenaLangObject {
  public cleanTrace: EventMessage[];
  public contributesTrace?: TraceContributions;
  public currentUrl: string | String | NodeVariable | NodeVariableUse |
    Concatenate | null;
  public outputPageVar: PageVariable;
  public outputPageVars: PageVariable[];
  public relation: GenericRelation | null;
  public trace: EventMessage[];
  public url: string;

  constructor(trace: EventMessage[]) {
    super();
    window.Revival.addRevivalLabel(this);
    HelenaMainpanel.setBlocklyLabel(this, "load");

    this.trace = trace;

    // find the record-time constants that we'll turn into parameters
    const ev = HelenaMainpanel.firstVisibleEvent(trace);
    this.url = ev.data.url;
    this.outputPageVar = window.EventM.getLoadOutputPageVar(ev);

    // this will make it easier to work with for other parts of the code
    this.outputPageVars = [ this.outputPageVar ];

    // for now, assume the ones we saw at record time are the ones we'll want at
    //   replay
    this.currentUrl = new String(this.url);

    // usually 'completed' events actually don't affect replayer -- won't load a
    //   new page in a new tab just because we have one.  want to tell replayer
    //   to actually do a load
    ev.forceReplay = true;

    this.cleanTrace = HelenaMainpanel.cleanTrace(trace);
  }

  public run(runObject: RunObject, rbbcontinuation: Function,
      rbboptions: RunOptions) {
    if (this.currentUrl &&
        (this.currentUrl instanceof String ||
         this.currentUrl instanceof NodeVariableUse ||
         this.currentUrl instanceof Concatenate)) {
      this.currentUrl.run(runObject, rbbcontinuation, rbboptions);
    }
  }

  public cUrl(environment?: EnvironmentPlaceholder) {
    if (this.currentUrl instanceof NodeVariable) {
      // todo: hmmmm, really should have nodevariableuse, not node variable
      //   here.  test with text relation uploads
      if (!environment) {
        throw new ReferenceError("No environment provided.");
      }
      return this.currentUrl.currentText(environment);
    } else if (this.currentUrl instanceof NodeVariableUse) {
      // todo: hmmmm, really should have nodevariableuse, not node variable
      //   here.  test with text relation uploads
      const val = this.currentUrl.getCurrentVal();
      if (typeof val !== "string") {
        throw new ReferenceError("Current URL value is not a string!");
      }
      return val;
    } else if (this.currentUrl instanceof String) {
      return this.currentUrl.getCurrentVal();
    } else if (this.currentUrl instanceof Concatenate) {
      this.currentUrl.updateCurrentVal();
      return this.currentUrl.getCurrentVal();
    } else {
      throw new ReferenceError("Invalid currentUrl type in load statement.");
    }
  }

  // deprecated
  private cUrlString() {
    if (this.currentUrl instanceof NodeVariable) {
      return this.currentUrl.toString();
    } else {
      // else it's a string
      return this.currentUrl;
    }
  }

  private getUrlObj() {
    if (typeof this.currentUrl === "string") {
      // sometimes it's a string; this is left over from before, when we used to
      //   store the string internally rather than as a proper block
      // let's go ahead and correct it now
      
      // we'll make a little string node for it
      this.currentUrl = new String(this.currentUrl);
    }

    if (this.currentUrl instanceof NodeVariable) {
      // hey, we don't want NodeVariable as the item--we want a NodeVariableUse
      const nodevaruse = new NodeVariableUse(this.currentUrl);
      this.currentUrl = nodevaruse;
    }
    
    return this.currentUrl;
  }

  public toStringLines() {
    var cUrl = this.cUrlString();
    return [ `${this.outputPageVar.toString()} = load(${cUrl})` ];
  }

  public updateBlocklyBlock(program?: HelenaProgram,
      pageVars?: PageVariable[], relations?: GenericRelation[]) {
    if (!program || !pageVars) {
      return;
    }

    // addToolboxLabel(this.blocklyLabel, "web");
    var pageVarsDropDown = HelenaMainpanel.makePageVarsDropdown(pageVars);

    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
            .appendField("load")
        this.appendValueInput("url");
        this.appendDummyInput()
            //.appendField(new Blockly.FieldTextInput("URL", handleNewUrl), "url")
            .appendField("into")
            .appendField(new Blockly.FieldDropdown(pageVarsDropDown), "page");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(280);
      }
    };
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
      workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    const urlObject = this.getUrlObj();
    if (urlObject) {
      HelenaMainpanel.attachToInput(this.block,
        urlObject.genBlocklyNode(this.block, workspace), "url");
    }
    this.block.setFieldValue(this.outputPageVar.toString(), "page");
    HelenaMainpanel.attachToPrevBlock(this.block, prevBlock);
    HelenaMainpanel.setWAL(this.block, this);
    return this.block;
  }

  public getHelena() {
    // ok, but we also want to update our own url object
    const url = this.block.getInput('url').connection.targetBlock();
    if (url) {
      this.currentUrl = <String | Concatenate | NodeVariableUse>
        HelenaMainpanel.getWAL(url).getHelena();
    } else {
      this.currentUrl = null;
    }
    return this;
  }

  public traverse(fn: Function, fn2: Function) {
    fn(this);
    if (this.currentUrl &&
        (this.currentUrl instanceof String ||
         this.currentUrl instanceof NodeVariableUse ||
         this.currentUrl instanceof Concatenate)) {
      this.currentUrl.traverse(fn, fn2);
    }
    fn2(this);
  }

  public pbvs() {
    const pbvs = [];
    if (this.url !== this.currentUrl) {
      pbvs.push({
        type: "url",
        value: this.url
      });
    }
    return pbvs;
  };

  public parameterizeForRelation(relation: GenericRelation) {
    // ok!  loads can now get changed based on relations!
    // what we want to do is load a different url if we have a relation that
    //   includes the url
    const columns = relation.columns;
    // var firstRowNodeRepresentations = relation.firstRowNodeRepresentations();
    // again, must have columns and firstRowNodeRepresentations aligned.  should be a better way
    // for (var i = 0; i < columns.length; i++) {
    for (const column of columns) {
      const text = column.firstRowText;
      if (text === null || text === undefined) {
        // can't parameterize for a cell that has null text
        continue;
      }

      if (HelenaMainpanel.urlMatch(text, this.cUrl())) {
        // ok, we want to parameterize
        this.relation = relation;
        const name = column.name;

        if (!name) {
          throw new ReferenceError("Column has no name.");
        }

        const nodevaruse = new NodeVariableUse(
          HelenaMainpanel.getNodeVariableByName(name));
        this.currentUrl = nodevaruse; // new NodeVariable(name, firstRowNodeRepresentations[i], null, null, NodeSources.RELATIONEXTRACTOR);
        return [ column ];
      }
    }
    throw new ReferenceError("No matching column found.");
  }

  public hasOutputPageVars() {
    return this.outputPageVars && this.outputPageVars.length > 0;
  }

  /**
   * Returns whether this Helena statement is Ringer based.
   */
  public isRingerBased() {
    return true;
  }

  public unParameterizeForRelation(relation: GenericRelation) {
    if (this.relation === relation) {
      this.relation = null;
      this.currentUrl = this.url;
    }
    return;
  }

  public args(environment: EnvironmentPlaceholder) {
    const args = [];
    const currentUrl = this.cUrl(environment);
    args.push({ type:"url", value: currentUrl.trim() });
    return args;
  }

  public postReplayProcessing(runObject: RunObject, trace: EventMessage[],
    temporaryStatementIdentifier: number) {
      return;
  };
}