/// <reference types="chrome" />
import { PortManager } from "./port_manager";
import { Record } from "./record";
import { Replay, ErrorContinuations, ReplayConfig } from "./replay";
import { User } from "./user";
import { RingerMessage } from "../common/messages";
import { RingerEvent, RecordedRingerEvent } from "../common/event";
export declare class RingerMainpanel {
    private log;
    ports: PortManager;
    record: Record;
    replay: Replay;
    scriptServer: null;
    user: User;
    constructor();
    /**
     * Listen to web requests. TODO: describe this.
     * @param e
     */
    addBackgroundEvent(e: RingerEvent): void;
    /**
     * TODO: describe this.
     */
    addWebRequestEvent(details: chrome.webNavigation.WebNavigationCallbackDetails, type: string): void;
    /**
     * Handle the getId message that the content script sends.
     * @param msg
     * @param sender
     * @param sendResponse
     */
    private handleIdMessage;
    /**
     * Handle messages coming from the content scripts.
     * @param port
     * @param request
     */
    handleMessage(port: chrome.runtime.Port, request: RingerMessage): void;
    /**
     * TODO
     * @param config
     * @param cont
     * @param errorConts
     */
    replayRecording(config: ReplayConfig | null, cont: (replay: Replay) => void, errorConts?: ErrorContinuations): Replay;
    /**
     * TODO
     */
    replayScript(events: RecordedRingerEvent[], config: ReplayConfig | null, cont: (replay: Replay) => void, errorConts?: ErrorContinuations): Replay;
    /**
     * Reset recording status.
     */
    reset(): void;
    /**
     * Sets the recorded events.
     * @param scriptId
     * @param events
     */
    setEvents(scriptId: number | undefined, events: RecordedRingerEvent[]): void;
    /**
     * Start recording.
     */
    start(): void;
    /**
     * Stop recording.
     */
    stop(): void;
    /**
     * Stop replay.
     */
    stopReplay(): void;
}
