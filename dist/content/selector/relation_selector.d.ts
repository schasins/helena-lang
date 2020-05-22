import { MainpanelNode } from "../../common/mainpanel_node";
import MainpanelNodeI = MainpanelNode.Interface;
import { LikelyRelationMessage, RelationMessage } from "../../common/messages";
import { Features } from "../utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;
import PulldownFeatureSet = Features.PulldownFeatureSet;
import TableFeatureSet = Features.TableFeatureSet;
import { INextButtonSelector, IColumnSelector } from "./interfaces";
import { ServerRelationMessage } from "../../mainpanel/utils/server";
export declare class RelationSelector {
    selector_version: number;
    selector: GenericFeatureSet | GenericFeatureSet[];
    name?: string | null;
    exclude_first: number;
    id?: string;
    columns: IColumnSelector[];
    num_rows_in_demonstration?: number;
    next_type?: number;
    prior_next_button_text?: string;
    next_button_selector?: INextButtonSelector | null;
    url?: string;
    positive_nodes?: HTMLElement[];
    negative_nodes?: HTMLElement[];
    relation?: ((HTMLElement | MainpanelNodeI | null)[][]) | null;
    page_var_name?: string;
    relation_id?: string | null;
    first_page_relation?: (HTMLElement | MainpanelNodeI | null)[][];
    pulldown_relations?: RelationSelector[];
    relation_scrape_wait?: number;
    /** Properties used in {@link ComparisonSelector}. */
    numMatchedXpaths?: number;
    numRows?: number;
    numRowsInDemo?: number;
    numColumns?: number;
    constructor(featureSet: GenericFeatureSet | GenericFeatureSet[], exclude_first: number, columns: IColumnSelector[], selector_version?: number);
    static fromJSON(msg: ServerRelationMessage): RelationSelector;
    /**
     * Get all the cells to be extracted given multiple rows where each row is
     *   extracted from a selector.
     * @param rows a collection of elements where each element represents a row
     */
    getMatchingCells(rows: HTMLElement[][]): (HTMLElement | null)[][];
    /**
     * Gets elements representing the rows of the relation to be extracted.
     */
    getMatchingRows(): HTMLElement[][];
    /**
     * Gets the document elements matching the features specified in selector for
     *   the general, non-table case.
     * @param excludeFirst exclude this many rows from extraction (e.g. headers)
     */
    getMatchingElements(): HTMLElement[][];
    /**
     * Get a relation from the document given the selector.
     * @returns a relation (i.e. a 2d array) with the matching data
     */
    getMatchingRelation(): (HTMLElement | null)[][];
    /**
     * Create a selector object from a message representing it.
     * @param msg the message
     */
    static fromMessage(msg: RelationMessage): RelationSelector | TableSelector;
    /**
     * Create a {@link RelationSelector} given positive and negative elements.
     * @param positiveEls positive elements to include
     * @param negativeEls negative elements to exclude
     * @param columns {@link IColumnSelector}s to include in selector
     * @param features set of features to examine
     */
    static fromPositiveAndNegativeElements(positiveEls: HTMLElement[], negativeEls: HTMLElement[], columns: IColumnSelector[], features?: string[]): RelationSelector;
    highlight(): void;
    /**
     * Converts this to a content selector by setting the relation.
     */
    toContentSelector(): ContentSelector;
    /**
     * Converts this to a comparison selector for finding the best selector.
     * @param relation relation in mainpanel format
     * @param xpaths xpaths
     */
    toComparisonSelector(rel: MainpanelNodeI[][], xpaths: string[]): ComparisonSelector;
    /**
     * Merges information from other selector into current selector.
     * @param other selector to add
     */
    merge(other: RelationSelector): void;
    /**
     * Produces a stringified version of necessary keys on the relation selector.
     */
    hash(): string;
    /**
     * Produces a stringified version of necessary keys on the relation message.
     */
    static hash(msg: RelationMessage | RelationSelector): string;
}
/**
 * A selector with the relation referring to a 2d-array of DOM Elements.
 */
export declare class ContentSelector extends RelationSelector {
    relation: (HTMLElement | null)[][];
    editingClickColumnIndex?: number;
    origSelector?: ContentSelector;
    currentIndividualSelector?: ContentSelector;
    constructor(featureSet: GenericFeatureSet | GenericFeatureSet[], exclude_first: number, columns: IColumnSelector[], selector_version?: number);
    /**
     * Create {@link ContentSelector} from a subset of cell elements comprising a
     *   row such that the largest subsets are considered first, with the number
     *   of rows found in the relation acting as a tiebreaker.
     * @param cells list of cell elements in the row
     * @param minSubsetSize minimum number of cell elements to consider
     */
    static fromLargestRowSubset(cells: HTMLElement[], minSubsetSize: number): ContentSelector | null;
    /**
     * Create {@link ContentSelector} given a list of cells comprising a row.
     * @param cells list of cell elements in the row
     */
    static fromRow(cells: HTMLElement[]): ContentSelector;
    /**
     * Highlight relation indicated by selector.
     */
    highlight(): void;
}
/**
 * A selector specifically for handling tables.
 */
export declare class TableSelector extends ContentSelector {
    selector: TableFeatureSet;
    constructor(featureSet: TableFeatureSet, exclude_first: number, columns: IColumnSelector[], selector_version?: number);
    /**
     * Create a selector for cells residing in a <table> element.
     * @param cells elements describing cells in the row
     */
    static fromTableRow(cells: HTMLElement[]): TableSelector | null;
    /**
     * Gets the document elements matching the features specified in selector for
     *   a table element.
     * @param excludeFirst exclude this many rows from extraction (e.g. headers)
     */
    getMatchingElements(): any[];
}
/**
 * A selector for handling <select> elements.
 */
export declare class PulldownSelector extends RelationSelector {
    /**
     * cjbaik: Not sure what this does, or if it is even ever called.
     * @param selector
     */
    static getNodesForPulldownSelector(selector: PulldownFeatureSet): any;
    /**
     * Get a relation from the document given the selector.
     * @returns a relation (i.e. a 2d array) with the matching data
     */
    getMatchingRelation(): (HTMLElement | null)[][];
    /**
     * Create list of {@link PulldownSelector}s for XPaths of <select>
     *   (i.e. pulldown) elements.
     * @param msg message content from mainpanel
     * @param pulldownXPaths xpaths containing pulldowns
     */
    static fromXPaths(msg: LikelyRelationMessage, pulldownXPaths: string[]): PulldownSelector[];
    constructor(featureSet: GenericFeatureSet | GenericFeatureSet[], exclude_first: number, columns: IColumnSelector[]);
}
/**
 * Selector with additional metadata for selecting the "best" selector.
 */
export declare class ComparisonSelector extends RelationSelector {
    relation: MainpanelNodeI[][];
    numMatchedXpaths: number;
    numRows: number;
    numRowsInDemo: number;
    numColumns: number;
    /**
     * Selects the preferred selector among the two in order of:
     *   1. largest number of target xpaths in the first row,
     *   2. largest number of rows retrieved from the page,
     *   3. largest num of rows in original demonstration,
     *   4. largest number of columns associated with relation
     *   5. other miscellaneous criteria
     * @param first first selector
     * @param second second selector
     */
    static bestOf(first: ComparisonSelector, second: ComparisonSelector): ComparisonSelector;
}
