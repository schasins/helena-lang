import { ColumnIndexMessage, LikelyRelationMessage,
	FreshRelationItemsMessage,
	Messages} from "../common/messages";
import { RelationFinder } from "./selector/relation_finding";
import { RelationSelector } from "./selector/relation_selector";
import { HelenaContent } from "./helena_content";
import { NextButtonSelector } from "./selector/next_button_selector";
import { HelenaConsole } from "../common/utils/helena_console";

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
		MiscUtilities: any; // TODO: modularize later
		Highlight: any; // TODO: modularize later
		NextTypes: any; // TODO: modularize later
		ServerTranslationUtilities: any; // TODO: modularize later
		RelationItemsOutputs: any; // TODO: modularize later
		DefaultHelenaValues: any; // TODO: modularize later
	}
}

// TODO: cjbaik: move all this stuff after we update `relation_finding.js`
Messages.listenForMessage("mainpanel", "content", "getRelationItems",
	(selector: RelationSelector) => {
		// let selector = RelationSelector.fromMessage(msg);
		RelationFinder.sendMatchingRelationToMainpanel(selector);
	}
);

Messages.listenForMessage("mainpanel", "content",
	"getFreshRelationItems", (selector: RelationSelector) => {
	// let selector = RelationSelector.fromMessage(msg);
	RelationFinder.getFreshRelationItems(selector);
});

Messages.listenForMessage("mainpanel", "content", "editRelation",
	(selector: RelationSelector) => {
		// let selector = RelationSelector.fromMessage(msg);
		RelationFinder.editRelation(selector);
	}
);

Messages.listenForMessage("mainpanel", "content", "nextButtonSelector",
	() => {
		NextButtonSelector.listenForNextButtonClick();
	}
);

Messages.listenForMessage("mainpanel", "content",
	"clearNextButtonSelector", () => {
		NextButtonSelector.unhighlightNextButton();
	}
);

Messages.listenForMessage("mainpanel", "content", "backButton", () => {
	history.back();
});

Messages.listenForMessage("mainpanel", "content", "pageStats", () => {
	Messages.sendMessage("content", "mainpanel", "pageStats", {
		numNodes: document.querySelectorAll('*').length
	});
});

Messages.listenForMessage("mainpanel", "content", "runNextInteraction",
	(selector: RelationSelector) => {
		// let selector = RelationSelector.fromMessage(msg);
		RelationFinder.getNextPage(selector);
	}
);

Messages.listenForMessage("mainpanel", "content", "currentColumnIndex",
	(msg: ColumnIndexMessage) => {
		RelationFinder.setEditRelationIndex(msg.index);
	}
);

Messages.listenForMessage("mainpanel", "content", "clearRelationInfo",
	(selector: RelationSelector) => {
		// let selector = RelationSelector.fromMessage(msg);
		RelationFinder.clearRelationInfo(selector);
	}
);

Messages.listenForFrameSpecificMessage("mainpanel", "content",
"likelyRelation", (msg: object, sendResponse: Function) => {
		window.MiscUtilities.registerCurrentResponseRequested(msg,
			(m: LikelyRelationMessage) => {
				let likelyRel = RelationFinder.likelyRelation(m);
				console.log('likelyRel', likelyRel);
				if (likelyRel) {
					sendResponse(likelyRel);
				}
			}
		);
	}
);

Messages.listenForFrameSpecificMessage("mainpanel", "content",
	"getFreshRelationItems", (msg: object, sendResponse: Function) => {
		window.MiscUtilities.registerCurrentResponseRequested(msg, 
			(selector: RelationSelector) => {
				// let selector = RelationSelector.fromMessage(m);
				RelationFinder.getFreshRelationItemsHelper(selector,
					(freshRelationItems: FreshRelationItemsMessage) => {
						HelenaConsole.namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
						sendResponse(freshRelationItems);
					}
				);
			});
	}
);

window.helenaContent = new HelenaContent();