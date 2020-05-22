import { ColumnSelectorMessage } from "../../common/messages";
import { IColumnSelector } from "./interfaces";
/**
  * A selector describing how to extract a column of a relation with respect to
  *   some kind of common ancestor describing a row.
  */
export declare namespace ColumnSelector {
    function fromMessage(msgCols: (ColumnSelectorMessage | IColumnSelector)[]): IColumnSelector[];
    /**
     * Gets array of {@link IColumnSelector} of each descendant element
     *   given the ancestor element.
     * @param ancestor ancestor element
     * @param descendants descendant elements
     */
    function compute(ancestor: HTMLElement, descendants: (HTMLElement | null)[]): IColumnSelector[];
}
