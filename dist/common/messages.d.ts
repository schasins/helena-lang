import { MainpanelNode } from "./mainpanel_node";
import MainpanelNodeI = MainpanelNode.Interface;
import { Features } from "../content/utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;
import { XPath } from "../content/utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;
import { INextButtonSelector, IColumnSelector } from "../content/selector/interfaces";
export interface ColumnSelectorMessage {
    xpath: string;
    suffix: SuffixXPathList | SuffixXPathList[];
    name?: string;
    id: number | null;
    index?: string;
}
export interface TabDetailsMessage {
    tab_id: number;
    window_id: number;
    top_frame_url: string;
}
export interface WindowIdMessage {
    window: number;
}
export interface WindowsMessage {
    window_ids: number[];
}
export interface ColumnIndexMessage {
    index: number;
}
export interface LikelyRelationMessage {
    xpaths: string[];
    pageVarName: string;
    serverSuggestedRelations: (RelationMessage | null)[];
}
export interface FreshRelationItemsMessage {
    type: number;
    relation: MainpanelNodeI[][];
}
export interface EditRelationMessage {
    relation: null;
    demonstration_time_relation: MainpanelNodeI[][];
    colors: string[];
}
export interface NextButtonSelectorMessage {
    selector: INextButtonSelector;
}
export interface RelationMessage {
    id: string;
    name: string;
    selector: GenericFeatureSet | GenericFeatureSet[];
    selector_version: number;
    exclude_first: number;
    columns: (IColumnSelector | ColumnSelectorMessage)[];
    url: string;
    next_type?: number;
    next_button_selector?: INextButtonSelector | null;
    num_rows_in_demonstration?: number;
    relation_scrape_wait: number;
    prior_next_button_text?: string;
}
export interface NextButtonTextMessage {
    text: string;
}
export interface FastModeMessage {
    use: boolean;
}
export interface SkipBlockResponse {
    exists: boolean;
    task_yours: boolean;
}
export interface ServerSaveResponse {
    program: {
        id: string;
    };
}
export interface SavedProgramMessage {
    id: string;
    date: number;
    name: string;
    serialized_program: string;
}
export interface ScheduledScriptMessage {
    progId: string;
}
export interface DatasetSliceRequest {
    nodes: string;
    pass_start_time: number;
    position_lists: string;
    run_id?: number;
    sub_run_id?: number;
}
export interface RelationResponse {
    columns: IColumnSelector[];
    exclude_first: number;
    first_page_relation: MainpanelNode.Interface[][];
    frame: number;
    name: string;
    next_button_selector: INextButtonSelector;
    next_type: number;
    num_rows_in_demonstration: number;
    page_var_name: string;
    pulldown_relations: RelationResponse[];
    relation_id: string;
    selector: GenericFeatureSet[];
    selector_version: number;
    url: string;
}
export declare namespace Messages {
    interface MessageContent {
        [key: string]: any;
    }
    export interface MessageContentWithTab {
        tab_id: number;
    }
    export function listenForMessage(from: string, to: string, subject: string, fn: Function, key?: string | number): void;
    export function listenForFrameSpecificMessage(from: string, to: string, subject: string, fn: Function): void;
    export function listenForMessageOnce(from: string, to: string, subject: string, fn: Function): void;
    export function listenForMessageWithKey(from: string, to: string, subject: string, key: string, fn: Function): void;
    /**
     *
     * @param from
     * @param to
     * @param subject
     * @param content
     * @param frameIdsInclude frame_ids are our own internal frame ids, not chrome
     *   frame ids
     * @param frameIdsExclude frame_ids are our own internal frame ids, not chrome
     *   frame ids
     * @param tabIdsInclude
     * @param tabIdsExclude
     */
    export function sendMessage(from: string, to: string, subject: string, content: MessageContent, frameIdsInclude?: number[], frameIdsExclude?: number[], tabIdsInclude?: number[], tabIdsExclude?: number[]): void;
    /**
     * Make a channel based on the frame id and the subject, and anything that
     *   comes from that frame with that subject will go to that channel.
     * @param from
     * @param to
     * @param subject
     * @param content
     * @param chromeTabId
     * @param chromeFrameId not the same as our internal frame ids
     * @param handler
     */
    export function sendFrameSpecificMessage(from: string, to: string, subject: string, content: MessageContent, chromeTabId: number, chromeFrameId: number, handler: Function): void;
    export {};
}
