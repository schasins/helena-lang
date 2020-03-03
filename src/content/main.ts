import { MessageContent, ColumnIndexMessageContent } from "../common/messages";
import { RelationOutput } from "../common/relation";
import { HelenaContent } from "./helena_content";

// TODO: modularize later
// import { RelationFinder } from "./relation_finding";
// import { MiscUtilities, utilities, window.WALconsole } from "../common/misc_utilities";

/**********************************************************************
 * Listeners and general set up
 **********************************************************************/

// TODO: cjbaik: is there a way of avoiding using these as globals?
declare global {
	interface Window {
		helenaContent: HelenaContent;

		additional_recording_handlers: {
			scrape: Function;
			visualization: Function;
		},
		additional_recording_filters: {
			ignoreExtraCtrlAlt: Function;
			ignoreExtraKeydowns: Function;
		},
		additional_recording_handlers_on: {
			scrape: boolean;
			visualization: boolean;
		},
		additional_recording_filters_on: {
			ignoreExtraCtrlAlt: boolean;
			ignoreExtraKeydowns: boolean;
		}

		// TODO: cjbaik: modularize all these later, remove `window` calls
		utilities: any; // TODO: modularize later
		MiscUtilities: any; // TODO: modularize later
		WALconsole: any; // TODO: modularize later
		RelationFinder: any; // TODO: modularize later
	}
}

window.helenaContent = new HelenaContent();

// TODO: cjbaik: move all this stuff after we update `relation_finding.js`
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