import { XPath } from "../utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;
/**
 * Types of next or more buttons.
 */
export declare enum NextButtonTypes {
    NONE = 1,
    NEXTBUTTON = 2,
    MOREBUTTON = 3,
    SCROLLFORMORE = 4
}
export interface INextButtonSelector {
    id: string;
    class: string;
    src: string | null;
    frame_id?: number;
    tag: string;
    text: string | null;
    xpath: string;
}
export interface IColumnSelector {
    xpath?: string;
    suffix?: SuffixXPathList[];
    name?: string;
    id?: number | null;
    index?: string;
    scraped?: boolean;
    firstRowXpath?: string;
    firstRowText?: string;
    firstRowValue?: string;
}
