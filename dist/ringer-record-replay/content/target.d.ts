import { NodeSnapshot } from "./snapshot";
interface ElementFeatures {
    [key: string]: any;
    xpath: string;
}
export interface TargetInfo {
    [key: string]: any;
    branch?: NodeSnapshot[];
    requiredFeatures?: string[];
    snapshot: ElementFeatures;
    useXpathOnly?: boolean;
    xpath: string;
}
export declare enum TargetStatus {
    REQUIRED_FEATURE_FAILED = 1,
    REQUIRED_FEATURE_FAILED_CERTAIN = 2,
    TIMED_OUT_CERTAIN = 3
}
export declare namespace Target {
    function getTarget(targetInfo: TargetInfo): Node | TargetStatus | null;
    /**
     * Mark a target as missing necessary features.
     * @param targetInfo
     */
    function markAsMissingFeatures(targetInfo: TargetInfo): void;
    /**
     * Mark a target timed out, when it doesn't appear to exist on current page.
     * @param targetInfo target info
     */
    function markTimedOut(targetInfo: TargetInfo): void;
    /**
     * Store information about the DOM node.
     * @param target DOM node
     * @param recording recording status
     */
    function saveTargetInfo(target: Element, recording: string): TargetInfo;
    /**
     * Select the best candidate element matching the features.
     * @param features
     * @param candidates
     */
    function selectBestCandidate(features: ElementFeatures, candidates: Node[]): Node | null;
}
export {};
