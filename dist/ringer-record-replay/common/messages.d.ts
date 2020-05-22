export interface RingerMessage {
    state?: string;
    type: string;
    value: any;
}
export interface PortInfo {
    portId?: string;
    top: boolean;
    URL: string;
}
export interface UpdateEventMessage {
    pageEventId: number;
    updates: {
        field: string;
        value: any;
    }[];
}
export interface GetIdMessage extends RingerMessage {
    type: "id";
    value: string;
}
export declare enum ReplayAckStatus {
    SUCCESS = "success",
    PARTIAL = "partial"
}
export declare enum RecordState {
    STOPPED = "stopped",
    RECORDING = "recording",
    REPLAYING = "replaying"
}
