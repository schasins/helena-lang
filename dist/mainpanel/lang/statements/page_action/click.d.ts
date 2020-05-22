import * as Blockly from "blockly";
import { PageActionStatement } from "./page_action";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { HelenaProgram } from "../../program";
import { Trace } from "../../../../common/utils/trace";
import { Environment } from "../../../environment";
import { IColumnSelector } from "../../../../content/selector/interfaces";
export declare class ClickStatement extends PageActionStatement {
    static maxDim: number;
    static maxHeight: number;
    columnObj: IColumnSelector;
    outputPageVars: (PageVariable | undefined)[];
    pageUrl: string;
    pageVar: PageVariable;
    relation: GenericRelation;
    constructor(trace?: Trace);
    static createDummy(): ClickStatement;
    getOutputPagesRepresentation(): string;
    prepareToRun(): void;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    pbvs(): ({
        type: string;
        value: number | null | undefined;
    } | {
        type: string;
        value: string | undefined;
    })[];
    parameterizeForRelation(relation: GenericRelation): (IColumnSelector | null)[];
    unParameterizeForRelation(relation: GenericRelation): void;
    args(environment: Environment.Frame): ({
        type: string;
        value: number | undefined;
    } | {
        type: string;
        value: string | undefined;
    })[];
    currentRelation(): GenericRelation;
    currentColumnObj(): IColumnSelector;
    hasOutputPageVars(): boolean;
}
