import { MessageContent, ColumnIndexMessageContent } from "../common/messages";
import { RelationOutput } from "../common/relation";
import { TabDetails } from "./tab_details";
import { RingerState } from "./ringer_state";

// TODO: modularize later
// import { RecordingHandlers } from "./recording_UI";
// import { RelationFinder } from "./relation_finding";
// import { MiscUtilities, utilities, window.WALconsole } from "../common/misc_utilities";

/**********************************************************************
 * Listeners and general set up
 **********************************************************************/

// TODO: is there a way of avoiding using these as globals?
declare global {
	interface Window {
		tabDetails: TabDetails;
		ringerState: RingerState;

		// TODO: cjbaik: modularize all these later, remove `window` calls
		utilities: any; // TODO: modularize later
		MiscUtilities: any; // TODO: modularize later
		WALconsole: any; // TODO: modularize later
		RecordingHandlers: any; // TODO: modularize later
		RelationFinder: any; // TODO: modularize later
	}
}

// TODO: un-globalize this after modularizing `content/recording_UI.js` and
//   other associated files
window.tabDetails = new TabDetails();
window.ringerState = new RingerState();

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