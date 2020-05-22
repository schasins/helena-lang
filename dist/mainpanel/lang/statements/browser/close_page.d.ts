import { HelenaLangObject } from "../../helena_lang";
import { PageVariable } from "../../../variables/page_variable";
import { RunObject, RunOptions } from "../../program";
export declare class ClosePageStatement extends HelenaLangObject {
    pageVarCurr: PageVariable;
    constructor(pageVarCurr: PageVariable);
    static createDummy(): ClosePageStatement;
    toStringLines(): never[];
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
}
