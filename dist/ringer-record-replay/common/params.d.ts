import { LogLevel } from "./logs";
/**
 * Compensation actions scheme, should be used when element properties differ
 *   between record and replay executions.
 */
export declare enum CompensationAction {
    NONE = "none",
    FORCED = "forced"
}
/**
 * Strategy to apply when an exception is thrown because of a disconnected
 *   port.
 */
export declare enum BrokenPortStrategy {
    RETRY = "retry",
    SKIP = "skip"
}
/**
 * Strategy for how much time should be spent between events
 */
export declare enum TimingStrategy {
    MIMIC = "mimic",
    SPEED = "speed",
    SLOWER = "slower",
    SLOWEST = "slowest",
    FIXED_1 = "fixed_1",
    RANDOM_0_3 = "random_0_3",
    PERTURB_0_3 = "perturb_0_3",
    PERTURB = "purterb"
}
/**
 * Strategy for action to take after a timeout
 */
export declare enum TimeoutStrategy {
    ERROR = "error",
    SKIP = "skip"
}
export interface IRingerParams {
    capture: {
        saveCaptureLocal: boolean;
    };
    compensation: {
        enabled: boolean;
        omittedProps: string[];
    };
    ctrlOnlyEvents: string[];
    defaultProps: {
        [key: string]: any;
    };
    events: {
        [key: string]: {
            [key: string]: boolean;
        };
    };
    logging: {
        level: LogLevel;
        enabled: string;
        print: boolean;
        saved: boolean;
    };
    record: {
        allEventProps?: boolean;
        cancelUnrecordedEvents: boolean;
        listenToAllEvents: boolean;
        recordAllEventProps: boolean;
    };
    replay: {
        atomic: boolean;
        cascadeCheck: boolean;
        brokenPortStrategy: BrokenPortStrategy;
        cancelUnknownEvents: boolean;
        captureWait: number;
        compensation: CompensationAction;
        defaultUser: boolean;
        defaultWait: number;
        defaultWaitNewTab: number;
        defaultWaitNextEvent: number;
        eventTimeout: null;
        highlightTarget: boolean;
        openNewTab: boolean;
        saveReplay: boolean;
        skipCascadingEvents: boolean;
        targetTimeout: number;
        timingStrategy: TimingStrategy;
        urlSimilarity: number;
    };
}
export declare namespace RingerParams {
    let params: IRingerParams;
}
