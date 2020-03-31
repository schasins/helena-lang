import * as Blockly from "blockly";

import { HelenaMainpanel } from "./helena_mainpanel";

import { RecorderUI } from "./ui/recorder_ui";

import { NodeVariable } from "./variables/node_variable";
import { HelenaLangObject } from "./lang/helena_lang";
import { Messages } from "../common/messages";
import { RunObject } from "./lang/program";
import { TraceType } from "../common/utils/trace";

// TODO: cjbaik: is there a way of avoiding using these as globals?
declare global {
	interface Window {
    allNodeVariablesSeenSoFar: NodeVariable[];
    currentReplayWindowId: number | null;
    recordingWindowIds: number[];
    currentRunObjects: RunObject[];
    demoMode: boolean;
    ports: any;     // TODO: ringer ports manager

    // TODO: cjbaik: modularize all these later, remove `window` calls
    SimpleRecord: SimpleRecordPlaceholder;
    JSOG: any;
    ReplayTraceManipulation: any; // TODO: modularize later
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

  interface HashBasedParallel {
    on: boolean;
    numThreads: number;
    thisThreadIndex: number;
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
  interface HelenaBlock extends Blockly.Block {
    helena: HelenaLangObject;
  }

  interface HelenaBlockUIEvent extends Blockly.Events.Ui {
    element: string;
    oldValue: any;
  }

  interface SimpleRecordPlaceholder {
    replay: Function;
    startRecording: Function;
    stopRecording: Function;
    stopReplay: Function;
  }

  interface ReplayObjectPlaceholder {
    record: {
      events: TraceType;
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

Messages.listenForMessage("content", "mainpanel",
  "currentReplayWindowId", () => {
    Messages.sendMessage("mainpanel", "content",
      "currentReplayWindowId", { window: window.currentReplayWindowId });
  }
);

// the RecorderUI is the UI object that will show Helena programs, so certain
//   edits to the programs are allowed to call UI hooks that make the UI respond
//   to program changes
new HelenaMainpanel(new RecorderUI());