import * as Blockly from "blockly";
import { HelenaLangObject } from "../../helena_lang";
import { AnnotationItem } from "./skip_block";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { StatementContainer } from "../container";
import { HelenaProgram } from "../../program";
import { Environment } from "../../../environment";
import { IColumnSelector } from "../../../../content/selector/interfaces";
/**
 * Loop statements not executed by run method, although may ultimately want to refactor to that
 */
export declare class LoopStatement extends StatementContainer {
    static maxRowsFieldName: string;
    cleanupStatements: HelenaLangObject[];
    maxRows: number | null;
    pageVar: PageVariable;
    relation: GenericRelation;
    relationColumnsUsed: (IColumnSelector | null)[];
    rowsSoFar: number;
    constructor(relation: GenericRelation, relationColumnsUsed: (IColumnSelector | null)[], bodyStatements: HelenaLangObject[], cleanupStatements: HelenaLangObject[], pageVar: PageVariable);
    static createDummy(): LoopStatement;
    getChildren(): HelenaLangObject[];
    getLoopIterationCounters(acc?: number[]): number[];
    clearRunningState(): void;
    toStringLines(): string[];
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    genBlocklyNode(prevBlock: Blockly.Block, workspace: Blockly.WorkspaceSvg): Blockly.Block;
    getHelena(): this;
    traverse(fn: Function, fn2: Function): void;
    private insertAnnotation;
    addAnnotation(annotationItems: AnnotationItem[], availableAnnotationItems: AnnotationItem[], currProg: HelenaProgram): void;
    relationNodeVariables(): import("../../../variables/node_variable").NodeVariable[];
    updateRelationNodeVariables(environment: Environment.Frame): void;
    parameterizeForRelation(relation: GenericRelation): any[];
    unParameterizeForRelation(relation: GenericRelation): void;
    endOfLoopCleanup(continuation: Function): void;
}
