import * as stringify from "json-stable-stringify";

import { MainpanelNodeRep } from "../handlers/scrape_mode_handlers";

import { SelectorMessage } from "../../common/messages";

import { ColumnSelector } from "./column_selector";
import ColSelector = ColumnSelector.ColSelector;

import { Features } from "../utils/features";
import GenericFeatureSet = Features.GenericFeatureSet;
import FeatureSet = Features.FeatureSet;
import PulldownFeatureSet = Features.PulldownFeatureSet;
import TableFeatureSet = Features.TableFeatureSet;

import { XPath } from "../utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;

/**
 * A selector describing a next/pagination button on a page.
 */
export interface NextButtonSelector {
  id: string;
  class: string;
  src: string | null;
  frame_id: string | null;
  tag: string;
  text: string | null;
  xpath: string;
}
  
/**
 * Retrieve all candidate elements from the document.
 */
function getAllCandidateElements() {
  return <HTMLElement[]> [].slice.call(document.getElementsByTagName("*"));
}

/**
 * Counts how many XPath expressions in xpaths intersects with the xpaths of
 *   the cells in the first row.
 * @param xpaths XPath expressions
 * @param firstRow cells in first row
 */
function numMatchedXpaths(xpaths: string[], firstRow: MainpanelNodeRep[]) {
  let firstRowXpaths = firstRow.map((cell) => cell.xpath);
  return xpaths.filter((xpath) => firstRowXpaths.includes(xpath)).length;
}

/**
 * Get cells in each of the candidateRowNodes matching the suffixes.
 * @param suffixes the tail end of each XPath for a column, which excludes the
 *   XPath up to the row element
 * @param candidateRowNodes candidate row nodes, or null if none found  
 */
function getCellsInRowMatchingSuffixes(
    suffixes: SuffixXPathList | SuffixXPathList[],
    candidateRowNodes: (HTMLElement | null)[]) {
  let candidateSubitems = [];
  let rowNodeXPaths = candidateRowNodes.map((candidateRow) =>
    OldXPathList.xPathToXPathList(XPath.fromNode(candidateRow))
  );
  for (let j = 0; j < suffixes.length; j++){
    // TODO: clean this up
    // suffixes[j] will be depth 2 if only one suffix available,
    // depth 3 if list of suffixes available
    let suffixLs: SuffixXPathList[];
    // < 3 rather than = 2 because we use empty suffix for single-col datasets
    if (window.MiscUtilities.depthOf(suffixes[j]) < 3){ 
      suffixLs = [ <SuffixXPathList> suffixes[j] ];
    } else {
      suffixLs = <SuffixXPathList[]> suffixes[j];
    }

    let foundSubItem = null;
    for (let k = 0; k < suffixLs.length; k++){
      let rowNodeXPath = null;
      let suffixListRep = null;
      let selectorIndex = suffixLs[k].selectorIndex;

      // selectorIndex can be 0, which is why we check for undefined
      if (selectorIndex !== undefined) {
        // we know exactly which of the candidate row nodes to use because a
        //   selector index is provided
        rowNodeXPath = rowNodeXPaths[selectorIndex];
        suffixListRep = suffixLs[k].suffixRepresentation;
      } else {
        // this suffix isn't one of our selectorIndex-labeled objects. it is
        //   the old array representation so we should have only one selector
        //   and thus only one candidate row node
        rowNodeXPath = rowNodeXPaths[0];
        suffixListRep = suffixLs[k];
        if (candidateRowNodes.length > 1){
          window.WALconsole.warn("Woah, bad, we have no selector index associated " +
            "with a column suffix, but we have multiple row nodes.");
        }
      }
      let xpath = rowNodeXPath.concat(suffixListRep);
      let xpath_string = OldXPathList.xPathToString(xpath);
      let nodes = <HTMLElement[]> xPathToNodes(xpath_string);
      if (nodes.length > 0){
        foundSubItem = nodes[0];
        break;
      }
    }
    // either push the found subitem, or null if none found
    candidateSubitems.push(foundSubItem);
  }
  let atLeastOneNonNullCandidate = candidateSubitems.some((item) => item);
  if (candidateSubitems.length > 0 && atLeastOneNonNullCandidate){
    return candidateSubitems;
  }
  return null;
}

