import { MainpanelNode } from "../../common/mainpanel_node";
import { NodeVariable } from "../variables/node_variable";
import { PageVariable } from "../variables/page_variable";
import { RunObject } from "../lang/program";
import { Revival } from "../revival";
import { RelationMessage } from "../../common/messages";
import { Environment } from "../environment";
import { IColumnSelector } from "../../content/selector/interfaces";
export declare class GenericRelation implements Revival.Revivable {
    ___revivalLabel___: string;
    name: string;
    columns: IColumnSelector[];
    firstRowTexts: string[];
    nodeVars: NodeVariable[];
    clearRunningState(): void;
    columnName(colObj: (IColumnSelector | null)[]): string[];
    columnNames(): string[];
    demonstrationTimeRelationText(): string[][];
    firstRowNodeRepresentation(colObj: IColumnSelector): MainpanelNode.Interface;
    firstRowNodeRepresentations(): MainpanelNode.Interface[];
    getColumnObjectFromXpath(xpath: string): IColumnSelector | null;
    getNextRow(runObject: RunObject, pageVar: PageVariable, callback: Function): void;
    nodeVariables(): NodeVariable[];
    processColumns(): void;
    scrapedColumnNames(): string[];
    setColumnName(columnObj: IColumnSelector, v: string): void;
    /**
     * Could not name this `toJSON` because JSOG treats objects with `toJSON`
     *   methods in a special way.
     */
    convertToJSON: () => RelationMessage | string;
    updateNodeVariables(environment: Environment.Frame, pageVar: PageVariable): void;
}
