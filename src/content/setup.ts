import { RecordingHandlers } from "./recording_UI";
import { RelationFinder } from "./relation_finding";
import { MiscUtilities, utilities, WALconsole } from "../common/misc_utilities";
import { TabIDMessageContent, WindowsMessageContent, MessageContent, WindowIdMessageContent, ColumnIndexMessageContent } from "../common/messages";
import { RelationOutput } from "../common/relation";

/**********************************************************************
 * Listeners and general set up
 **********************************************************************/

// TODO: is there a way of avoiding using these as globals? Where are they even used?
declare global {
	interface Window {
		tabId: number | null;
		windowId: number | null;
		currentReplayWindowId: number | null;
		currentRecordingWindows: number[] | null;
	}
}

window.tabId = null;
window.windowId = null;
window.currentReplayWindowId = null;
window.currentRecordingWindows = null;

utilities.listenForMessage("background", "content", "tabID", function (msg: TabIDMessageContent) {
	console.error('This function should never be called.');
	/* TODO: only restore these if the error above triggers
	window.tabId = msg.tab_id;
	window.windowId = msg.window_id;
	window.tabTopUrl = msg.top_frame_url;
	console.log("tabId info", window.tabId, window.windowId, window.tabTopUrl); */
});
utilities.listenForMessage("mainpanel", "content", "getRelationItems", function (msg: MessageContent) {
	RelationFinder.getRelationItems(msg);
});
utilities.listenForMessage("mainpanel", "content", "getFreshRelationItems", function (msg: MessageContent) {
	RelationFinder.getFreshRelationItems(msg);
});
utilities.listenForMessage("mainpanel", "content", "editRelation", function (msg: MessageContent) {
	RelationFinder.editRelation(msg);
});
utilities.listenForMessage("mainpanel", "content", "nextButtonSelector", function (msg: MessageContent) {
	RelationFinder.nextButtonSelector();
});
utilities.listenForMessage("mainpanel", "content", "clearNextButtonSelector", function (msg: MessageContent) {
	RelationFinder.clearNextButtonSelector();
});
utilities.listenForMessage("mainpanel", "content", "currentRecordingWindows", function (msg: WindowsMessageContent) {
	console.error('This function should never be called.');
	/* TODO: only restore these if the error above triggers
	window.currentRecordingWindows = msg.window_ids; */
});
utilities.listenForMessage("mainpanel", "content", "currentReplayWindowId", function (msg: WindowIdMessageContent) {
	window.currentReplayWindowId = msg; 
	RecordingHandlers.applyReplayOverlayIfAppropriate(msg.window);
});
utilities.listenForMessage("mainpanel", "content", "backButton", function() {
	history.back();
});
utilities.listenForMessage("mainpanel", "content", "pageStats", function() {
	utilities.sendMessage("content", "mainpanel", "pageStats", {
		"numNodes": document.querySelectorAll('*').length
	});
});
utilities.listenForMessage("mainpanel", "content", "runNextInteraction", function (msg: MessageContent) {
	RelationFinder.runNextInteraction(msg);
});
utilities.listenForMessage("mainpanel", "content", "currentColumnIndex", function (msg: ColumnIndexMessageContent) {
	RelationFinder.setEditRelationIndex(msg.index);
});
utilities.listenForMessage("mainpanel", "content", "clearRelationInfo", function (msg: MessageContent) {
	RelationFinder.clearRelationInfo(msg);
});

utilities.listenForFrameSpecificMessage("mainpanel", "content", "likelyRelation",
	function (msg: MessageContent, sendResponse: Function){
		MiscUtilities.registerCurrentResponseRequested(msg,
			function (m: MessageContent) {
				var likelyRel = RelationFinder.likelyRelationWrapper(m);
				console.log('likelyRel', likelyRel);
				if (likelyRel !== null){
					sendResponse(likelyRel);
				}
			});
	}
);

utilities.listenForFrameSpecificMessage("mainpanel", "content", "getFreshRelationItems", 
	function(msg: MessageContent, sendResponse: Function){
		var newSendResponse = function(ans: RelationOutput) {
			WALconsole.namedLog("getRelationItems", "actually running sendResponse with arg", ans);
			sendResponse(ans);
		}
		MiscUtilities.registerCurrentResponseRequested(msg, 
			function(m: MessageContent) {
				RelationFinder.getFreshRelationItemsHelper(m, function(freshRelationItems: RelationOutput) {
					WALconsole.namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
					newSendResponse(freshRelationItems);
				});
			});
	}
);

// keep requesting this tab's tab id until we get it
MiscUtilities.repeatUntil(
		function() {
			utilities.sendMessage("content", "background", "requestTabID", {});
		},
		function() {
			return (window.tabId !== null && window.windowId !== null);
		},
		function() {},
		1000, true);
// keep trying to figure out which window is currently being recorded until we find out
MiscUtilities.repeatUntil(
		function() {
			utilities.sendMessage("content", "mainpanel", "requestCurrentRecordingWindows", {});
		},
		function() {
			return (window.currentRecordingWindows !== null);
		},
		function() {},
		1000, true);
// keep trying to figure out which window is currently being recorded until we find out
MiscUtilities.repeatUntil(
		function() {
			utilities.sendMessage("content", "mainpanel", "currentReplayWindowId", {});
		},
		function() {
			return (window.currentReplayWindowId !== null);
		},
		function() {},
		1000, true);
