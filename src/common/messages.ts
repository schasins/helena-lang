import { MainpanelNodeRep } from "../content/handlers/scrape_mode_handlers";

import { Features } from "../content/utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;

import { NextButtonSelector } from "../content/selector/next_button_selector";

import { ColumnSelector } from "../content/selector/column_selector";

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
    columns: ColumnSelector.Interface[];
    num_rows_in_demonstration?: number;
    next_type?: number;
    prior_next_button_text?: string;
    next_button_selector?: NextButtonSelector.Interface | null;
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
    serverSuggestedRelations: (SelectorMessage | null)[];
}

export interface FreshRelationItemsMessage {
    type: number;
    relation: MainpanelNodeRep[][];
}