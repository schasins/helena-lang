import * as Blockly from "blockly";

import { HelenaMainpanel } from "./helena_mainpanel";

import { RecorderUI } from "./ui/recorder_ui";

import { NodeVariable } from "./variables/node_variable";
import { HelenaLangObject } from "./lang/helena_lang";
import { GenericRelation } from "./relation/generic";
import { PageVariable } from "./variables/page_variable";
import { EventMessage } from "../common/messages";
import { RunObject } from "./lang/program";

// TODO: cjbaik: is there a way of avoiding using these as globals?
declare global {
	interface Window {
    allNodeVariablesSeenSoFar: NodeVariable[];
    currentReplayWindowId: number | null;
    recordingWindowIds: number[];
    currentRunObjects: RunObject[];
    helenaServerUrl: string;
    demoMode: boolean;

    // TODO: cjbaik: modularize all these later, remove `window` calls
    SimpleRecord: SimpleRecordPlaceholder;
    utilities: any; // TODO: modularize later
    DOMCreationUtilities: any;
    ReplayScript: any;
    DownloadUtilities: any;
		// MiscUtilities: any; // TODO: modularize later
		// WALconsole: any; // TODO: modularize later
		// Highlight: any; // TODO: modularize later
		NextTypes: any; // TODO: modularize later
		ServerTranslationUtilities: any; // TODO: modularize later
		RelationItemsOutputs: any; // TODO: modularize later
    DefaultHelenaValues: any; // TODO: modularize later
    HelenaServerInteractions: any; // TODO: modularize later
    Revival: any; // TODO: modularize later
    EventM: any; // TODO: modularize later
    Environment: any; // TODO: modularize later
    ReplayTraceManipulation: any; // TODO: modularize later
    TraceManipulationUtilities: any; // TODO: modularize later
  }
  
  // TODO: factor out these JQuery libraries
  interface JQueryStatic {
    format: {
      date: Function;
    },
    csv: {
      toArrays: Function;
    }
  }

  interface EnvironmentPlaceholder {
    envBind: Function;
    envExtend: Function;
    envLookup: Function;
    parent: EnvironmentPlaceholder;
  }

  interface HashBasedParallel {
    on: boolean;
    numThreads: number;
    thisThreadIndex: number;
  }

  // TODO: cjbaik: placeholder objects until we can get the real imports
  interface DatasetPlaceholder {
    id?: number;
    fullDatasetLength: number;
    pass_start_time: number;

    addRow: Function;
    appendToName: Function;
    getId: Function;
    closeDataset: Function;
    downloadUrl: Function;
    downloadFullDatasetUrl: Function;
    downloadDataset: Function;
    downloadFullDataset: Function;
    closeDatasetWithCont: Function;
    datasetSlice: Function;
  }

  // TODO: cjbaik: placeholder objects until we can get the real imports
  interface ScheduledScriptMessage {
    progId: string;
  }

  interface ServerSavedProgram {
    id: string;
    date: number;
    name: string;
    serialized_program: string;
  }

  interface FrameDataPlaceholder {
    tab: any;     // TODO: what type?
  }

  interface HelenaBlock extends Blockly.Block {
    helena: HelenaLangObject;
  }

  interface HelenaBlockUIEvent extends Blockly.Events.Ui {
    element: string;
    oldValue: any;
  }

  interface Revivable {
    ___revivalLabel___: string;
  }

  interface SimpleRecordPlaceholder {
    replay: Function;
    startRecording: Function;
    stopRecording: Function;
    stopReplay: Function;
  }

  interface ReplayObjectPlaceholder {
    record: {
      events: EventMessage[];
    }
  }

  interface ParameterizedTraceConfig {
    frameMapping: object;
    tabMapping: object;
    targetWindowId?: number;
  }
}

// TODO: cjbaik: hide these off the window object?
window.recordingWindowIds = [];
window.currentRunObjects = [];
window.currentReplayWindowId = null;
window.demoMode = false;
window.allNodeVariablesSeenSoFar = [];

// make this call early so that the voices will be loaded early
speechSynthesis.getVoices(); // in case we ever want to say anything

window.utilities.listenForMessage("content", "mainpanel",
  "currentReplayWindowId", () => {
    window.utilities.sendMessage("mainpanel", "content",
      "currentReplayWindowId", { window: window.currentReplayWindowId });
  }
);

// the RecorderUI is the UI object that will show Helena programs, so certain
//   edits to the programs are allowed to call UI hooks that make the UI respond
//   to program changes
new HelenaMainpanel(new RecorderUI());