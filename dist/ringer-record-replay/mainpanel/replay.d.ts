/// <reference types="chrome" />
import { PortManager } from "./port_manager";
import { User } from "./user";
import { Record } from "./record";
import { RingerMessage, ReplayAckStatus } from "../common/messages";
import { RecordedRingerEvent } from "../common/event";
declare enum ReplayState {
    STOPPED = "stopped",
    REPLAYING = "replaying",
    ACK = "ack"
}
interface ReplayTimeoutInfo {
    startTime: number;
    index: number;
}
export interface ReplayConfig {
    frameMapping?: {
        [key: string]: string;
    };
    scriptId?: number;
    tabMapping?: {
        [key: string]: number;
    };
    targetWindowId?: number;
}
export declare type ErrorContinuations = {
    [key: string]: (replay: Replay, ringerCont: Function | null) => void;
};
export interface ScriptServer {
    saveScript: (id: string, replayEvents: RecordedRingerEvent[], scriptId: number, whatsthis: string) => void;
}
interface ReplayAck {
    setTimeout?: boolean;
    type: ReplayAckStatus;
}
/**
 * Handles replaying scripts.
 */
export declare class Replay {
    static replayableEvents: string[];
    ack: ReplayAck | null;
    ackPort: string;
    addonReset: ((replay: Replay) => void)[];
    addonTiming: ((replay: Replay) => number)[];
    callbackHandle: number | null;
    cont: ((replay: Replay) => void) | null;
    private currentCompletedObservationFailures;
    private currentPortMappingFailures;
    errorConts: ErrorContinuations;
    events: RecordedRingerEvent[];
    firstEventReplayed: boolean;
    index: number;
    listeners: ((msg: RingerMessage) => void)[];
    private log;
    matchedCompletedEvents: number[];
    portMapping: {
        [key: string]: chrome.runtime.Port;
    };
    ports: PortManager;
    record: Record;
    replayState: ReplayState;
    scriptId: number | null;
    scriptServer: ScriptServer | null;
    startTime: number;
    tabMapping: {
        [key: string]: number;
    };
    targetWindowId?: number;
    time?: number;
    timeoutInfo: ReplayTimeoutInfo;
    user: User;
    constructor(ports: PortManager, scriptServer: null, user: User);
    /**
     * Add a listener.
     * @param listener
     */
    addListener(listener: (msg: RingerMessage) => void): void;
    /**
     * Check if an event has already been replayed.
     * @param ev
     */
    private checkReplayed;
    /**
     * Check if executing an event has timed out.
     */
    private checkTimeout;
    /**
     * Dispatches events to the content script.
     */
    private dispatchToContentScript;
    /**
     * Looks for a node when required features failed.
     */
    findNodeWithoutRequiredFeatures(): void;
    /**
     * Given the frame information from the recorded trace, find a
     * corresponding port.
     * @param newTabId
     */
    private findPortInTab;
    /**
     * Replay has finished, and now we need to call the continuation.
     */
    private finish;
    /**
     * Get event, given an event id.
     * @param eventId
     */
    getEvent(eventId?: string): RecordedRingerEvent | null;
    /**
     * Given an event, find the corresponding port
     * @param
     */
    private getMatchingPort;
    /**
     * Return the index of the next event that should be replayed.
     */
    private getNextReplayableEventIndex;
    /**
     * Return the time in the future the next replayable event should be
     *   executed based upon the current timing strategy.
     */
    private getNextTime;
    /**
     * Get current replay state.
     */
    getStatus(): ReplayState;
    /**
     * Increase the index and update the listeners.
     */
    private incrementIndex;
    pause(): void;
    /**
     * Receive a replay acknowledgement from the content script.
     * @param ack
     */
    receiveAck(ack: ReplayAck): void;
    /**
     * TODO
     */
    private reloadLastTabIfFailed;
    /**
     * Begin replaying a list of events.
     *
     * @param events List of events
     * @param config
     * @param cont Callback thats executed after replay is finished
     * @param errorConts map from errors to callbacks that should be executed for
     *   those errors
     */
    replay(events: RecordedRingerEvent[], config: ReplayConfig, cont: (replay: Replay) => void, errorConts?: ErrorContinuations): void;
    /**
     * Resets Replay to initial state.
     */
    reset(): void;
    /**
     * Remove any information added to an event during replay.
     * @param ev
     */
    private resetEvent;
    /**
     * Set the callback to replay the next event
     *
     * @param time Optional delay when callback should be executed. The
     *     default will use whatever strategy is set in the parameters.
     */
    private setNextTimeout;
    /**
     * TODO
     */
    resend(): void;
    /**
     * Restart by setting the next callback immediately.
     */
    restart(): void;
    /**
     * Replays an event of type "completed".
     * @param ev
     */
    private simulateCompletedEvent;
    /**
     * Replays a DOM event.
     * @param ev
     */
    private simulateDomEvent;
    /**
     * Replay event where user manually loaded page.
     * @param e
     */
    private simulateManualLoadEvent;
    /**
     * Replays a Chrome web navigation event.
     * @param e
     */
    private simulateWebNavigationEvent;
    /**
     * TODO
     */
    skip(): void;
    /**
     * Stop the replay.
     */
    stopReplay(): void;
    /**
     * Update all listeners with message.
     * @param msg
     */
    updateListeners(msg: RingerMessage): void;
    /**
     * Update replay state.
     * @param newStatus
     */
    updateStatus(newStatus: ReplayState): void;
}
export {};
