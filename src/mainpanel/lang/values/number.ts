import * as Blockly from "blockly";

import { HelenaMainpanel } from "../../helena_mainpanel";

import { Value } from "./value";

import { GenericRelation } from "../../relation/generic";
import { PageVariable } from "../../variables/page_variable";
import { HelenaProgram } from "../program";
import { Revival } from "../../revival";

export class HelenaNumber extends Value {
  public static fieldName = 'numberFieldName';

  constructor() {
    super();
    Revival.addRevivalLabel(this);
    this.setBlocklyLabel("num");
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
      pageVars?: PageVariable[], relations?: GenericRelation[]) {
    HelenaMainpanel.addToolboxLabel(this.blocklyLabel, "numbers");
    const defaultNum = 100;
    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        const helena = HelenaMainpanel.getHelenaStatement(this);
        if (!helena) {
          HelenaMainpanel.setHelenaStatement(this, new HelenaNumber());
        }

        const block = this;
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(defaultNum, undefined,
              undefined, undefined, (newNum: number) => {
                (<HelenaNumber> HelenaMainpanel.getHelenaStatement(block)).currentVal = newNum;
              }), HelenaNumber.fieldName);

        this.setOutput(true, 'number');
        this.setColour(25);
        (<HelenaNumber> HelenaMainpanel.getHelenaStatement(this)).currentVal = defaultNum;
      }
    };
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
      workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    HelenaMainpanel.setHelenaStatement(this.block, this);
    if (this.currentVal) {
      this.block.setFieldValue(this.currentVal.toString(), HelenaNumber.fieldName);
    }
    return this.block;
  }
}