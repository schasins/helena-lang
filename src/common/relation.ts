export enum RelationItemsOutputs {
    NOMOREITEMS = 1,
    NONEWITEMSYET,
    NEWITEMS
};

export interface RelationRow {

}

export interface RelationOutput {
    type: RelationItemsOutputs;
    relation: RelationRow[] | null;
}
