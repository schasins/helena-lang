import { INextButtonSelector } from "./interfaces";
/**
 * Methods for selecting a next/pagination button on a page.
 */
export declare namespace NextButtonSelector {
    let listeningForNextButtonClick: boolean;
    /**
     * Activate state of listening for a click on the next button.
     */
    function listenForNextButtonClick(): void;
    /**
     * Records the event target as the next button by sending information about it
     *   to the mainpanel.
     * @param event the click event
     */
    function record(event: MouseEvent): void;
    /**
     * Finds the next button for the current page given a next button selector.
     * @param selector next button selector
     * @param priorPageIndexText if page button, a string indicating the number of
     *   the last page index
     */
    function findNextButton(selector: INextButtonSelector, priorPageIndexText?: string): HTMLElement | null;
    /**
     * Highlights the next button given by the selector.
     * @param selector the next button selector
     */
    function highlightNextButton(selector: INextButtonSelector): void;
    /**
     * Clears highlighted next button, if any.
     */
    function unhighlightNextButton(): void;
}
