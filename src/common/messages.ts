import { MainpanelNodeRep } from "../content/handlers/scrape_mode_handlers";

import { Features } from "../content/utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;

import { ColumnSelector,
    NextButtonSelector } from "../content/relations/relation_selector";

export interface MessageContent {

}

/**
 * A generic selector describing how to extract a relation from a page.
 * TODO: cjbaik: a lot of strange properties to edit here.
 */
export interface SelectorMessage {
    selector_version: number;
    selector: GenericFeatureSet | GenericFeatureSet[];
    name?: string | null;
    exclude_first: number;
    id?: number;
    columns: ColumnSelector[];
    num_rows_in_demonstration?: number;
    next_type?: number;
    prior_next_button_text?: string;
    next_button_selector?: NextButtonSelector | null;
    url?: string;

    positive_nodes?: HTMLElement[];
    negative_nodes?: HTMLElement[];

    relation?: ((HTMLElement | MainpanelNodeRep | null)[][]) | null;
    page_var_name?: string;
    relation_id?: number | null;
    first_page_relation?: (HTMLElement | MainpanelNodeRep | null)[][];
    pulldown_relations?: SelectorMessage[];

    relation_scrape_wait?: number;
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
    serverSuggestedRelations: (SelectorMessage | null)[];
}

export interface FreshRelationItemsMessage {
    type: number;
    relation: MainpanelNodeRep[][];
}