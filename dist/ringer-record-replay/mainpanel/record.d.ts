import { PortManager } from "./port_manager";
import { RingerMessage, UpdateEventMessage, RecordState } from "../common/messages";
import { RingerEvent, RecordedRingerEvent } from "../common/event";
import { Logs } from "../common/logs";
/**
 * Handles recording of events from the content scripts.
 */
export declare class Record {
    events: RecordedRingerEvent[];
    lastTime: number;
    listeners: ((msg: RingerMessage) => void)[];
    log: Logs.Logger | Logs.NoopLogger;
    ports: PortManager;
    recordState: RecordState;
    scriptId?: number;
    constructor(ports: PortManager);
    /**
     * Add the event to be recorded.
     *
     * @param e Details of about the saved event
     * @param portId Optional name of the port for the event
     * @param index Index where put the event. Defaults to the end of the event
     *   array if undefined
     *
     * @returns id assigned to the event
     */
    addEvent(e: RingerEvent, portId?: string, index?: number): string;
    /**
     * Add a listener.
     * @param listener
     */
    addListener(listener: (msg: RingerMessage) => void): void;
    /**
     * Get event, given an event id.
     * @param eventId
     */
    getEvent(eventId: string): RecordedRingerEvent | null;
    /**
     * Create a copy of the events recorded.
     */
    getEvents(): RecordedRingerEvent[];
    /**
     * Get the script id.
     */
    getScriptId(): number | undefined;
    /**
     * Get current record state.
     */
    getStatus(): RecordState;
    /**
     * Reset recording state.
     */
    reset(): void;
    /**
     * Set the recorded events.
     */
    setEvents(events: RecordedRingerEvent[]): void;
    /**
     * Set the script id.
     * @param id
     */
    setScriptId(id?: number): void;
    /**
     * Begin recording events.
     *
     * @param replaying Whether we are recording a user's interactions or the
     *   events raised by the replayer.
     */
    startRecording(replaying: boolean): void;
    /**
     * Stop recording.
     */
    stopRecording(): void;
    /**
     * Update the properties of an event. {@link request} should contain the
     * pageEventId so that the event can be matched.
     *
     * @param request Updates to be made and meta data used to identify event
     * @param portId id of port which requests came through
     */
    updateEvent(request: UpdateEventMessage, portId: string): void;
    /**
     * Update all listeners with message.
     * @param msg
     */
    updateListeners(msg: RingerMessage): void;
    /**
     * Update recording state.
     * @param newStatus
     */
    updateStatus(newStatus: RecordState): void;
    /**
     * Finds the event based upon the eventId and updates the event's
     *   {@link field} to {@link newVal}.
     * @param eventId
     * @param field
     * @param newVal
     */
    userUpdate(eventId: string, field: string, newVal: any): void;
}
