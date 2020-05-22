import { Indexable } from "../common/utils";
/**
 * Records effects of events (i.e. changes to a node).
 */
export interface Delta {
    changed?: NodeSnapshot;
    divergingProp?: string;
    orig?: NodeSnapshot;
    type: string;
}
export interface PropertyDifferentDelta extends Delta {
    changed: ElementSnapshot;
    orig: ElementSnapshot;
    divergingProp: string;
}
export interface NodeAddedDelta extends Delta {
    changed: NodeSnapshot;
    divergingProp: undefined;
    orig: undefined;
}
export interface NodeMissingDelta extends Delta {
    changed: undefined;
    divergingProp: undefined;
    orig: NodeSnapshot;
}
export interface MiscDelta extends Delta {
    changed: NodeSnapshot;
    divergingProp: undefined;
    orig: NodeSnapshot;
}
/**
 * An instance of a DOM node snapshot.
 */
export interface NodeSnapshot {
    children?: NodeSnapshot[];
    prop?: Indexable;
    text?: string;
    type: string;
}
export interface ElementSnapshot extends NodeSnapshot {
    children: NodeSnapshot[];
    prop: Indexable;
}
export interface TextNodeSnapshot extends NodeSnapshot {
    text: string;
}
/**
 * Dealing with DOM node snapshots by saving their properties and children.
 * These can be very expensive operations, so use sparingly.
 */
export declare namespace Snapshot {
    /**
     * Return the list of deltas, taking out any deltas that appear in
     *   {@link deltasToRemove}.
     *
     * @param delta
     * @param deltasToRemove
     *
     * @returns Deltas contained in {@link delta} but not {@link deltasToRemove}
     */
    function filterDeltas(deltas: Delta[], deltasToRemove: Delta[]): Delta[];
    /**
     * Calculates differences between two node snapshots.
     *
     * @param orig A snapshot of the original node
     * @param changed A snapshot of the node after possible changes
     *
     * @returns a list of deltas, each delta indicating a property change
     */
    function getDeltas(orig: NodeSnapshot | undefined, changed: NodeSnapshot | undefined): Delta[];
    function snapshot(): NodeSnapshot;
    /**
     * Create an array of snapshots from the node until the its highest parent
     *   is reached.
     *
     * @param node
     * @returns List of node snapshots, starting the highest ancestor.
     */
    function snapshotBranch(node: Element | null): NodeSnapshot[];
    function snapshotNode(node: Element | null): NodeSnapshot | undefined;
}
