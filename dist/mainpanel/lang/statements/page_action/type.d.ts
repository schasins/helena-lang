import * as Blockly from "blockly";
import { NodeVariableUse } from "../../values/node_variable_use";
import { Concatenate } from "../../values/concatenate";
import { HelenaString } from "../../values/string";
import { PageActionStatement } from "./page_action";
import { MainpanelNode } from "../../../../common/mainpanel_node";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { RunObject, RunOptions, HelenaProgram } from "../../program";
import { Trace } from "../../../../common/utils/trace";
import { Environment } from "../../../environment";
import { IColumnSelector } from "../../../../content/selector/interfaces";
/**
 * Statement representing a user taking the action of typing something.
 */
export declare class TypeStatement extends PageActionStatement {
    currentTypedString: HelenaString | Concatenate | NodeVariableUse | null;
    keyCodes: number[];
    keyEvents: Trace;
    onlyKeydowns: boolean;
    onlyKeyups: boolean;
    outputPageVars?: (PageVariable | undefined)[];
    pageUrl?: string;
    typedString?: string;
    typedStringLower?: string;
    typedStringParameterizationRelation?: GenericRelation;
    constructor(trace?: Trace);
    static createDummy(): TypeStatement;
    getOutputPagesRepresentation(): string;
    prepareToRun(): void;
    stringRep(): string;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block | null;
    getHelena(): this;
    traverse(fn: Function, fn2: Function): void;
    pbvs(): ({
        type: string;
        value: number | null | undefined;
    } | {
        type: string;
        value: string | undefined;
    })[];
    parameterizeForString(relation: GenericRelation, column: IColumnSelector, nodeRep: MainpanelNode.Interface, string?: string): boolean | undefined;
    parameterizeForRelation(relation: GenericRelation): (IColumnSelector | null)[];
    unParameterizeForRelation(relation: GenericRelation): void;
    usesRelation(rel: GenericRelation): boolean;
    usesRelationText(parameterizeableStrings: (string | null)[]): boolean;
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
    args(environment: Environment.Frame): ({
        type: string;
        value: string | undefined;
    } | {
        type: string;
        value: number | undefined;
    })[];
    currentRelation(): GenericRelation | undefined;
    currentColumnObj(): IColumnSelector | undefined;
    hasOutputPageVars(): boolean;
}
