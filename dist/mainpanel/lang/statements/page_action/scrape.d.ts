import * as Blockly from "blockly";
import { OutputRowStatement } from "../output_row";
import { MainpanelNode } from "../../../../common/mainpanel_node";
import { PageActionStatement } from "./page_action";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { HelenaProgram, RunObject } from "../../program";
import { Trace } from "../../../../common/utils/trace";
import { Environment } from "../../../environment";
export declare class ScrapeStatement extends PageActionStatement {
    static maxDim: number;
    static maxHeight: number;
    alternativeBlocklyLabel: string;
    associatedOutputStatements: OutputRowStatement[];
    currentNodeCurrentValue?: MainpanelNode.Interface;
    pageUrl?: string;
    preferredXpath?: string;
    scrapeLink?: boolean;
    xpaths: string[];
    constructor(trace?: Trace);
    static createDummy(): ScrapeStatement;
    remove(): void;
    prepareToRun(): void;
    clearRunningState(): void;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    updateAlternativeBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    scrapingRelationItem(): boolean;
    pbvs(): ({
        type: string;
        value: number | null | undefined;
    } | {
        type: string;
        value: string | undefined;
    })[];
    parameterizeForRelation(relation: GenericRelation): (import("../../../../content/selector/interfaces").IColumnSelector | null)[];
    unParameterizeForRelation(relation: GenericRelation): void;
    args(environment: Environment.Frame): ({
        type: string;
        value: string | undefined;
    } | {
        type: string;
        value: number | undefined;
    })[];
    postReplayProcessing(runObject: RunObject, trace: Trace, temporaryStatementIdentifier: number): void;
    addAssociatedOutputStatement(outputStatement: OutputRowStatement): void;
    removeAssociatedOutputStatement(outputStatement: OutputRowStatement): void;
    currentRelation(): GenericRelation | undefined;
    currentColumnObj(): import("../../../../content/selector/interfaces").IColumnSelector | undefined;
}
