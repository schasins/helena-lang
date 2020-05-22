import { PageVariable } from "../../mainpanel/variables/page_variable";
import { StatementTypes } from "../../mainpanel/lang/statements/statement_types";
import { RecordedRingerEvent } from "../../ringer-record-replay/common/event";
export declare type Trace = RecordedRingerEvent[];
interface EventDisplayInfo {
    causedBy?: RecordedRingerEvent;
    causesLoads?: RecordedRingerEvent[];
    inputPageVar?: PageVariable;
    manual?: boolean;
    pageVar?: PageVariable;
    pageVarId?: PageVariable;
    visible?: boolean;
}
export interface DisplayTraceEvent extends RecordedRingerEvent {
    additionalDataTmp: {
        display: EventDisplayInfo;
    };
}
/**
 * Handling a trace (i.e. a list of Ringer events).
 */
export declare namespace Traces {
    function lastTopLevelCompletedEvent(trace: Trace): RecordedRingerEvent;
    function tabId(ev: RecordedRingerEvent | undefined): any;
    function frameId(ev: RecordedRingerEvent): any;
    function lastTopLevelCompletedEventTabId(trace: Trace): any;
    function tabsInTrace(trace: Trace): number[];
    /**
     * Add display information placeholder to event.
     * @param ev
     */
    function prepareForDisplay(ev: RecordedRingerEvent): DisplayTraceEvent;
    function getLoadURL(ev: RecordedRingerEvent): string;
    function getDOMURL(ev: RecordedRingerEvent): string;
    function getTabId(ev: RecordedRingerEvent): any;
    function getDOMPort(ev: RecordedRingerEvent): string;
    function getVisible(ev: RecordedRingerEvent): boolean | undefined;
    function setVisible(ev: DisplayTraceEvent, val: boolean): void;
    function getManual(ev: DisplayTraceEvent): boolean | undefined;
    function setManual(ev: DisplayTraceEvent, val: boolean): void;
    function getLoadOutputPageVar(ev: DisplayTraceEvent): PageVariable | undefined;
    function setLoadOutputPageVar(ev: DisplayTraceEvent, val: PageVariable): void;
    function getDOMInputPageVar(ev: DisplayTraceEvent): PageVariable;
    function setDOMInputPageVar(ev: DisplayTraceEvent, val: PageVariable): void;
    function getDOMOutputLoadEvents(ev: DisplayTraceEvent): RecordedRingerEvent[] | undefined;
    function setDOMOutputLoadEvents(ev: DisplayTraceEvent, val: RecordedRingerEvent[]): void;
    function addDOMOutputLoadEvent(ev: DisplayTraceEvent, val: RecordedRingerEvent): void;
    function getLoadCausedBy(ev: DisplayTraceEvent): RecordedRingerEvent | undefined;
    function setLoadCausedBy(ev: DisplayTraceEvent, val: RecordedRingerEvent): void;
    function getDisplayInfo(ev: DisplayTraceEvent): EventDisplayInfo;
    function cleanTrace(trace: Trace): DisplayTraceEvent[];
    function clearDisplayInfo(ev: DisplayTraceEvent): void;
    function setDisplayInfo(ev: DisplayTraceEvent, displayInfo: EventDisplayInfo): void;
    function setTemporaryStatementIdentifier(ev: RecordedRingerEvent, id: number): void;
    function firstScrapedContentEventInTrace(trace: Trace): RecordedRingerEvent | null;
    function getTemporaryStatementIdentifier(ev: RecordedRingerEvent): any;
    function statementType(ev: RecordedRingerEvent): StatementTypes.MOUSE | StatementTypes.KEYBOARD | StatementTypes.LOAD | StatementTypes.SCRAPE | StatementTypes.SCRAPELINK | StatementTypes.PULLDOWNINTERACTION | null;
    function firstVisibleEvent(trace: Trace): DisplayTraceEvent;
}
export {};