/**
   * Adds necessary information for {@link SuffixXPathNode} to a list of
   *   {@link ColSelector}s.
   * @param colSelectors column selectors 
   * @param selectorIndex selector index for suffix
   */
  function labelColumnSuffixesWithTheirSelectors(
    colSelectors: ColSelector[], selectorIndex: number) {
  
    for (const col of colSelectors) {
      let curSuffixes = col.suffix;
      if (window.MiscUtilities.depthOf(curSuffixes) < 3) {
        // when we have only one suffix node, we don't store it in a list, but
        //   the below is cleaner if we just have a list; todo: clean up
        curSuffixes = [ <SuffixXPathList> curSuffixes ];
      }
      let outputSuffixLs = [];
      for (const suffix of curSuffixes) {
        if (suffix.selectorIndex) {
          // it's already an object with a selector index, and we just need to
          //   update the selectorIndex
          suffix.selectorIndex = selectorIndex;
          outputSuffixLs.push(suffix);
        } else {
          // ah, still just the old list representation of a selector.  need to
          //   make it into a selectorIndex-labeled object
          outputSuffixLs.push({
            selectorIndex: selectorIndex,
            suffixRepresentation: suffix
          });
        }
      }
      col.suffix = outputSuffixLs;
    }
  }

export class RelationSelector {
  selector_version: number;
  selector: GenericFeatureSet | GenericFeatureSet[];
  name?: string | null;
  exclude_first: number;
  id?: number;
  columns: ColSelector[];
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

  /** Properties used in {@link ComparisonSelector}. */
  numMatchedXpaths?: number;
  numRows?: number;
  numRowsInDemo?: number;
  numColumns?: number;

  constructor(featureSet: GenericFeatureSet | GenericFeatureSet[],
    exclude_first: number, columns: ColSelector[], selector_version = 1) {
      this.selector_version = selector_version;
      this.selector = featureSet;
      this.exclude_first = exclude_first;
      this.columns = columns;
  }

  /**
   * Get all the cells to be extracted given multiple rows where each row is
   *   extracted from a selector.
   * @param rows a collection of elements where each element represents a row
   */
  public getMatchingCells(rows: HTMLElement[][]) {
    // now we'll use the columns info to actually get the cells
    let suffixes = this.columns.map((col) => col.suffix);
    
    // only use multiple selectors up to the point where they have the same
    //   number of rows
    let allCells = [];
    let maxRowCount = Math.max(...(rows.map(rows => rows.length)));
    for (let rowIndex = 0; rowIndex < maxRowCount; rowIndex++) {
      let curRowNodes = [];
      for (let selIndex = 0; selIndex < rows.length; selIndex++) {
        if (rows[selIndex].length > rowIndex) {
          curRowNodes.push(rows[selIndex][rowIndex]);
        } else {
          curRowNodes.push(null);
        }
      }
      let curRowCells = getCellsInRowMatchingSuffixes(suffixes, curRowNodes);
      if (curRowCells !== null) {
        allCells.push(curRowCells);
      }
    }
    return allCells;
  }

  /**
   * Gets elements representing the rows of the relation to be extracted.
   */
  public getMatchingRows(): HTMLElement[][] {
    if (!this.selector){
      return [];
    }

    if (Array.isArray(this.selector)){
      // the case where we need to recurse
      let selectorArray = this.selector;
      let rowNodeLists: HTMLElement[][] = [];
      for (let i = 0; i < selectorArray.length; i++){
        let possibleSelector = selectorArray[i];
        this.selector = possibleSelector;
        let newRowNodesLs = this.getMatchingRows();
        rowNodeLists = rowNodeLists.concat(newRowNodesLs);
      }
      this.selector = selectorArray;
      return rowNodeLists;
    }

    return this.getMatchingElements();
  }

  /**
   * Gets the document elements matching the features specified in selector for
   *   the general, non-table case.
   * @param excludeFirst exclude this many rows from extraction (e.g. headers)
   */
  public getMatchingElements() {
    let featureSet = <FeatureSet> this.selector;
    
    // window.WALconsole.log("interpretRelationSelectorHelper", feature_dict,
    //   excludeFirst, subcomponents_function);
    let candidates = getAllCandidateElements();
    let listOfRowNodes = [];
    for (let i = 0; i < candidates.length; i++) {
      let candidate = candidates[i];
      let candidate_ok = true;
      for (const feature in featureSet) {
        let value = Features.computeFeatureFromElement(candidate, feature);
        let acceptable_values = featureSet[feature].values;
        let pos = featureSet[feature].pos;
        let candidate_feature_match = Features.featureMatches(feature, value,
          acceptable_values);
        if ((pos && !candidate_feature_match) ||
           (!pos && candidate_feature_match)) {
          candidate_ok = false;
          break;
        }
      }
      if (candidate_ok) {
        listOfRowNodes.push(candidate);
      }
    }
    if (this.exclude_first > 0 && listOfRowNodes.length > this.exclude_first){
      return [listOfRowNodes.slice(this.exclude_first, listOfRowNodes.length)];
    }
    window.WALconsole.log("listOfRowNodes", listOfRowNodes);
    return [listOfRowNodes];
  }


