import { MainpanelNode } from "./mainpanel_node";
import MainpanelNodeI = MainpanelNode.Interface;

import { Features } from "../content/utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;

import { XPath } from "../content/utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;

import { NextButtonSelector } from "../content/selector/next_button_selector";
import { RelationSelector } from "../content/selector/relation_selector";
import { ColumnSelector } from "../content/selector/column_selector";

export interface ColumnSelectorMessage {
  xpath: string;
  suffix: SuffixXPathList | SuffixXPathList[];
  name?: string;
  id: number | null;
  index?: string;
}

/*
export interface XPathNodeMessage {
  nodeName: string;
  index: string;
  iterable: boolean;
}*/

/*
export interface FeatureCriteriaMessage {
  pos: boolean;
  values: (string | XPathNodeMessage[])[];
}*/

/*
export interface FeatureSetMessage {
  [key: string]: FeatureCriteriaMessage;
} */

/**
 * A generic selector describing how to extract a relation from a page.
 * TODO: cjbaik: a lot of strange properties to edit here.
 */
/*
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
}*/

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
  serverSuggestedRelations: (RelationSelector | null)[];
}

export interface FreshRelationItemsMessage {
  type: number;
  relation: MainpanelNodeI[][];
}

export interface EventMessage {
  additional: {
    scrape: MainpanelNode.Interface,
    visualization: string;
  };
  data: {
    altKey: boolean;
    ctrlKey: boolean;
    ctrlKeyOnLinux: boolean;
    tabId: number;
    type: string;
    shiftKey: boolean;
    metaKey: boolean;
    metaKeyOnMac: boolean;
    url: string;
    keyCode?: number;
  };
  forceReplay: boolean;
  frame: {
    iframeIndex: number;
    topURL: string;
    URL: string;
  };
  meta: {
    deltas: Delta[];
  };
  target: {
    snapshot: MainpanelNode.Interface[];
    xpath: string;
  };
  targetTimeout: number;
  timing: {
    ignoreWait: boolean;
    waitTime: number;
  };
  type: string;
}

export interface Delta {
  divergingProp: string;
  changed: {
    prop: {
      [key: string]: any;
    };
  }
}

export interface ContentMessage {
  tab_id: number;
}

export interface EditRelationMessage {
  relation: null;
  demonstration_time_relation: MainpanelNodeI[][];
  colors: string[];
}

export interface NextButtonSelectorMessage {
  selector: NextButtonSelector.Interface;
}

export interface RelationMessage {
  id: string;
  name: string;
  selector: GenericFeatureSet | GenericFeatureSet[];
  selector_version: number;
  exclude_first: number,
  columns: ColumnSelector.Interface[],
url: string;
  next_type?: number;
  next_button_selector?: NextButtonSelector.Interface | null;
  num_rows_in_demonstration?: number;
  relation_scrape_wait: number;
  prior_next_button_text?: string;
}

export interface NextButtonTextMessage {
  text: string;
}

// TODO: cjbaik: not sure if name is correct
export interface SkipBlockResponse {
  exists: boolean;
  task_yours: boolean;
}

export interface ServerSaveResponse {
  program: {
    id: string;
  }
}

export interface RetrieveRelationsResponse {
  pages: {
    page_var_name: string;
    relations: {
      same_domain_best_relation: string;
      same_url_best_relation: string;
    }
  }[];
}

export interface RelationResponse {
  columns: ColumnSelector.Interface[];
  exclude_first: number;
  first_page_relation: MainpanelNode.Interface[][];
  frame: number;
  name: string;
  next_button_selector: NextButtonSelector.Interface;
  next_type: number;
  num_rows_in_demonstration: number;
  page_var_name: string;
  pulldown_relations: RelationResponse[];
  relation_id: string;
  selector: GenericFeatureSet[];
  selector_version: number;
  url: string;
}