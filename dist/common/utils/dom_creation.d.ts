/// <reference types="jquery" />
/// <reference types="jqueryui" />
export declare namespace DOMCreation {
    function replaceContent(div1: JQuery<HTMLElement>, div2: JQuery<HTMLElement>): void;
    function arrayOfTextsToTableRow(array: string[]): JQuery<HTMLElement>;
    function arrayOfArraysToTable(arrayOfArrays: string[][]): JQuery<HTMLElement>;
    function toggleDisplay(node: JQuery<HTMLElement>): void;
}
