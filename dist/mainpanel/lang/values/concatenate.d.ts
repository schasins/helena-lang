import * as Blockly from "blockly";
import { HelenaString } from "./string";
import { Value } from "./value";
import { NodeVariableUse } from "./node_variable_use";
import { GenericRelation } from "../../relation/generic";
import { PageVariable } from "../../variables/page_variable";
import { RunObject, HelenaProgram, RunOptions } from "../program";
export declare class Concatenate extends Value {
    currentVal: string;
    left?: HelenaString | NodeVariableUse | Concatenate;
    right?: HelenaString | NodeVariableUse | Concatenate;
    constructor(left?: HelenaString | NodeVariableUse | Concatenate, right?: HelenaString | NodeVariableUse | Concatenate);
    static createDummy(): Concatenate;
    toStringLines(): string[];
    /**
     * @returns true because a Concatenate always involves text
     */
    hasText(): boolean;
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getHelena(): this;
    traverse(fn: Function, fn2: Function): void;
    updateCurrentVal(): void;
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
    getCurrentVal(): string;
}
