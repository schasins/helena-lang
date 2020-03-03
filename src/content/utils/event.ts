export interface EventMessage {
    data: {
        type: string;
        shiftKey: boolean;
        metaKey: boolean;
    }
}