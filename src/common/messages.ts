import { GenericSelector } from "../content/relation_finding";
import { MainpanelNodeRep } from "../content/handlers/scrape_mode_handlers";

export interface MessageContent {

}

export interface TabDetailsMessageContent {
    tab_id: number;
    window_id: number;
    top_frame_url: string;
}

export interface WindowIdMessageContent {
    window: number;
}

export interface WindowsMessageContent {
    window_ids: number[];
}

export interface ColumnIndexMessageContent {
    index: number;
}

export interface LikelyRelationMessageContent {
    xpaths: string[];
    pageVarName: string;
    serverSuggestedRelations: (GenericSelector | null)[];
}

export interface FreshRelationItemsMessage {
    type: number;
    relation: MainpanelNodeRep[][];
}