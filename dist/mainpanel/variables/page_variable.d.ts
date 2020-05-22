import { MainpanelNode } from "../../common/mainpanel_node";
import { Revival } from "../revival";
import { RingerFrameInfo } from "../../ringer-record-replay/common/event";
export interface PageRelation {
    currentRows: MainpanelNode.Interface[][] | null;
    currentRowsCounter: number;
    currentTabId?: number;
    currentNextInteractionAttempts: number;
    runNextInteraction?: boolean;
    needNewRows?: boolean;
}
export declare class PageVariable implements Revival.Revivable {
    ___revivalLabel___: string;
    name: string;
    recordTimeUrl: string;
    pageRelations: {
        [key: string]: PageRelation;
    };
    tabId?: number;
    recordTimeFrameData: RingerFrameInfo;
    constructor(name: string, recordTimeUrl: string);
    static createDummy(): PageVariable;
    static makePageVarsDropdown(pageVars: PageVariable[]): string[][];
    setRecordTimeFrameData(frameData: RingerFrameInfo): void;
    setCurrentTabId(tabId: number, continuation: Function): void;
    setAttributes(attrs: {
        [key: string]: any;
    }): void;
    clearCurrentTabId(): void;
    clearRelationData(): void;
    originalTabId(): number | null | undefined;
    currentTabId(): number | undefined;
    toString(): string;
    clearRunningState(): void;
}
