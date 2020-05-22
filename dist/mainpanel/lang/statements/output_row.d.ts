import * as Blockly from "blockly";
import { HelenaLangObject } from "../helena_lang";
import { NodeVariableUse } from "../values/node_variable_use";
import { ScrapeStatement } from "./page_action/scrape";
import { Relation } from "../../relation/relation";
import { GenericRelation } from "../../relation/generic";
import { PageVariable } from "../../variables/page_variable";
import { RunObject, HelenaProgram, RunOptions } from "../program";
import { Trace } from "../../../common/utils/trace";
import { Environment } from "../../environment";
export declare class OutputRowStatement extends HelenaLangObject {
    cleanTrace: Trace;
    relations: GenericRelation[];
    scrapeStatements: ScrapeStatement[];
    trace: Trace;
    nodeUseVariables: NodeVariableUse[];
    constructor(scrapeStatements?: ScrapeStatement[]);
    setAttributes(attrs: {
        [key: string]: any;
    }): void;
    static createDummy(): OutputRowStatement;
    remove(): void;
    addAssociatedScrapeStatement(scrapeStmt: ScrapeStatement): void;
    removeAssociatedScrapeStatement(scrapeStmt: ScrapeStatement): void;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: Relation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getHelena(): this;
    traverse(fn: Function, fn2: Function): void;
    pbvs(): never[];
    parameterizeForRelation(relation: GenericRelation): import("../../../content/selector/interfaces").IColumnSelector[];
    unParameterizeForRelation(relation: GenericRelation): void;
    args(environment: Environment.Frame): never[];
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
}
