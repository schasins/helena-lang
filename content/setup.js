/**********************************************************************
 * Author: S. Chasins
 **********************************************************************/

 'use strict'

/**********************************************************************
 * Listeners and general set up
 **********************************************************************/

var tabId = "setme";
var windowId = "setme";
var tabTopUrl = "setme";
var currentRecordingWindows = null;
var currentReplayWindowId = null;

utilities.listenForMessage("background", "content", "tabID", function(msg){
	tabId = msg.tab_id; 
	windowId = msg.window_id;
	tabTopUrl = msg.top_frame_url;
	console.log("tabId info", tabId, windowId, tabTopUrl);
});
utilities.listenForMessage("mainpanel", "content", "getRelationItems", function(msg){RelationFinder.getRelationItems(msg);});
utilities.listenForMessage("mainpanel", "content", "getFreshRelationItems", function(msg){RelationFinder.getFreshRelationItems(msg);});
utilities.listenForMessage("mainpanel", "content", "editRelation", function(msg){RelationFinder.editRelation(msg);});
utilities.listenForMessage("mainpanel", "content", "nextButtonSelector", function(msg){RelationFinder.nextButtonSelector(msg);});
utilities.listenForMessage("mainpanel", "content", "clearNextButtonSelector", function(msg){RelationFinder.clearNextButtonSelector(msg);});
utilities.listenForMessage("mainpanel", "content", "currentRecordingWindows", function(msg){currentRecordingWindows = msg.window_ids;});
utilities.listenForMessage("mainpanel", "content", "currentReplayWindowId", function(msg){
	currentReplayWindowId = msg; 
	RecordingHandlers.applyReplayOverlayIfAppropriate(msg.window);});
utilities.listenForMessage("mainpanel", "content", "backButton", function(){history.back();});
utilities.listenForMessage("mainpanel", "content", "pageStats", function(){ utilities.sendMessage("content", "mainpanel", "pageStats", {"numNodes": $('*').length});});
utilities.listenForMessage("mainpanel", "content", "runNextInteraction", function(msg){RelationFinder.runNextInteraction(msg);});
utilities.listenForMessage("mainpanel", "content", "currentColumnIndex", function(msg){RelationFinder.setEditRelationIndex(msg.index);});
utilities.listenForMessage("mainpanel", "content", "excludeFirstRows", function(msg){RelationFinder.setExcludeFirst(msg.numRows);});
utilities.listenForMessage("mainpanel", "content", "excludeLastRows", function(msg){RelationFinder.setExcludeLast(msg.numRows);});
utilities.listenForMessage("mainpanel", "content", "clearRelationInfo", function(msg){RelationFinder.clearRelationInfo(msg);});

utilities.listenForFrameSpecificMessage("mainpanel", "content", "likelyRelation",
	function (msg, sendResponse){
		MiscUtilities.registerCurrentResponseRequested(msg,
			function(m){
				var likelyRel = RelationFinder.likelyRelationWrapper(m);
				console.log('likelyRel', likelyRel);
				if (likelyRel !== null){
					sendResponse(likelyRel);
				}
			});
	}
);

utilities.listenForFrameSpecificMessage("mainpanel", "content", "getFreshRelationItems", 
	function(msg, sendResponse){
		var newSendResponse = function(ans){
			WALconsole.namedLog("getRelationItems", "actually running sendResponse with arg", ans);
			sendResponse(ans); 
		}
		MiscUtilities.registerCurrentResponseRequested(msg, 
			function(m){
				RelationFinder.getFreshRelationItemsHelper(m, function(freshRelationItems){
					WALconsole.namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
					newSendResponse(freshRelationItems);
				});
			});
	}
);

// keep requesting this tab's tab id until we get it
MiscUtilities.repeatUntil(
		function(){utilities.sendMessage("content", "background", "requestTabID", {});},
		function(){return (tabId !== "setme" && windowId !== "setme");},
                function(){},
		1000, true);
// keep trying to figure out which window is currently being recorded until we find out
MiscUtilities.repeatUntil(
		function(){utilities.sendMessage("content", "mainpanel", "requestCurrentRecordingWindows", {});},
		function(){return (currentRecordingWindows !== null);},
                function(){},
		1000, true);
// keep trying to figure out which window is currently being recorded until we find out
MiscUtilities.repeatUntil(
		function(){utilities.sendMessage("content", "mainpanel", "currentReplayWindowId", {});},
		function(){return (currentReplayWindowId !== null);},
                function(){},
		1000, true);
