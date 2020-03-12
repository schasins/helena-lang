import { MainpanelNode } from "./mainpanel_node";
import MainpanelNodeI = MainpanelNode.Interface;

import { Features } from "../content/utils/features";
import TableFeatureSet = Features.TableFeatureSet;

import { NextButtonSelector } from "../content/selector/next_button_selector";

import { XPath } from "../content/utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;

export interface ColumnSelectorMessage {
    xpath: string;
    suffix: SuffixXPathList | SuffixXPathList[];
    name?: string;
    id: number | null;
    index?: string;
}

export interface XPathNodeMessage {
    nodeName: string;
    index: string;
    iterable: boolean;
  }

export interface FeatureCriteriaMessage {
    pos: boolean;
    values: (string | XPathNodeMessage[])[];
}

export interface FeatureSetMessage {
    [key: string]: FeatureCriteriaMessage;
}

/**
 * A generic selector describing how to extract a relation from a page.
 * TODO: cjbaik: a lot of strange properties to edit here.
 */
export interface SelectorMessage {
    selector_version: number;
    selector: FeatureSetMessage | FeatureSetMessage[] | TableFeatureSet;
    name?: string | null;
    exclude_first: number;
    id?: number;
    columns: ColumnSelectorMessage[];
    num_rows_in_demonstration?: number;
    next_type?: number;
    prior_next_button_text?: string;
    next_button_selector?: NextButtonSelector.Interface | null;
    url?: string;

    positive_nodes?: HTMLElement[];
    negative_nodes?: HTMLElement[];

    relation?: ((HTMLElement | MainpanelNodeI | null)[][]) | null;
    page_var_name?: string;
    relation_id?: number | null;
    first_page_relation?: (HTMLElement | MainpanelNodeI | null)[][];
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
    relation: MainpanelNodeI[][];
}

export interface EventMessage {
    data: {
        type: string;
        shiftKey: boolean;
        metaKey: boolean;
    }
}