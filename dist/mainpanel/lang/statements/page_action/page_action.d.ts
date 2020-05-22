import * as Blockly from "blockly";
import { HelenaLangObject, StatementParameter } from "../../helena_lang";
import { NodeVariable } from "../../../variables/node_variable";
import { PageVariable } from "../../../variables/page_variable";
import { TraceContributions, RunObject } from "../../program";
import { GenericRelation } from "../../../relation/generic";
import { Trace } from "../../../../common/utils/trace";
import { Environment } from "../../../environment";
import { IColumnSelector } from "../../../../content/selector/interfaces";
export interface HelenaBlockUIEvent extends Blockly.Events.Ui {
    element: string;
    oldValue: any;
}
export declare class PageActionStatement extends HelenaLangObject {
    cleanTrace: Trace;
    columnObj?: IColumnSelector;
    contributesTrace?: TraceContributions;
    currentNode: NodeVariable;
    node?: string;
    origNode?: string;
    pageVar?: PageVariable;
    relation?: GenericRelation;
    trace: Trace;
    args(environment: Environment.Frame): StatementParameter[];
    currentNodeXpath(environment: Environment.Frame): string | undefined;
    currentTab(): number | undefined;
    /**
     * Returns whether this Helena statement is Ringer based.
     */
    isRingerBased(): boolean;
    getNodeRepresentation(linkScraping?: boolean): string;
    originalTab(): number | null | undefined;
    parameterizeNodeWithRelation(genericRelation: GenericRelation, pageVar: PageVariable): IColumnSelector | null;
    postReplayProcessing(runObject: RunObject, trace: Trace, temporaryStatementIdentifier: number): void;
    /**
     * Parameterize by value. TODO: What does it mean?
     */
    pbvs(): StatementParameter[];
    requireFeatures(featureNames: string[]): void;
    private requireFeaturesHelper;
    unParameterizeNodeWithRelation(relation: GenericRelation): IColumnSelector | null | undefined;
    usesRelation(rel: GenericRelation): boolean;
}
