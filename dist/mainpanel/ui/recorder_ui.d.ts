/// <reference types="jquery" />
/// <reference types="jqueryui" />
import { HelenaUIBase } from "./helena_ui_base";
import { ScheduledScriptMessage } from "../../common/messages";
import { Relation } from "../relation/relation";
import { MainpanelNode } from "../../common/mainpanel_node";
import { HelenaProgram, RunObject } from "../lang/program";
import { Indexable } from "../../ringer-record-replay/common/utils";
import { Trace } from "../../common/utils/trace";
import { IColumnSelector } from "../../content/selector/interfaces";
/**
 * Guide the user through making a demonstration recording.
 */
export declare class RecorderUI extends HelenaUIBase {
    static ifttturl: string;
    tabs?: JQuery<HTMLElement>;
    ringerUseXpathFastMode: boolean;
    currentRingerTrace?: Trace;
    currentHelenaProgram?: HelenaProgram | null;
    private currentRecordingWindow?;
    private scriptRunCounter;
    private scraped;
    private keys;
    private currentSkipper?;
    private highlyHumanReadable;
    private currentUploadRelation?;
    constructor();
    init(): void;
    setScrapingInstructions(instructionsDivSelector: string): void;
    setUpRecordingUI(): void;
    showStartRecording(): void;
    startRecording(specifiedUrl?: string): void;
    sendCurrentRecordingWindows(): void;
    private setCurrentProgram;
    private setWindowSize;
    /**
     * Sets global configuration variables. Used for test scripts, not in live
     *   execution.
     * @param kvArgs
     */
    setGlobalConfig(kvArgs: Indexable): void;
    stopRecording(): void;
    cancelRecording(): void;
    showProgramPreview(inProgress?: boolean): void;
    private updateUIForRunFinished;
    run(fastMode?: boolean, params?: object): void;
    runWithFastMode(): void;
    runWithAndWithoutEntityScopes(): void;
    newRunTab(runObject: RunObject): string;
    showParamVals(): void;
    processNewParameterName(): void;
    save(postIdRetrievalContinuation: Function): void;
    downloadScript(): void;
    handleNewUploadedHelenaProgram(event: Event): void;
    private loadDownloadedScriptHelper;
    replayOriginal(): void;
    startNewScript(): void;
    pauseRun(runObject: RunObject): void;
    resumeRun(runObject: RunObject): void;
    restartRun(runObject: RunObject): void;
    scheduleLater(): void;
    resetForNewScript(): void;
    processScrapedData(data: MainpanelNode.Interface): void;
    runScheduledScript(data: ScheduledScriptMessage): void;
    prepareForPageRefresh(): void;
    private editSelector;
    private replaceRelation;
    handleFunctionForSkippingToNextPageOfRelationFinding(skipToNextPageFunc: Function): void;
    handleRelationFindingPageUpdate(pageCurrentlyBeingSearched: number): void;
    updateDisplayedRelations(currentlyUpdating?: boolean): void;
    showRelationEditor(relation: Relation, tabId: number): void;
    updateDisplayedRelation(relation: Relation, colors: string[]): void;
    setColumnColors(colors: string[], columnLs: IColumnSelector[], tabid: number): void;
    updateDisplayedScript(updateBlockly?: boolean): void;
    programIdUpdated(prog: HelenaProgram): void;
    updateDisplayedDownloadURLs(prog: HelenaProgram): void;
    updateDuplicateDetection(): void;
    private sortProps;
    updateCustomThresholds(): void;
    updateCustomWaits(): void;
    updateNodeRequiredFeaturesUI(): void;
    addNewRowToOutput(runTabId: string, listOfCellTexts: string[], limit?: number): void;
    uploadRelation(): void;
    demonstrateRelation(): void;
    handleNewUploadedRelation(event: JQuery.ChangeEvent): void;
    addDialog(title: string, dialogText: string, buttonTextToHandlers: {
        [key: string]: Function;
    }): JQuery<HTMLElement>;
    continueAfterDialogue(text: string, continueButtonText: string, continueButtonContinuation: Function): JQuery<HTMLElement>;
    loadSavedScripts(): void;
    loadScheduledScripts(): void;
    loadSavedDataset(datasetId: number): void;
    loadSavedProgram(progId: string, continuation?: Function): void;
    updateRowsSoFar(runTabId: string, num: number): void;
}
