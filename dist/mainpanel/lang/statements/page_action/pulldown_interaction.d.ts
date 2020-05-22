import * as Blockly from "blockly";
import { PageActionStatement } from "./page_action";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { HelenaProgram } from "../../program";
import { Trace } from "../../../../common/utils/trace";
import { Environment } from "../../../environment";
export declare class PulldownInteractionStatement extends PageActionStatement {
    node: string;
    origTrace?: Trace;
    origCleanTrace?: Trace;
    pageVar: PageVariable;
    constructor(trace?: Trace);
    static createDummy(): PulldownInteractionStatement;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    parameterizeNodeWithRelation(genericRelation: GenericRelation, pageVar: PageVariable): import("../../../../content/selector/interfaces").IColumnSelector | null;
    parameterizeForRelation(relation: GenericRelation): (import("../../../../content/selector/interfaces").IColumnSelector | null)[];
    unParameterizeForRelation(relation: GenericRelation): void;
    pbvs(): ({
        type: string;
        value: number | null | undefined;
    } | {
        type: string;
        value: {
            property: string;
            value: any;
        };
    })[];
    args(environment: Environment.Frame): ({
        type: string;
        value: number | undefined;
    } | {
        type: string;
        value: {
            property: string;
            value: number;
        };
    })[];
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    usesRelation(rel: GenericRelation): boolean;
}
