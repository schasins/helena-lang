import { HelenaProgram } from "../lang/program";
export declare class HelenaUIBase {
    private workspace?;
    private toolboxId?;
    private blocklyAreaId?;
    private blocklyDivId?;
    private containerId?;
    private helenaProg;
    private maxWaitsForDivAppearance;
    private currWaitsForDivAppearance;
    constructor();
    setBlocklyDivIds(containerIdA: string, toolboxIdA: string, blocklyAreaIdA: string, blocklyDivIdA: string): void;
    setBlocklyProgram(helenaProgObj: HelenaProgram | null): void;
    private retrieveBlocklyComponent;
    updateBlocklyToolbox(): void;
    private handleNewWorkspace;
    blocklyReadjustFunc(): void;
    setUpBlocklyEditor(updateToolbox?: boolean): void;
    displayBlockly(program: HelenaProgram): void;
    blocklyToHelena(program: HelenaProgram | null): void;
}