  /**
   * Get a relation from the document given the selector.
   * @returns a relation (i.e. a 2d array) with the matching data
   */
  public getMatchingRelation(): (HTMLElement | null)[][] {
    let rowNodeLists = this.getMatchingRows();
    // now that we have some row nodes, time to extract the individual cells
    let cells = this.getMatchingCells(rowNodeLists);
    window.WALconsole.log("cells", cells);
    //cells = onlyDisplayedCellsAndRows(cells);
    window.WALconsole.log("returning cells 1", cells);
    return cells;
  }

  /**
   * Create a selector object from a message representing it.
   * @param msg the message
   */
  public static fromMessage(msg: SelectorMessage) {
    let newSelector;
    if (msg.selector && 'table' in msg.selector) {
      newSelector = new TableSelector(<TableFeatureSet> msg.selector,
        msg.exclude_first, msg.columns, msg.selector_version);
    } else {
      newSelector = new RelationSelector(msg.selector, msg.exclude_first,
        msg.columns, msg.selector_version);
    }
    
    newSelector.name = msg.name;
    newSelector.id = msg.id;
    newSelector.num_rows_in_demonstration = msg.num_rows_in_demonstration;
    newSelector.next_type = msg.next_type;
    newSelector.prior_next_button_text = msg.prior_next_button_text;
    newSelector.next_button_selector = msg.next_button_selector;
    newSelector.url = msg.url;
    newSelector.positive_nodes = msg.positive_nodes;
    newSelector.negative_nodes = msg.negative_nodes;
    newSelector.relation = msg.relation;
    newSelector.page_var_name = msg.page_var_name;
    newSelector.relation_id = msg.relation_id;
    newSelector.first_page_relation = msg.first_page_relation;
    newSelector.pulldown_relations = msg.pulldown_relations;
    newSelector.relation_scrape_wait = msg.relation_scrape_wait;

    return newSelector;
  }

  /**
   * Create a {@link RelationSelector} given positive and negative elements.
   * @param positiveEls positive elements to include
   * @param negativeEls negative elements to exclude
   * @param columns {@link ColSelector}s to include in selector
   * @param features set of features to examine
   */
  public static fromPositiveAndNegativeElements(positiveEls: HTMLElement[],
    negativeEls: HTMLElement[], columns: ColSelector[],
    features = ["tag", "xpath"]): RelationSelector {
      let featureSet = Features.getFeatureSet(features, positiveEls);

      // If we can't shrink things down to less than 3 common XPaths, then
      //   exclude XPath and use the other features.
      if (featureSet["xpath"]?.values.length > 3 &&
          features !== Features.FEATURES_EXCEPT_XPATH) {
        return RelationSelector.fromPositiveAndNegativeElements(positiveEls,
          negativeEls, columns, Features.FEATURES_EXCEPT_XPATH);
      }
  
      let relSel = new RelationSelector(featureSet, 0, columns);
      let rows = relSel.getMatchingRelation();
      
      //now handle negative examples
      let exclude_first = 0;
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++){
        let nodes = rows[rowIndex];
        for (const node of nodes) {
          if (node && negativeEls.includes(node)) {
            if (rowIndex === 0) {
              exclude_first = 1;
            } else if (features !== Features.FEATURES_EXCEPT_XPATH) {
              // xpaths weren't enough to exclude nodes we need to exclude
              window.WALconsole.log("need to try more features.");
              return RelationSelector.fromPositiveAndNegativeElements(
                positiveEls, negativeEls, columns,
                Features.FEATURES_EXCEPT_XPATH);
            }
            else {
              window.WALconsole.log(featureSet);
              throw new Error("Failed to exclude all negative nodes " + 
                "even with all features.");
            }
          }
        }
      }

