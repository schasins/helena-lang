import { RelationMessage } from "../../common/messages";
import { RelationSelector } from "./relation_selector";
import { MainpanelNode } from "../../common/mainpanel_node";
import { LikelyRelationMessage } from "../../common/messages";
export interface ScrapedElement extends HTMLElement {
    ___relationFinderId___?: number;
}
export declare namespace RelationFinder {
    /**
     * Retrieve the {@link RelationSelector} of the most likely relation given
     *   the information in the message.
     * @param msg message about likely relation
     */
    function likelyRelation(msg: LikelyRelationMessage): RelationSelector | null | undefined;
    /**
     * Send relation matching selector to mainpanel.
     * @param selector selector
     */
    function sendMatchingRelationToMainpanel(selector: RelationSelector): MainpanelNode.Interface[][];
    function editRelation(selector: RelationSelector): void;
    function setEditRelationIndex(index: number): void;
    /**
     * Send edited selector to the mainpanel.
     * @param selector selector
     */
    function sendEditedSelectorToMainpanel(selector: RelationSelector): void;
    function newSelectorGuess(selector: RelationSelector): void;
    function clearRelationInfo(msg: RelationMessage): void;
    /**
     * Run the interaction needed to retrieve the next page of results (using the
     *   next/more/pagination buttons). If there are no more items to retrieved,
     *   the information is stored for the next time {@link getFreshRelationItems}
     *   is called.
     * @param msg relation selector
     */
    function getNextPage(msg: RelationMessage): void;
    function getFreshRelationItems(selector: RelationSelector): void;
    function getFreshRelationItemsHelper(selector: RelationSelector, continuation: Function, doData?: boolean): void;
}
