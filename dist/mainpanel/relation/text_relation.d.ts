import { NodeVariable } from "../variables/node_variable";
import { GenericRelation } from "./generic";
import { PageVariable } from "../variables/page_variable";
import { RunObject } from "../lang/program";
import { Environment } from "../environment";
import { IColumnSelector } from "../../content/selector/interfaces";
export declare class TextRelation extends GenericRelation {
    private currentRowsCounter;
    relation: string[][];
    constructor(csvFileContents?: string, name?: string);
    static createDummy(): TextRelation;
    demonstrationTimeRelationText(): string[][];
    firstRowNodeRepresentations(): {
        text: string;
    }[];
    nodeVariables(): NodeVariable[];
    updateNodeVariables(environment: Environment.Frame, pageVar: PageVariable): void;
    processColumns(): void;
    toJSON: () => string;
    getNextRow(runObject: RunObject, pageVar: PageVariable, callback: Function): void;
    getCurrentCellsText(): string[];
    getCurrentText(columnObject: IColumnSelector): string;
    getCurrentLink(pageVar: PageVariable, columnObject: IColumnSelector): string;
    clearRunningState(): void;
    setRelationContents(relationContents: string[][]): void;
    getRelationContents(): string[][];
}