      relSel.exclude_first = exclude_first;
      relSel.positive_nodes = positiveEls;
      relSel.negative_nodes = negativeEls;
      return relSel;
  }
  
  /**
   * Converts this to a content selector by setting the relation.
   */
  public toContentSelector(): ContentSelector {
    this.relation = this.getMatchingRelation();
    this.num_rows_in_demonstration = this.relation.length;
    return <ContentSelector> this;
  }

  /**
   * Converts this to a comparison selector for finding the best selector.
   * @param relation relation in mainpanel format
   * @param xpaths xpaths
   */
  public toComparisonSelector(rel: MainpanelNodeRep[][], xpaths: string[]):
    ComparisonSelector {
    let compSel = <ComparisonSelector> this;
    compSel.relation = rel;
    compSel.numMatchedXpaths = rel.length === 0? 0 : numMatchedXpaths(xpaths, rel[0]);
    compSel.numRows = rel.length;
    compSel.numRowsInDemo = this.num_rows_in_demonstration? this.num_rows_in_demonstration : rel.length;
    compSel.numColumns = rel.length === 0? 0 : rel[0].length;
    return compSel;
  }

  /**
   * Merges information from other selector into current selector.
   * @param other selector to add
   */
  public merge(other: RelationSelector) {
    if (Array.isArray(other)) {
      throw new ReferenceError("This function only permits a singular value" +
        " for `selectorToAdd.selector`");
    }
    let featureSetToAdd = <GenericFeatureSet> other.selector;

    let origFeatureSet = this.selector;
    if (!origFeatureSet) { 
      // can happen that we have no selector to augment, if we're actually
      //   demo-ing a new relation
      origFeatureSet = [];
      this.columns = [];
    }
    
    if (Array.isArray(origFeatureSet)) {
      // cool, no need to mess around with the current selector's columns
      // let's just add the new selector to the list
      this.selector = origFeatureSet.concat([ featureSetToAdd ]);
    } else {
      // ok, this selector used to have just one.  let's go ahead and turn it
      //   into a list and make sure all its column objects have all their
      //   suffixes labeled with index 0, since the current selector will be
      //   the first in the list
      this.selector = [origFeatureSet, featureSetToAdd];
      labelColumnSuffixesWithTheirSelectors(this.columns, 0);
    }
    // and in either case, we need to add the new selectors columns to the prior
    //   set of columns, and we need to label them with the position in the list
    //   of selectors (len minus one)
    labelColumnSuffixesWithTheirSelectors(other.columns,
      (<GenericFeatureSet[]> this.selector).length - 1);
    this.columns = this.columns.concat(other.columns);
  }

  /**
   * Produces a stringified version of necessary keys on the selector.
   */
  public hash() {
    return stringify({
      name: this.name,
      selector: this.selector,
      columns: this.columns,
      selector_version: this.selector_version,
      exclude_first: this.exclude_first,
      next_type: this.next_type,
      next_button_selector: this.next_button_selector,
      url: this.url,
      num_rows_in_demonstration: this.num_rows_in_demonstration
    });
  }
}

/**
 * A selector with the relation referring to a 2d-array of DOM Elements.
 * TODO: cjbaik: do something about strange additional properties here?
 */
export class ContentSelector extends RelationSelector {
  relation: (HTMLElement | null)[][];
  editingClickColumnIndex?: number;
  origSelector?: ContentSelector;
  currentIndividualSelector?: ContentSelector;

  constructor(featureSet: GenericFeatureSet | GenericFeatureSet[],
    exclude_first: number, columns: ColSelector[], selector_version = 1) {
      super(featureSet, exclude_first, columns, selector_version);
  }
}

/**
 * A selector specifically for handling tables.
 */
export class TableSelector extends RelationSelector {
  selector: TableFeatureSet;

  /**
   * Gets the document elements matching the features specified in selector for
   *   a table element.
   * @param excludeFirst exclude this many rows from extraction (e.g. headers)
   */
  public getMatchingElements() {
    let selector = <TableFeatureSet> this.selector;

    // we don't use this for nested tables! this is just for very simple tables,
    //   otherwise we'd graduate to the standard approach
    let nodes = xPathToNodes(selector.xpath);
    let table = null;
    if (nodes.length > 0) {
      // awesome, we have something at the exact xpath
      table = <HTMLElement> nodes[0];
    } else {
      // ok, I guess we'll have to see which table on the page is closest
      let tables = [].slice.call(document.getElementsByTagName("table"));
      let bestTableScore = Number.POSITIVE_INFINITY;

      for (const t of tables) {
        let distance = window.MiscUtilities.levenshteinDistance(
          XPath.fromNode(t), selector.xpath);
        if (distance < bestTableScore){
          bestTableScore = distance;
          table = t;
        }
      }
    }

    // ok, now we know which table to use

    if (table === null) {
      throw new ReferenceError(`Could not find table matching ${JSON.stringify(selector)}`);
      // todo: why is this arising?
      // return []; 
    }

    let rows = [].slice.call(table.querySelectorAll("tr"));
    rows = rows.slice(this.exclude_first, rows.length);
    return [rows];
  }

