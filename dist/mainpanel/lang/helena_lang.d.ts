import * as Blockly from "blockly";
import { GenericRelation } from "../relation/generic";
import { PageVariable } from "../variables/page_variable";
import { StatementContainer } from "./statements/container";
import { RunObject, RunOptions, HelenaProgram } from "./program";
import { Revival } from "../revival";
import { IColumnSelector } from "../../content/selector/interfaces";
export interface StatementParameter {
    type: string;
    value: any;
}
export declare class HelenaLangObject implements Revival.Revivable {
    ___revivalLabel___: string;
    block: Blockly.Block;
    blocklyLabel: string;
    invisibleHead?: HelenaLangObject[];
    invisibleTail?: HelenaLangObject[];
    nullBlockly?: boolean;
    parent: StatementContainer;
    static createDummy(): HelenaLangObject;
    clearRunningState(): void;
    genBlocklyNode(prevBlock: Blockly.Block | null, workspace: Blockly.WorkspaceSvg): Blockly.Block | null;
    getHelena(): this;
    getLoopIterationCounters(acc?: number[]): number[];
    hasOutputPageVars(): boolean;
    /**
     * Returns whether this Helena statement is Ringer based.
     */
    isRingerBased(): boolean;
    prepareToRun(): void;
    remove(): void;
    /**
     * Run this Helena statement.
     * @param runObject
     * @param rbbcontinuation run basic block continuation
     * @param rbboptions run basic block options
     */
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
    setBlocklyLabel(label: string): void;
    toStringLines(): string[];
    traverse(fn: Function, fn2: Function): void;
    updateBlocklyBlock(program?: HelenaProgram, pageVars?: PageVariable[], relations?: GenericRelation[]): void;
    usesRelation(rel: GenericRelation): boolean;
    parameterizeForRelation(relation: GenericRelation): (IColumnSelector | null)[];
    unParameterizeForRelation(relation: GenericRelation): void;
}
