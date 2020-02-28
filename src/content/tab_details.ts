import { TabDetailsMessageContent } from "../common/messages";

export class TabDetails {
    tabId?: number;
    windowId?: number;
    tabTopUrl?: string;

    private listen() {
        let self = this;
        window.utilities.listenForMessage("background", "content", "tabID",
            function (msg: TabDetailsMessageContent) {
                self.tabId = msg.tab_id;
                self.windowId = msg.window_id;
                self.tabTopUrl = msg.top_frame_url;
                console.log("tabId info", self.tabId, self.windowId,
                    self.tabTopUrl);
            }
        );
    }

    constructor () {
        let self = this;

        self.listen();

        // Poll background script for TabDetails information until retrieved.
        window.MiscUtilities.repeatUntil(
            function() {
                window.utilities.sendMessage("content", "background",
                    "requestTabID", {});
            },
            function() {
                return (self.tabId && self.windowId);
            },
            function() {},
            1000, true);
    }
}

