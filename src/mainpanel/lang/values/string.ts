import * as Blockly from "blockly";

import { HelenaMainpanel } from "../../helena_mainpanel";

import { Value } from "./value";

import { GenericRelation } from "../../relation/generic";
import { PageVariable } from "../../variables/page_variable";
import { HelenaProgram } from "../program";
import { Revival } from "../../revival";

export class HelenaString extends Value {
  public static fieldName = 'stringFieldName';

  public currentVal: string;

  constructor(currString?: string) {
    super();
    Revival.addRevivalLabel(this);
    this.setBlocklyLabel("string");

    if (currString || currString === "") {
      this.currentVal = currString;
    } else {
      this.currentVal = "your text here";
    }
  }

  public toStringLines() {
    return [ this.currentVal ];
  }

  public hasText() {
    if (this.currentVal.length < 1) {
      return false;
    }
    return true;
  }

  public updateBlocklyBlock(program?: HelenaProgram,
      pageVars?: PageVariable[], relations?: GenericRelation[]) {
    HelenaMainpanel.addToolboxLabel(this.blocklyLabel, "text");
    const text = this.currentVal;
    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        const helena = HelenaMainpanel.getHelenaStatement(this);
        if (!helena) {
          HelenaMainpanel.setHelenaStatement(this, new HelenaString());
        }

        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput(text,
              function (newStr: string) {
                const helenaStr =
                  <HelenaString> HelenaMainpanel.getHelenaStatement(this.sourceBlock_);
                helenaStr.currentVal = newStr;
              }), HelenaString.fieldName);

        this.setOutput(true, 'string');
        this.setColour(25);
        const helenaStr = <HelenaString> HelenaMainpanel.getHelenaStatement(this);
        helenaStr.currentVal = text;
      }
    };
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
      workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    HelenaMainpanel.setHelenaStatement(this.block, this);
    if (this.currentVal) {
      this.block.setFieldValue(this.currentVal, HelenaString.fieldName);
    }
    return this.block;
  }

  public getCurrentVal() {
    return this.currentVal;
  }
}