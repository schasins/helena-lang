import { Dataset } from "../dataset";
import { DatasetSliceRequest, RelationMessage, Messages } from "../../common/messages";
import { ServerTransaction } from "../lang/statements/control_flow/skip_block";
export interface KnownRelationRequest {
    url: string;
}
export interface KnownRelationResponse {
    relations: ServerRelationMessage[];
}
interface RetrieveRelationsRequest {
    pages: {
        frame_ids: number[];
        page_var_name: string;
        url: string;
        xpaths: string[];
    }[];
}
export interface ServerRelationMessage {
    selector_version: number;
    selector: string;
    name: string;
    exclude_first: number;
    id: number;
    columns: {
        xpath: string;
        suffix: string;
        name: string;
        id: number;
    }[];
    num_rows_in_demonstration: number;
    next_type: number;
    next_button_selector?: string;
}
export interface RetrieveRelationsResponse {
    pages: {
        page_var_name: string;
        relations: {
            same_domain_best_relation: ServerRelationMessage | null;
            same_url_best_relation: ServerRelationMessage | null;
        };
    }[];
}
export interface RunNewProgramResponse {
    run_id?: number;
    sub_run_id: number;
}
interface SaveProgramRequest {
    associated_string?: string;
    id: string;
    name: string;
    relation_objects?: (string | RelationMessage)[];
    tool_id?: null;
}
interface SaveRelationRequest {
    relation: RelationMessage;
}
export declare namespace HelenaServer {
    function checkSkipBlockTransaction(url: string, tx: ServerTransaction, handler: Function): void;
    function getKnownRelations(req: KnownRelationRequest & Messages.MessageContentWithTab, handler: any): void;
    function loadSavedPrograms(handler: Function): void;
    function loadSavedDataset(datasetId: number, handler: Function): void;
    function loadSavedProgram(progId: string, handler: Function): void;
    function newSkipBlockTransaction(req: ServerTransaction & DatasetSliceRequest, handler: Function): void;
    function retrieveRelations(req: RetrieveRelationsRequest, handler: Function): void;
    function runNewProgram(dataset: Dataset, handler: Function): void;
    function saveRelation(req: SaveRelationRequest, handler: Function): void;
    function saveProgram(req: SaveProgramRequest, handler: Function, showWaitingStatus?: boolean, extraText?: string): void;
    function sendDatasetSlice(slice: DatasetSliceRequest, handler: Function): void;
    function subRunNewProgram(programRunId: number | undefined, handler: Function): void;
    function updateDatasetRunName(dataset: Dataset): void;
}
export {};
