import { HelenaLangObject } from "../../helena_lang";
import { PageVariable } from "../../../variables/page_variable";
import { RunObject, RunOptions } from "../../program";
export declare class BackStatement extends HelenaLangObject {
    pageVarBack: PageVariable;
    pageVarCurr: PageVariable;
    constructor(pageVarCurr: PageVariable, pageVarBack: PageVariable);
    static createDummy(): BackStatement;
    toStringLines(): never[];
    traverse(fn: Function, fn2: Function): void;
    run(runObject: RunObject, rbbcontinuation: Function, rbboptions: RunOptions): void;
}
