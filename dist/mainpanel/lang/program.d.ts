import * as Blockly from "blockly";
import { RelationResponse } from "../../common/messages";
import { HashBasedParallel } from "./statements/control_flow/skip_block";
import { LoopStatement } from "./statements/control_flow/loop";
import { NodeVariable } from "../variables/node_variable";
import { HelenaLangObject } from "./helena_lang";
import { PageVariable } from "../variables/page_variable";
import { GenericRelation } from "../relation/generic";
import { StatementContainer } from "./statements/container";
import { Trace } from "../../common/utils/trace";
import { Dataset } from "../dataset";
import { RetrieveRelationsResponse } from "../utils/server";
import { Environment } from "../environment";
interface LoopItem {
    loopStatement: LoopStatement;
    nodeVariables: NodeVariable[];
    displayData: string[][];
}
export declare enum TraceContributions {
    NONE = 0,
    FOCUS = 1
}
export interface RunObject {
    dataset: Dataset;
    environment: Environment.Frame;
    program: HelenaProgram;
    resumeContinuation?: Function;
    tab: string;
    userPaused?: boolean;
    userStopped?: boolean;
    window?: number;
}
export interface RunOptions {
    [key: string]: any;
    breakAfterXDuplicatesInARow?: number;
    breakMode?: boolean;
    dataset_id?: number;
    hashBasedParallel?: HashBasedParallel;
    ignoreEntityScope?: boolean;
    nameAddition?: string;
    parallel?: boolean;
    simulateError?: number[];
    skipCommitInThisIteration?: boolean;
    skipMode?: boolean;
}
interface Parameters {
    [key: string]: any;
}
/**
 * A Helena program.
 * @param statements
 * @param addOutputStatement
 */
export declare class HelenaProgram extends StatementContainer {
    static wrapperNodeCounter: number;
    altRootBodyStatements?: HelenaLangObject[][];
    associatedString?: string;
    automaticLoopInsertionForbidden?: boolean;
    defaultParamVals: Parameters;
    id: string;
    mostRecentRow?: string[];
    name: string;
    nextButtonAttemptsThreshold?: number;
    pagesProcessed: {
        [key: string]: boolean;
    };
    pagesToFrames: {
        [key: string]: number[];
    };
    pagesToFrameUrls: {
        [key: string]: string[];
    };
    pagesToNodes: {
        [key: string]: string[];
    };
    pagesToUrls: {
        [key: string]: string;
    };
    pageVars: PageVariable[];
    parameterNames?: string[];
    relationFindingTimeoutThreshold?: number;
    relations: GenericRelation[];
    restartOnFinish?: boolean;
    statements: HelenaLangObject[];
    windowHeight?: number;
    windowWidth?: number;
    constructor(statements: HelenaLangObject[], addOutputStatement?: boolean);
    static createDummy(): HelenaProgram;
    clone(): {
        [key: string]: any;
    };
    /**
     * Set attributes on this Program.
     * @param attrs attributes
     */
    setAttributes(attrs: {
        [key: string]: any;
    }): void;
    static fromRingerTrace(trace: Trace, windowId?: number, addOutputStatement?: boolean): HelenaProgram;
    static fromJSON(json: string): HelenaProgram;
    /**
     * Could not name this `toJSON` because JSOG treats objects with `toJSON`
     *   methods in a special way.
     */
    convertToJSON(): any;
    setName(str: string): void;
    getName(): string;
    setAssociatedString(str: string): void;
    getAssociatedString(): string | undefined;
    setId(id: string): void;
    toString(): string;
    currentStatementLs(): HelenaLangObject[];
    displayBlockly(workspace: Blockly.WorkspaceSvg): void;
    /**
     * Saves a HelenaProgram to the server.
     * @param afterId a callback handler that runs as soon as we have the
     *   necessary program id, and let the saving continue in the background
     *   because it takes a long time
     * @param saveStarted a callback handler when the save begins
     * @param saveDone a callback handler when the save completes
     */
    saveToServer(afterId: Function, saveStarted: Function, saveDone: Function): void;
    traverse(fn: Function, fn2: Function): void;
    containsStatement(stmt: HelenaLangObject): HelenaLangObject | null;
    loadsUrl(): HelenaLangObject | null;
    insertAfter(stmtToInsert: HelenaLangObject, stmtToInsertAfter: HelenaLangObject): void;
    getDuplicateDetectionData(): LoopItem[];
    getNodesFoundWithSimilarity(): NodeVariable[];
    replayOriginal(): void;
    private doTheReplay;
    private runBasicBlockWithRinger;
    runBasicBlock(runObject: RunObject, bodyStmts: HelenaLangObject[], callback: Function, options?: RunOptions): void;
    turnOffDescentIntoLockedSkipBlocks(): void;
    /**
     *
     * @param options
     * @param continuation
     * @param parameters
     * @param requireDataset should only be false if we're sure users shouldn't be
     *  putting in output rows...
     */
    runProgram(options?: RunOptions, continuation?: Function, parameters?: Parameters, requireDataset?: boolean): void;
    restartFromBeginning(runObjectOld: RunObject, continuation: Function): void;
    stopRunning(runObject: RunObject): void;
    clearRunningState(): void;
    setParameterNames(paramNamesLs: string[]): void;
    getParameterNames(): string[] | undefined;
    setParameterDefaultValue(paramName: string, paramVal: any): void;
    getParameterDefaultValues(): Parameters;
    getAllVariableNames(): string[];
    makeVariableNamesDropdown(): string[][];
    prepareToRun(): void;
    relevantRelations(): void;
    processServerRelations(resp: RetrieveRelationsResponse, currentStartIndex?: number, tabsToCloseAfter?: number[], tabMapping?: {}, windowId?: number, pageCount?: number): void;
    forbidAutomaticLoopInsertion(): void;
    processLikelyRelation(data: RelationResponse): GenericRelation[];
    insertLoops(updateProgPreview: boolean): void;
    tryAddingRelation(relation: GenericRelation): void;
    removeRelation(relationObj: GenericRelation): void;
    setCustomTargetTimeout(timeoutSeconds: number): void;
}
export {};
