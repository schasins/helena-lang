/// <reference types="chrome" />
import { Indexable } from "../common/utils";
import { Delta, NodeSnapshot } from "./snapshot";
import { RingerMessage, RecordState } from "../common/messages";
import { RingerEvent, RecordedRingerEvent, DOMRingerEvent } from "../common/event";
import { Logs } from "../common/logs";
import { IRingerParams } from "../common/params";
/**
 * Handlers for other tools using record & replay to put data in event messages.
 * The only default handler is `___additionalData___`, for copying data from
 *   record event objects to replay event objects.
 */
interface RecordingHandlers {
    [key: string]: Function;
    ___additionalData___: Function;
}
/**
 * Toggle the handlers in {@link RecordingHandlers} on/off.
 */
interface RecordingHandlersToggle {
    [key: string]: boolean;
    ___additionalData___: boolean;
}
/**
 * Handlers for other tools using record and replay to process event even before
 *   most processing done.
 */
interface RecordingFilters {
    [key: string]: Function;
}
/**
 * Toggle the filters in {@link RecordingFilters} on/off.
 */
interface RecordingFiltersToggle {
    [key: string]: boolean;
}
interface RingerSnapshot {
    before?: NodeSnapshot;
    after?: NodeSnapshot;
    target: HTMLElement;
}
export interface TimeoutInfo {
    startTime: number;
    startIndex: number;
    events: RingerEvent[] | null;
}
export declare class RingerContent {
    recording: RecordState;
    frameId?: number;
    port: chrome.runtime.Port;
    /**
     * Record variables
     */
    pageEventId: number;
    lastRecordEvent: DOMRingerEvent | null;
    lastRecordSnapshot?: RingerSnapshot;
    curRecordSnapshot?: RingerSnapshot;
    additional_recording_handlers: RecordingHandlers;
    additional_recording_handlers_on: RecordingHandlersToggle;
    additional_recording_filters: RecordingFilters;
    additional_recording_filters_on: RecordingFiltersToggle;
    /**
     * Replay variables
     */
    lastReplayEvent: RingerEvent;
    lastReplayTarget: HTMLElement;
    lastReplaySnapshot: RingerSnapshot;
    curReplaySnapshot: RingerSnapshot;
    dispatchingEvent: boolean;
    retryTimeout: number | null;
    simulatedEvents: RingerEvent[] | null;
    simulatedEventsIdx: number;
    timeoutInfo: TimeoutInfo;
    /**
     * Addon hooks
     */
    addonStartup: (() => void)[];
    addonStartRecording: (() => void)[];
    addonPreRecord: ((ev: Event) => boolean)[];
    addonPostRecord: ((ev: Event, msg: RingerEvent) => boolean)[];
    addonPreReplay: ((target: Node, ev: Event, msg: RingerEvent, events: RingerEvent[]) => boolean)[];
    addonPreTarget: ((ev: RingerEvent) => boolean)[];
    addonTarget: ((ev: RingerEvent) => Node)[];
    /**
     * Loggers
     */
    log: Logs.Logger | Logs.NoopLogger;
    recordLog: Logs.Logger | Logs.NoopLogger;
    replayLog: Logs.Logger | Logs.NoopLogger;
    /**
     * Prompt
     */
    promptCallback: ((text: string) => void) | null;
    constructor();
    /**
     * Attach the event handlers to their respective events.
     */
    addListenersForRecording(): void;
    /**
     * Check if the current event has timed out.
     *
     * @param events The current list of events to replay.
     * @param startIndex The index into {@link events} which is needs to be
     *     replayed.
     * @returns {boolean} True if timeout has occured
     */
    checkTimeout(events: RingerEvent[], startIndex: number): boolean;
    /**
     * Stop the next execution of {@link simulate}.
     */
    clearRetry(): void;
    /**
     * Update the last target, so that the record and replay deltas match.
     * @param recordDeltas deltas from recording
     * @param replayDeltas deltas from replay
     * @param lastTarget last target
     */
    fixDeltas(recordDeltas: Delta[], replayDeltas: Delta[], lastTarget: HTMLElement & Indexable): void;
    /**
     * Returns the default event properties for an event.
     * @param type The DOM event type
     */
    getEventProps(type: string): any;
    /**
     * Get the class of an event, which is used to init and dispatch it
     *
     * @param type The DOM event type
     * @returns The class type, such as MouseEvent, etc.
     */
    getEventType(type: string): string;
    /**
     * Find matching event in simulatedEvents. Needed to ensure that an event is
     *   not replayed twice, i.e. once by the browser and once by the tool.
     */
    getMatchingEvent(eventData: Event): RingerEvent | null;
    /**
     * Handle messages coming from the background page.
     */
    handleMessage(request: RingerMessage): void;
    /**
     * Increment matched event counter.
     */
    incrementMatchedEventIndex(): void;
    /**
     * Does this send a prompt to the user?
     * @param text
     * @param callback
     */
    promptUser(text: string, callback: (text: string) => void): void;
    /**
     * Does this provide a response to a user prompt?
     * @param text
     */
    promptResponse(text: string): void;
    /**
     * Create an event record given the data from the event handler.
     */
    recordEvent(eventData: Event & Indexable): boolean | undefined;
    /**
     * Fix deltas that did not occur during replay.
     */
    replayUpdateDeltas(eventData: Event, eventMessage: DOMRingerEvent): void;
    /**
     * Reset all of the record-time variables.
     */
    resetRecord(): void;
    /**
     * Update the snapshot.
     */
    resnapshotBefore(target: HTMLElement): void;
    /**
     * Send an alert that will be displayed in the main panel.
     */
    sendAlert(msg: string): void;
    /**
     * Set properties on events, even if they are read-only.
     * @param e the event
     * @param prop the property
     * @param value the value
     */
    setEventProp(e: Event & Indexable, prop: string, value: any): void;
    /**
     * Try simulating again in a bit of time.
     * @param events events to simulate
     * @param startIndex
     * @param timeout time until retry
     */
    setRetry(events: RecordedRingerEvent[], startIndex: number, timeout: number): void;
    /**
     * Replays a set of events atomically.
     * @param events The current list of events to replay.
     * @param startIndex The index into {@link events} which needs to be
     *     replayed.
     */
    simulate(events: RecordedRingerEvent[], startIndex: number): void;
    /**
     * Create a snapshot of the target element.
     */
    snapshotRecord(target: HTMLElement): void;
    /**
     * Take a snapshot of the target.
     * @param target
     */
    snapshotReplay(target: HTMLElement): void;
    /**
     * Update the deltas for the previous event.
     * @param target the event target
     */
    updateDeltas(target?: HTMLElement): void;
    /**
     * Sends a message indicating an update to an existing event.
     * @param eventMessage event to update
     * @param field field of event to update
     * @param value value of event to update
     */
    updateExistingEvent(eventMessage: DOMRingerEvent, field: string, value: string): void;
    /**
     * Update the parameters for this script's scope.
     * @param newParams
     */
    updateParams(newParams: IRingerParams): void;
}
export {};
