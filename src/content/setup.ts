import { WindowsMessageContent, MessageContent, WindowIdMessageContent, ColumnIndexMessageContent } from "../common/messages";
import { RelationOutput } from "../common/relation";
import { TabDetails } from "./tab_details";

// TODO: modularize later
// import { RecordingHandlers } from "./recording_UI";
// import { RelationFinder } from "./relation_finding";
// import { MiscUtilities, utilities, window.WALconsole } from "../common/misc_utilities";

/**********************************************************************
 * Listeners and general set up
 **********************************************************************/

// TODO: is there a way of avoiding using these as globals? Where are they even used?
declare global {
	interface Window {
		tabDetails: TabDetails;
		// tabId: number | string | null;
		// windowId: number | string | null;
		// tabTopUrl: number | string | null;
		currentReplayWindowId: number | null;
		currentRecordingWindows: number[] | null;

		// TODO: cjbaik: modularize all these later, remove `window` calls
		utilities: any; // TODO: modularize later
		MiscUtilities: any; // TODO: modularize later
		WALconsole: any; // TODO: modularize later
		RecordingHandlers: any; // TODO: modularize later
		RelationFinder: any; // TODO: modularize later
	}
}

// TODO: un-globalize this after modularizing `content/recording_UI.js`?
window.tabDetails = new TabDetails();

window.currentReplayWindowId = null;
window.currentRecordingWindows = null;

window.utilities.listenForMessage("mainpanel", "content", "getRelationItems", function (msg: MessageContent) {
	window.RelationFinder.getRelationItems(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "getFreshRelationItems", function (msg: MessageContent) {
	window.RelationFinder.getFreshRelationItems(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "editRelation", function (msg: MessageContent) {
	window.RelationFinder.editRelation(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "nextButtonSelector", function (msg: MessageContent) {
	window.RelationFinder.nextButtonSelector();
});
window.utilities.listenForMessage("mainpanel", "content", "clearNextButtonSelector", function (msg: MessageContent) {
	window.RelationFinder.clearNextButtonSelector();
});
window.utilities.listenForMessage("mainpanel", "content", "currentRecordingWindows", function (msg: WindowsMessageContent) {
	window.currentRecordingWindows = msg.window_ids;
});
window.utilities.listenForMessage("mainpanel", "content", "currentReplayWindowId", function (msg: WindowIdMessageContent) {
	window.currentReplayWindowId = msg; 
	window.RecordingHandlers.applyReplayOverlayIfAppropriate(msg.window);
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
	window.RelationFinder.runNextInteraction(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "currentColumnIndex", function (msg: ColumnIndexMessageContent) {
	window.RelationFinder.setEditRelationIndex(msg.index);
});
window.utilities.listenForMessage("mainpanel", "content", "clearRelationInfo", function (msg: MessageContent) {
	window.RelationFinder.clearRelationInfo(msg);
});

window.utilities.listenForFrameSpecificMessage("mainpanel", "content", "likelyRelation",
	function (msg: MessageContent, sendResponse: Function){
		window.MiscUtilities.registerCurrentResponseRequested(msg,
			function (m: MessageContent) {
				var likelyRel = window.RelationFinder.likelyRelationWrapper(m);
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
				window.RelationFinder.getFreshRelationItemsHelper(m, function(freshRelationItems: RelationOutput) {
					window.WALconsole.namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
					newSendResponse(freshRelationItems);
				});
			});
	}
);

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
