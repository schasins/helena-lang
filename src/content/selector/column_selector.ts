import { XPath } from "../utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;

/**
  * A selector describing how to extract a column of a relation with respect to
  *   some kind of common ancestor describing a row.
  */
export namespace ColumnSelector {
  export interface Interface {
    xpath: string;
    suffix: SuffixXPathList | SuffixXPathList[];
    name?: string;
    id: number | null;
    index?: number;
  }
  
  /**
   * Gets array of {@link ColumnSelector.Interface} of each descendant element
   *   given the ancestor element.
   * @param ancestor ancestor element
   * @param descendants descendant elements
   */
  export function compute(ancestor: HTMLElement,
    descendants: (HTMLElement | null)[]) {
    let columns: ColumnSelector.Interface[] = [];
    for (const descendant of descendants) {
      if (!descendant) {
        throw new ReferenceError('TODO: This descendant is null. Handle it?');
      }
      let xpath = <string> XPath.fromNode(descendant);
      let suffix = XPath.suffixFromAncestor(ancestor, descendant);
      columns.push({
        xpath: xpath,
        suffix: suffix,
        id: null}
      );
    }
    return columns;
  }
}