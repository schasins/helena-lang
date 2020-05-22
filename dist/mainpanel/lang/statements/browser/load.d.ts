import * as Blockly from "blockly";
import { NodeVariable } from "../../../variables/node_variable";
import { NodeVariableUse } from "../../values/node_variable_use";
import { HelenaLangObject } from "../../helena_lang";
import { HelenaString } from "../../values/string";
import { Concatenate } from "../../values/concatenate";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { RunObject, HelenaProgram, RunOptions, TraceContributions } from "../../program";
import { Trace } from "../../../../common/utils/trace";
import { Environment } from "../../../environment";
export declare class LoadStatement extends HelenaLangObject {
    cleanTrace: Trace;
    contributesTrace?: TraceContributions;
    currentUrl: string | HelenaString | NodeVariable | NodeVariableUse | Concatenate | null;
    outputPageVar?: PageVariable;
    outputPageVars: (PageVariable | undefined)[];
    relation: GenericRelation | null;
    trace: Trace;
    url: string;
    constructor(trace?: Trace);
    static createDummy(): LoadStatement;
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
    cUrl(environment?: Environment.Frame): string;
    private cUrlString;
    private getUrlObj;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getHelena(): this;
    traverse(fn: Function, fn2: Function): void;
    pbvs(): {
        type: string;
        value: string;
    }[];
    parameterizeForRelation(relation: GenericRelation): import("../../../../content/selector/interfaces").IColumnSelector[];
    hasOutputPageVars(): boolean;
    /**
     * Returns whether this Helena statement is Ringer based.
     */
    isRingerBased(): boolean;
    unParameterizeForRelation(relation: GenericRelation): void;
    usesRelation(rel: GenericRelation): boolean;
    usesRelationText(parameterizeableStrings: (string | null)[]): boolean;
    args(environment: Environment.Frame): {
        type: string;
        value: string;
    }[];
    postReplayProcessing(runObject: RunObject, trace: Trace, temporaryStatementIdentifier: number): void;
}
