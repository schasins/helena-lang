import { RecordingHandlers } from "./recording_UI";
import { RelationFinder } from "./relation_finding";
import { TabIDMessageContent, WindowsMessageContent, MessageContent, WindowIdMessageContent, ColumnIndexMessageContent } from "../common/messages";
import { RelationOutput } from "../common/relation";

// TODO: modularize later
// import { window.MiscUtilities, utilities, window.WALconsole } from "../common/misc_utilities";

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
		utilities: any; // TODO: modularize later
		MiscUtilities: any; // TODO: modularize later
		WALconsole: any; // TODO: modularize later
	}
}

window.tabId = null;
window.windowId = null;
window.currentReplayWindowId = null;
window.currentRecordingWindows = null;

window.utilities.listenForMessage("background", "content", "tabID", function (msg: TabIDMessageContent) {
	console.error('This function should never be called.');
	/* TODO: only restore these if the error above triggers
	window.tabId = msg.tab_id;
	window.windowId = msg.window_id;
	window.tabTopUrl = msg.top_frame_url;
	console.log("tabId info", window.tabId, window.windowId, window.tabTopUrl); */
});
window.utilities.listenForMessage("mainpanel", "content", "getRelationItems", function (msg: MessageContent) {
	RelationFinder.getRelationItems(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "getFreshRelationItems", function (msg: MessageContent) {
	RelationFinder.getFreshRelationItems(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "editRelation", function (msg: MessageContent) {
	RelationFinder.editRelation(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "nextButtonSelector", function (msg: MessageContent) {
	RelationFinder.nextButtonSelector();
});
window.utilities.listenForMessage("mainpanel", "content", "clearNextButtonSelector", function (msg: MessageContent) {
	RelationFinder.clearNextButtonSelector();
});
window.utilities.listenForMessage("mainpanel", "content", "currentRecordingWindows", function (msg: WindowsMessageContent) {
	console.error('This function should never be called.');
	/* TODO: only restore these if the error above triggers
	window.currentRecordingWindows = msg.window_ids; */
});
window.utilities.listenForMessage("mainpanel", "content", "currentReplayWindowId", function (msg: WindowIdMessageContent) {
	window.currentReplayWindowId = msg; 
	RecordingHandlers.applyReplayOverlayIfAppropriate(msg.window);
});
window.utilities.listenForMessage("mainpanel", "content", "backButton", function() {
	history.back();
});
window.utilities.listenForMessage("mainpanel", "content", "pageStats", function() {
	window.utilities.sendMessage("content", "mainpanel", "pageStats", {
		"numNodes": document.querySelectorAll('*').length
	});
});
window.utilities.listenForMessage("mainpanel", "content", "runNextInteraction", function (msg: MessageContent) {
	RelationFinder.runNextInteraction(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "currentColumnIndex", function (msg: ColumnIndexMessageContent) {
	RelationFinder.setEditRelationIndex(msg.index);
});
window.utilities.listenForMessage("mainpanel", "content", "clearRelationInfo", function (msg: MessageContent) {
	RelationFinder.clearRelationInfo(msg);
});

window.utilities.listenForFrameSpecificMessage("mainpanel", "content", "likelyRelation",
	function (msg: MessageContent, sendResponse: Function){
		window.MiscUtilities.registerCurrentResponseRequested(msg,
			function (m: MessageContent) {
				var likelyRel = RelationFinder.likelyRelationWrapper(m);
				console.log('likelyRel', likelyRel);
				if (likelyRel !== null){
					sendResponse(likelyRel);
				}
			});
	}
);

window.utilities.listenForFrameSpecificMessage("mainpanel", "content", "getFreshRelationItems", 
	function(msg: MessageContent, sendResponse: Function){
		var newSendResponse = function(ans: RelationOutput) {
			window.WALconsole.namedLog("getRelationItems", "actually running sendResponse with arg", ans);
			sendResponse(ans);
		}
		window.MiscUtilities.registerCurrentResponseRequested(msg, 
			function(m: MessageContent) {
				RelationFinder.getFreshRelationItemsHelper(m, function(freshRelationItems: RelationOutput) {
					window.WALconsole.namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
					newSendResponse(freshRelationItems);
				});
			});
	}
);

// keep requesting this tab's tab id until we get it
window.MiscUtilities.repeatUntil(
		function() {
			window.utilities.sendMessage("content", "background", "requestTabID", {});
		},
		function() {
			return (window.tabId !== null && window.windowId !== null);
		},
		function() {},
		1000, true);
// keep trying to figure out which window is currently being recorded until we find out
window.MiscUtilities.repeatUntil(
		function() {
			window.utilities.sendMessage("content", "mainpanel", "requestCurrentRecordingWindows", {});
		},
		function() {
			return (window.currentRecordingWindows !== null);
		},
		function() {},
		1000, true);
// keep trying to figure out which window is currently being recorded until we find out
window.MiscUtilities.repeatUntil(
		function() {
			window.utilities.sendMessage("content", "mainpanel", "currentReplayWindowId", {});
		},
		function() {
			return (window.currentReplayWindowId !== null);
		},
		function() {},
		1000, true);
