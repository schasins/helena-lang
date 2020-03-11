import { MessageContent, ColumnIndexMessageContent, LikelyRelationMessageContent } from "../common/messages";
import { RelationFinder, GenericSelector } from "./relation_finding";
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
		Highlight: any; // TODO: modularize later
		NextTypes: any; // TODO: modularize later
		ServerTranslationUtilities: any; // TODO: modularize later
		RelationItemsOutputs: any; // TODO: modularize later
		DefaultHelenaValues: any; // TODO: modularize later
	}
}

// TODO: cjbaik: move all this stuff after we update `relation_finding.js`
window.utilities.listenForMessage("mainpanel", "content", "getRelationItems", function (selector: GenericSelector) {
	RelationFinder.sendRelationToMainpanel(selector);
});
window.utilities.listenForMessage("mainpanel", "content", "getFreshRelationItems", function (msg: GenericSelector) {
	RelationFinder.getFreshRelationItems(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "editRelation", function (selector: GenericSelector) {
	RelationFinder.editRelation(selector);
});
window.utilities.listenForMessage("mainpanel", "content", "nextButtonSelector", function (msg: MessageContent) {
	RelationFinder.nextButtonSelector();
});
window.utilities.listenForMessage("mainpanel", "content", "clearNextButtonSelector", function (msg: MessageContent) {
	RelationFinder.clearNextButtonSelector();
});
window.utilities.listenForMessage("mainpanel", "content", "backButton", function() {
	history.back();
});
window.utilities.listenForMessage("mainpanel", "content", "pageStats", function() {
	window.utilities.sendMessage("content", "mainpanel", "pageStats", {
		"numNodes": document.querySelectorAll('*').length
	});
});
window.utilities.listenForMessage("mainpanel", "content", "runNextInteraction", function (msg: GenericSelector) {
	RelationFinder.runNextInteraction(msg);
});
window.utilities.listenForMessage("mainpanel", "content", "currentColumnIndex", function (msg: ColumnIndexMessageContent) {
	RelationFinder.setEditRelationIndex(msg.index);
});
window.utilities.listenForMessage("mainpanel", "content", "clearRelationInfo", function (msg: GenericSelector) {
	RelationFinder.clearRelationInfo(msg);
});

window.utilities.listenForFrameSpecificMessage("mainpanel", "content", "likelyRelation",
	function (msg: MessageContent, sendResponse: Function){
		window.MiscUtilities.registerCurrentResponseRequested(msg,
			function (m: LikelyRelationMessageContent) {
				let likelyRel = RelationFinder.likelyRelation(m);
				console.log('likelyRel', likelyRel);
				if (likelyRel) {
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
			function(m: GenericSelector) {
				RelationFinder.getFreshRelationItemsHelper(m, function(freshRelationItems: RelationOutput) {
					window.WALconsole.namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
					newSendResponse(freshRelationItems);
				});
			});
	}
);


window.helenaContent = new HelenaContent();