import * as Blockly from "blockly";
import { HelenaLangObject } from "../../helena_lang";
import { NodeVariable } from "../../../variables/node_variable";
import { GenericRelation } from "../../../relation/generic";
import { StatementContainer } from "../container";
import { RunObject, RunOptions } from "../../program";
declare enum SkippingStrategies {
    ALWAYS = "always",
    NEVER = "never",
    ONERUNLOGICAL = "onerunlogical",
    SOMETIMESPHYSICAL = "physical",
    SOMETIMESLOGICAL = "logical"
}
declare enum TimeUnits {
    YEARS = "years",
    MONTHS = "months",
    WEEKS = "weeks",
    DAYS = "days",
    HOURS = "hours",
    MINUTES = "minutes"
}
export interface AnnotationItem {
    nodeVar: NodeVariable;
    attr: string;
}
export interface HashBasedParallel {
    on: boolean;
    numThreads: number;
    thisThreadIndex: number;
}
interface TransactionItem {
    attr: string;
    val: string | null;
}
export interface ServerTransaction {
    program_run_id?: number;
    program_id: string;
    transaction_attributes: string;
    annotation_id: number;
    logical_time_diff?: number;
    physical_time_diff_seconds?: number;
    commit_time?: number;
}
export declare class SkipBlock extends StatementContainer {
    static counter: number;
    static color: number;
    annotationItems: AnnotationItem[];
    availableAnnotationItems: AnnotationItem[];
    ancestorAnnotations: SkipBlock[];
    currentTransaction?: TransactionItem[];
    datasetSpecificId: number;
    descendIntoLocks?: boolean;
    duplicatesInARow: number;
    logicalTime?: number;
    name: string;
    physicalTime?: number;
    physicalTimeUnit?: TimeUnits;
    requiredAncestorAnnotations: SkipBlock[];
    skippingStrategy: SkippingStrategies;
    constructor(annotationItems: AnnotationItem[], availableAnnotationItems: AnnotationItem[], bodyStatements: HelenaLangObject[]);
    static createDummy(): SkipBlock;
    clearRunningState(): void;
    toStringLines(): string[];
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getHelena(): this;
    traverse(fn: Function, fn2: Function): void;
    endOfLoopCleanup(continuation: Function): void;
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
    private commit;
    private singleAnnotationItems;
    private serverTransactionRepresentation;
    private serverTransactionRepresentationCheck;
    serverTransactionRepresentationCommit(runObject: RunObject, commitTime: number): ServerTransaction;
    parameterizeForRelation(relation: GenericRelation): never[];
    unParameterizeForRelation(relation: GenericRelation): void;
}
export declare function toBlocklyBoolString(bool: boolean): "TRUE" | "FALSE";
export {};
