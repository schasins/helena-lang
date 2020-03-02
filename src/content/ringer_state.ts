import { RecordingHandlers } from "./recording_UI";
import { WindowsMessageContent, WindowIdMessageContent } from "../common/messages";

/**
 * Stores Ringer record + replay state for the content scripts.
 */
export class RingerState {
    currentRecordingWindows?: number[];
    currentReplayWindowId?: number;

    private listen() {
        let self = this;

        window.utilities.listenForMessage("mainpanel", "content",
            "currentRecordingWindows", function (msg: WindowsMessageContent) {
                self.currentRecordingWindows = msg.window_ids;
        });

        window.utilities.listenForMessage("mainpanel", "content",
            "currentReplayWindowId", function (msg: WindowIdMessageContent) {
            self.currentReplayWindowId = msg.window; 
            RecordingHandlers.applyReplayOverlayIfAppropriate(msg.window);
        });
    }

    // Poll mainpanel for information until retrieved.
    // [cjbaik: I presume this is because you can't directly have access
    //    from the content script?]
    constructor() {
        let self = this;
        self.listen();

        // TODO: cjbaik: switch this pattern to a port connection rather than
        //   doing this polling
        window.MiscUtilities.repeatUntil(
            function () {
                window.utilities.sendMessage("content", "mainpanel",
                    "requestCurrentRecordingWindows", {});
            },
            function () {
                return !!self.currentRecordingWindows;
            },
            function () {},
            1000, true);

        window.MiscUtilities.repeatUntil(
            function () {
                window.utilities.sendMessage("content", "mainpanel",
                    "currentReplayWindowId", {});
            },
            function () {
                return !!self.currentReplayWindowId;
            },
            function () {},
            1000, true);
    
    }
}