  constructor(featureSet: TableFeatureSet, exclude_first: number,
    columns: ColSelector[], selector_version = 1) {
      super(featureSet, exclude_first, columns, selector_version);
  }
}

/**
 * A selector for handling <select> elements.
 */
export class PulldownSelector extends RelationSelector {
  /**
   * cjbaik: Not sure what this does, or if it is even ever called.
   * @param selector 
   */
  public static getNodesForPulldownSelector(selector: PulldownFeatureSet) {
    let allSelectNodes = document.getElementsByTagName("select");
    // then just index into it, because our current approach to pulldowns is
    //   crazy simplistic
    let selectorNode = allSelectNodes[selector.index];
    console.log("selector: ", selector, selector.index, selectorNode);
    if (!selectorNode.disabled) {
      console.log("selector enabled");
      let optionNodes = [].slice.call(selectorNode.querySelectorAll("option"));
      console.log("option nodes", optionNodes);
      return optionNodes;
    }
    console.log("selector not enabled");
    // else, we know which pulldown we want, but it's disabled right now.
    //   let's wait
    return [];
  }

  /**
   * Get a relation from the document given the selector.
   * @returns a relation (i.e. a 2d array) with the matching data
   */
  public getMatchingRelation(): (HTMLElement | null)[][] {
    // TODO: cjbaik: cannot tell if this is ever used...
    let optionNodes = PulldownSelector.getNodesForPulldownSelector(
      <PulldownFeatureSet> this.selector);
    optionNodes = optionNodes.splice(this.exclude_first, optionNodes.length);
    return optionNodes.map((o: HTMLElement[]) => [o]);
  }

  constructor(featureSet: GenericFeatureSet | GenericFeatureSet[],
    exclude_first: number, columns: ColSelector[]) {
      // selector_version is always 2 for PulldownSelector
      super(featureSet, exclude_first, columns, 2);

  }
}

/**
 * Selector with additional metadata for selecting the "best" selector.
 */ 
export class ComparisonSelector extends RelationSelector {
  relation: MainpanelNodeRep[][];
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
  public static bestOf(first: ComparisonSelector, second: ComparisonSelector) {
    // first things first, before we get into anything else, we always want a
    //   relation with more than one row or else we don't really care about it.
    //   so default or no, we're going to eliminate it if it only has one
    if (first.numRowsInDemo > 1 && second.numRowsInDemo <= 1) {
      return first;
    }
    else if (second.numRowsInDemo > 1 && first.numRowsInDemo <= 1) {
      return second;
    }

    // normal processesing - just go through the features we care about, and
    //   pick default if it wins on any of our ordered list of features, else
    //   the alternative. we only really get into crazy tie breakers if we're
    //   tied on num of matched xpaths, because whichever wins there can
    //   automatically win the whole thing but if they're tied, we go into the
    //   extra feature deciders
    if (first.numMatchedXpaths > second.numMatchedXpaths){
      return first;
    }
    else if (first.numMatchedXpaths === second.numMatchedXpaths){
      if (first.numRows > second.numRows){
        return first;
      }
      else if (first.numRows === second.numRows){
        if (first.numRowsInDemo > second.numRowsInDemo){
          return first;
        }
        else if (first.numRowsInDemo === second.numRowsInDemo){
          if (first.numColumns > second.numColumns){
            return first;
          }
          else if (first.numColumns === second.numColumns){
            if (first.next_type !== null && second.next_type === null){
              // first has a next button method, but second
              //   doesn't, so first better
              return first;
            }
            else if (!(second.next_type !== null && first.next_type === null)) {
              // it's not the case that second has next method and first
              //   doesn't, so either both have it or neither has it, so
              //   they're the same, so just return the default one
              return first;
            }
          }
        }
      }
    }
    return second;
  }
}