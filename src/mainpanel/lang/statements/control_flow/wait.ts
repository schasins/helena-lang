import * as Blockly from "blockly";

import { HelenaMainpanel } from "../../../helena_mainpanel";

import { HelenaLangObject } from "../../helena_lang";

import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { HelenaProgram, RunOptions, RunObject } from "../../program";

/**
 * No longer executed by Ringer but rather by own run method.
 */
export class WaitStatement extends HelenaLangObject {
  public static waitFieldName = 'waitInSeconds';

  public sourceBlock_: Blockly.Block;
  public wait: number;

  constructor() {
    super();
    window.Revival.addRevivalLabel(this);
    HelenaMainpanel.setBlocklyLabel(this, "wait");
    this.wait = 0;
  }  

  public toStringLines() {
    return ["wait " + this.wait.toString() + " seconds"];
  }

  public updateBlocklyBlock(program?: HelenaProgram,
    pageVars?: PageVariable[], relations?: GenericRelation[]) {
    HelenaMainpanel.addToolboxLabel(this.blocklyLabel);

    const handleWaitChange = function(newWait: number) {
      if (this.sourceBlock_) {
        (<WaitStatement> HelenaMainpanel.getWAL(this.sourceBlock_)).wait =
          newWait;
      }
    }

    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
            .appendField("wait")
            .appendField(new Blockly.FieldNumber('0', 0, undefined, undefined,
              handleWaitChange), WaitStatement.waitFieldName)
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(25);
        const wal = HelenaMainpanel.getWAL(this);
        if (!wal) {
          HelenaMainpanel.setWAL(this, new WaitStatement());
        }
      }
    };
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
      workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    HelenaMainpanel.attachToPrevBlock(this.block, prevBlock);
    HelenaMainpanel.setWAL(this.block, this);
    this.block.setFieldValue(this.wait.toString(), WaitStatement.waitFieldName);
    return this.block;
  }

  public run(runObject: RunObject, rbbcontinuation: Function,
      rbboptions: RunOptions) {
    // just wait a while, then call rbbcontinuation on rbboptions
    setTimeout(function() {
      rbbcontinuation(rbboptions);
    }, this.wait * 1000);
  }
};