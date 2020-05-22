import { MainpanelNode } from "../../common/mainpanel_node";
import { FreshRelationItemsMessage, RelationMessage } from "../../common/messages";
import { INextButtonSelector, IColumnSelector } from "../../content/selector/interfaces";
import { Features } from "../../content/utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;
import { Environment } from "../environment";
import { RunObject } from "../lang/program";
import { NodeVariable } from "../variables/node_variable";
import { PageRelation, PageVariable } from "../variables/page_variable";
import { GenericRelation } from "./generic";
/**
 * State of the current scraped relation items.
 */
export declare enum ScrapedRelationState {
    NO_MORE_ITEMS = 1,
    NO_NEW_ITEMS_YET = 2,
    NEW_ITEMS = 3
}
export declare class Relation extends GenericRelation {
    static counter: number;
    id: string;
    selector: GenericFeatureSet | GenericFeatureSet[];
    selectorVersion: number;
    excludeFirst: number;
    demonstrationTimeRelation: MainpanelNode.Interface[][];
    numRowsInDemo: number;
    pageVarName: string;
    url: string;
    nextType: number;
    nextButtonSelector: INextButtonSelector | null;
    frame: number;
    firstRowXPaths: string[];
    firstRowTexts: string[];
    firstRowValues: string[];
    relationScrapeWait: number;
    getRowsCounter: number;
    doneArray: boolean[];
    relationItemsRetrieved: {
        [key: string]: FreshRelationItemsMessage;
    };
    missesSoFar: {
        [key: string]: number;
    };
    getNextRowCounter: number;
    currNextButtonText?: string;
    constructor(relationId: string, name: string, selector: GenericFeatureSet | GenericFeatureSet[], selectorVersion: number, excludeFirst: number, columns: IColumnSelector[], demonstrationTimeRelation: MainpanelNode.Interface[][], numRowsInDemo: number, pageVarName: string, url: string, nextType: number, nextButtonSelector: INextButtonSelector | null, frame: number);
    static createDummy(): Relation;
    demonstrationTimeRelationText(): string[][];
    firstRowNodeRepresentations(): MainpanelNode.Interface[];
    nodeVariables(): NodeVariable[];
    updateNodeVariables(environment: Environment.Frame, pageVar: PageVariable): void;
    processColumns(oldColumns?: IColumnSelector[]): void;
    private processColumn;
    private updateFirstRowInfo;
    setNewAttributes(selector: GenericFeatureSet | GenericFeatureSet[], selectorVersion: number, excludeFirst: number, columns: IColumnSelector[], demonstrationTimeRelation: MainpanelNode.Interface[][], numRowsInDemo: number, nextType: number, nextButtonSelector: INextButtonSelector | null): void;
    messageRelationRepresentation(): RelationMessage;
    getPrinfo(pageVar: PageVariable): PageRelation;
    setPrinfo(pageVar: PageVariable, val: PageRelation): void;
    noMoreRows(runObject: RunObject, pageVar: PageVariable, callback: Function, allowMoreNextInteractions: boolean): void;
    gotMoreRows(pageVar: PageVariable, callback: Function, rel: MainpanelNode.Interface[][]): void;
    private getRowsFromPageVar;
    endOfLoopCleanup(pageVar: PageVariable, continuation: Function): void;
    getNextRow(runObject: RunObject, pageVar: PageVariable, callback: Function): void;
    getCurrentNodeRep(pageVar: PageVariable, columnObject: IColumnSelector): MainpanelNode.Interface | null;
    saveToServer(): void;
    /**
     * Could not name this `toJSON` because JSOG treats objects with `toJSON`
     *   methods in a special way.
     */
    convertToJSON: () => RelationMessage;
}
