import * as Blockly from "blockly";
import { NodeVariable } from "./variables/node_variable";
import { HelenaLangObject } from "./lang/helena_lang";
import { NodeVariableUse } from "./lang/values/node_variable_use";
import { RecorderUI } from "./ui/recorder_ui";
import { HelenaProgram, RunObject } from "./lang/program";
import { Revival } from "./revival";
export declare class HelenaMainpanel {
    static revivable: {
        [key: string]: Revival.Prototype;
    };
    allNodeVariablesSeenSoFar: NodeVariable[];
    blocklyLabels: {
        [key: string]: string[];
    };
    currentReplayWindowId: number | null;
    currentRunObjects: RunObject[];
    blocklyNames: string[];
    blocklyToHelenaDict: {
        [key: string]: HelenaLangObject;
    };
    demoMode: boolean;
    recordingWindowIds: number[];
    toolId: null;
    UIObject: RecorderUI;
    constructor(obj: RecorderUI);
    private addMessageListeners;
    /**
     * Initialization that has to happen after the HelenaMainpanel object is
     *   created.
     */
    afterInit(): void;
    resetForNewScript(): void;
    static makeOpsDropdown(ops: {
        [key: string]: Function;
    }): string[][];
    addToolboxLabel(label: string, category?: string): void;
    blocklySeqToHelenaSeq(blocklyBlock: Blockly.Block): HelenaLangObject[];
    static getHelenaFromBlocklyRoot(blocklyBlock: Blockly.Block): HelenaLangObject[];
    getInputSeq(blocklyBlock: Blockly.Block, inputName: string): NodeVariableUse[];
    setHelenaStatement(block: Blockly.Block, helenaStmt: HelenaLangObject): void;
    getHelenaStatement(block: Blockly.Block): HelenaLangObject;
    getNodeVariableByName(name: string): NodeVariable | null;
    private setupBlocklyCustomBlocks;
    /**
     * Updates blocks available for the toolbox based on our pageVars, relations,
     *   and so on.
     * @param program
     */
    updateToolboxBlocks(program: HelenaProgram | null): void;
}
