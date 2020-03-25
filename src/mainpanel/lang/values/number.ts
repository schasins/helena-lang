// TODO: cjbaik: doesn't appear to be used
/*
import * as Blockly from "blockly";

import { HelenaMainpanel } from "../../helena_mainpanel";

import { Value } from "./value";

import { Relation } from "../../relation/relation";

export class Number extends Value {
  public static fieldName = 'numberFieldName';

  constructor() {
    super();
    window.Revival.addRevivalLabel(this);
    HelenaMainpanel.setBlocklyLabel(this, "num");
    this.currentVal = null;
  }

  public toStringLines() {
    if (this.currentVal) {
      return [ this.currentVal.toString() ];
    } else {
      return [ "" ];
    }
  }

  public updateBlocklyBlock(program?: HelenaProgram,
      pageVars?: PageVarPlaceholder[], relations?: Relation[]) {
    HelenaMainpanel.addToolboxLabel(this.blocklyLabel, "numbers");
    const defaultNum = 100;
    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        const helena = HelenaMainpanel.getWAL(this);
        if (!helena) {
          HelenaMainpanel.setWAL(this, new Number());
        }

        const block = this;
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(defaultNum, undefined,
              undefined, undefined, (newNum: number) => {
                (<Number> HelenaMainpanel.getWAL(block)).currentVal = newNum;
              }), Number.fieldName);

        this.setOutput(true, 'number');
        this.setColour(25);
        (<Number> HelenaMainpanel.getWAL(this)).currentVal = defaultNum;
      }
    };
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
      workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    HelenaMainpanel.setWAL(this.block, this);
    if (this.currentVal) {
      this.block.setFieldValue(this.currentVal.toString(), Number.fieldName);
    }
    return this.block;
  }
}*/