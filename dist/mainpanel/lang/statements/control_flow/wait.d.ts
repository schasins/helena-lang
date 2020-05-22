import * as Blockly from "blockly";
import { HelenaLangObject } from "../../helena_lang";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { HelenaProgram, RunOptions, RunObject } from "../../program";
/**
 * No longer executed by Ringer but rather by own run method.
 */
export declare class WaitStatement extends HelenaLangObject {
    static waitFieldName: string;
    wait: number;
    constructor();
    static createDummy(): WaitStatement;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
}
