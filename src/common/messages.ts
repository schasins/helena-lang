export interface MessageContent {

}

export interface TabIDMessageContent {
    tab_id: number;
    window_id: number;
    top_frame_url: string;
}

export interface WindowIdMessageContent {
    window: number;
}

export interface WindowsMessageContent {
    window_ids: number[];
}

export interface ColumnIndexMessageContent {
    index: number;
}