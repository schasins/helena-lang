import { XPath } from "./xpath";
import XPathNode = XPath.XPathNode;
import XPathList = XPath.XPathList;
/**
 * Interfaces and functions for creating and modifying features of DOM elements.
 */
export declare namespace Features {
    /**
     * All supported features except XPath.
     */
    export const FEATURES_EXCEPT_XPATH: string[];
    /**
     * Contains information on what criteria to match for a certain feature.
     */
    interface FeatureCriteria {
        /**
         * Whether the criteria is positive or negative.
         * true means positive; node should match this value
         * false means negate; node should NOT match this value
         */
        pos: boolean;
        values: (string | XPathNode[])[];
    }
    /**
     * A generic interface to inherit specific feature sets from.
     */
    export interface GenericFeatureSet {
    }
    /**
     * A set of features describing how to find the rows for a relation.
     */
    export interface FeatureSet extends GenericFeatureSet {
        [key: string]: FeatureCriteria;
    }
    /**
     * A separate feature set for handling tables.
     */
    export interface TableFeatureSet extends GenericFeatureSet {
        table: boolean;
        xpath: string;
    }
    export interface PulldownFeatureSet extends GenericFeatureSet {
        type: string;
        index: number;
    }
    /**
     * Computes the value of a feature from an element.
     * @param element element
     * @param feature feature name
     */
    export function computeFeatureFromElement(element: HTMLElement, feature: string): any;
    /**
     * Checks if feature value is within acceptable values.
     * @param feature feature type
     * @param value feature value
     * @param acceptable_values acceptable feature values to match to
     * @returns true if feature value is within acceptable values
     */
    export function featureMatches(feature: string, value: string | XPathList, acceptable_values: (string | XPathList)[]): boolean;
    /**
     * Merges feature values from multiple elements to find common feature values.
     *   Removes any features for which there are no common feature values or the
     *   maximum common feature values is exceeded.
     * For general arrays, deduplicate feature value arrays.
     * For xpath arrays, multiple xpaths with overlapping sections are merged
     *   using wildcard (*)s where possible.
     * @param featureSet the unmerged feature set
     * @param maxFeatureValues the maximum number of common feature values
     */
    export function mergeFeatureValues(featureSet: FeatureSet, maxFeatureValues?: number): void;
    /**
     * Creates a {@link FeatureSet} for features from matched elements.
     * @param features list of features to use
     * @param matchedEls matched elements
     */
    export function getFeatureSet(features: string[], matchedEls: HTMLElement[]): FeatureSet;
    /**
     * Create a {@link TableFeatureSet} from a table element.
     * @param tableEl table element
     */
    export function createTableFeatureSet(tableEl: HTMLElement): TableFeatureSet;
    export {};
}
