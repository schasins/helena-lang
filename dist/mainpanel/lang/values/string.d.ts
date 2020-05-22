import * as Blockly from "blockly";
import { Value } from "./value";
import { GenericRelation } from "../../relation/generic";
import { PageVariable } from "../../variables/page_variable";
import { HelenaProgram } from "../program";
export declare class HelenaString extends Value {
    static fieldName: string;
    currentVal: string;
    constructor(currString?: string);
    setAttributes(attrs: {
        [key: string]: any;
    }): void;
    static createDummy(): HelenaString;
    toStringLines(): string[];
    hasText(): boolean;
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getCurrentVal(): string;
}
