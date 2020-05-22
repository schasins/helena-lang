import { MainpanelNode } from "../../common/mainpanel_node";
import { PageVariable } from "./page_variable";
import { Revival } from "../revival";
import { Environment } from "../environment";
import { Trace } from "../../common/utils/trace";
export declare enum NodeSources {
    RELATIONEXTRACTOR = 1,
    RINGER = 2,
    PARAMETER = 3,
    TEXTRELATION = 4
}
export declare class NodeVariable implements Revival.Revivable {
    static counter: number;
    ___revivalLabel___: string;
    name: string | null;
    nodeSource?: number;
    private ___privateName___;
    recordedNodeSnapshot?: MainpanelNode.Interface | null;
    nodeRep: MainpanelNode.Interface;
    imgData?: string | null;
    requiredFeatures: string[];
    constructor(name?: string | null, mainpanelRep?: MainpanelNode.Interface | null, recordedNodeSnapshot?: MainpanelNode.Interface | null, imgData?: string | null, source?: number);
    static createDummy(): NodeVariable;
    /**
     * Create a node variable from a trace.
     * @param trace
     */
    static fromTrace(trace: Trace): NodeVariable;
    getName(): string;
    setName(name: string): void;
    sameNode(otherNodeVariable: NodeVariable): boolean;
    toString(alreadyBound?: boolean, pageVar?: PageVariable): string;
    recordTimeText(): string | undefined;
    recordTimeLink(): string | undefined;
    recordTimeXPath(): string | undefined;
    recordTimeSnapshot(): MainpanelNode.Interface | null | undefined;
    setCurrentNodeRep(environment: Environment.Frame, nodeRep: MainpanelNode.Interface | null): void;
    currentNodeRep(environment: Environment.Frame): MainpanelNode.Interface;
    currentText(environment: Environment.Frame): string;
    currentLink(environment: Environment.Frame): string | undefined;
    currentXPath(environment: Environment.Frame): string | undefined;
    setSource(src: number): void;
    getSource(): number | undefined;
    getRequiredFeatures(): string[];
    setRequiredFeatures(featureSet: string[]): void;
    requireFeature(feature: string): void;
    unrequireFeature(feature: string): void;
}
