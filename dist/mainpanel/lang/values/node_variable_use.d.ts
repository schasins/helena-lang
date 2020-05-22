import * as Blockly from "blockly";
import { ScrapeStatement } from "../statements/page_action/scrape";
import { Value } from "./value";
import { NodeVariable } from "../../variables/node_variable";
import { MainpanelNode } from "../../../common/mainpanel_node";
import { GenericRelation } from "../../relation/generic";
import { PageVariable } from "../../variables/page_variable";
import { RunObject, HelenaProgram, RunOptions } from "../program";
export declare enum AttributeOptions {
    TEXT = "1",
    LINK = "2"
}
export declare class NodeVariableUse extends Value {
    static attributeFieldName: string;
    static varNameFieldName: string;
    attributeOption: AttributeOptions;
    currentVal: MainpanelNode.Interface | string;
    nodeVar?: NodeVariable;
    constructor(nodeVar?: NodeVariable, attributeOption?: AttributeOptions);
    static createDummy(): NodeVariableUse;
    static fromScrapeStmt(scrapeStmt: ScrapeStatement): NodeVariableUse;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getHelenaSeq(): NodeVariableUse[];
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
    getCurrentVal(): string;
    getAttribute(): "" | "TEXT" | "LINK";
    getCurrentNode(): MainpanelNode.Interface;
}
