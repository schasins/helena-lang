/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/content/setup.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/common/misc_utilities.js":
/*!**************************************!*\
  !*** ./src/common/misc_utilities.js ***!
  \**************************************/
/*! exports provided: WALconsole, utilities, MiscUtilities */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WALconsole", function() { return WALconsole; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "utilities", function() { return utilities; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MiscUtilities", function() { return MiscUtilities; });
const WALconsole = (function _WALconsole() { var pub = {};

  pub.debugging = false;
  pub.showWarnings = true;
  pub.namedDebugging = []; //["nextInteraction"]; //["getRelationItems"]; // ["prinfo"]; //["duplicates"]; //["rbb"];//["getRelationItems", "nextInteraction"];
  pub.styleMinimal = true;

  function callerName(origArgs){
    console.log("origArgs", origArgs);
    try {
      return origArgs.callee.caller.name;
    }
    catch(e){
      return "unknown caller";
    }
  }

  function loggingGuts(args, origArgs){
    var prefix = [];
    if (!pub.styleMinimal){
      var caller = callerName(origArgs);
      prefix = ["["+caller+"]"];
    }
    var newArgs = prefix.concat(Array.prototype.slice.call(args));
    Function.apply.call(console.log, console, newArgs);
  };

  pub.log = function _log(){
    if (pub.debugging){
      loggingGuts(arguments, arguments);
    }
  };

  pub.namedLog = function _log(){
    var name = arguments[0];
    if (pub.debugging || pub.namedDebugging.indexOf(name) > -1) {
      var args = Array.prototype.slice.call(arguments);
      loggingGuts(args.slice(1, arguments.length), arguments);
    }
  };

  pub.warn = function _warn(){
    if (pub.showWarnings){
      var args = Array.prototype.slice.call(arguments);
      var newArgs = ["Warning: "].concat(args);
      loggingGuts(newArgs, arguments);
    }
  };

return pub; }());

const utilities = (function _utilities() { var pub = {};

  var sendTypes = {
    NORMAL: 0,
    FRAMESPECIFIC: 1
  };

  var listenerCounter = 1;
  var runtimeListeners = {};
  var extensionListeners = {};

  chrome.runtime.onMessage.addListener(function _listenerRuntime(msg, sender) {
    for (var key in runtimeListeners){
      var wasRightHandler = runtimeListeners[key](msg, sender);
      if (wasRightHandler){
        return;
      }
    }
    WALconsole.namedLog("tooCommon", "couldn't find right handler", msg, sender);
  });

  chrome.extension.onMessage.addListener(function _listenerExtension(msg, sender) {
    // WALconsole.log("keys", Object.keys(extensionListeners));
    for (var key in extensionListeners){
      // WALconsole.log("key", key);
      var wasRightHandler = extensionListeners[key](msg, sender);
      if (wasRightHandler){
        return;
      }
    }
    WALconsole.namedLog("tooCommon", "Couldn't find right handler", msg, sender);
  });

  pub.listenForMessage = function _listenForMessage(from, to, subject, fn, key){
    if (key === undefined){ key = listenerCounter; }
    WALconsole.log("Listening for messages: "+ from+" : "+to+" : "+subject);
    listenerCounter += 1;
    if (to === "background" || to === "mainpanel"){
      runtimeListeners[key] = function _oneListenerRuntime(msg, sender) {
        if (msg.from && (msg.from === from) && msg.subject && (msg.subject === subject) && (msg.send_type === sendTypes.NORMAL)) {
          if (sender.tab && sender.tab.id){
            // add a tab id iff it's from content, and thus has sender.tab and sender.tab.id
            if (!msg.content){
              msg.content = {};
            }
            msg.content.tab_id = sender.tab.id;
          }
          WALconsole.log("Receiving message: ", msg);
          WALconsole.log("from tab id: ", msg.content.tab_id);
          fn(msg.content);
          return true;
        }
        if (true){WALconsole.log("No subject match: ", msg.subject, subject)};
        return false;
      };
    }
    else if (to === "content"){
      // WALconsole.log("content listener", key, subject);
      extensionListeners[key] = function _oneListenerExtension(msg, sender) {
        // WALconsole.log(msg, sender);
        var frame_id = SimpleRecord.getFrameId();
        if (msg.frame_ids_include && msg.frame_ids_include.indexOf(frame_id) < -1){
          WALconsole.log("Msg for frames with ids "+msg.frame_ids_include+", but this frame has id "+frame_id+".");
          return false;
        }
        else if (msg.frame_ids_exclude && msg.frame_ids_exclude.indexOf(frame_id) > -1){
          WALconsole.log("Msg for frames without ids "+msg.frame_ids_exclude+", but this frame has id "+frame_id+".");
          return false;
        }
        else if (msg.from && (msg.from === from) && msg.subject && (msg.subject === subject) && (msg.send_type === sendTypes.NORMAL)) {
          WALconsole.log("Receiving message: ", msg);
          fn(msg.content);
          return true;
        }
        else{
          // WALconsole.log("Received message, but not a match for current listener.");
          // WALconsole.log(msg.from, from, (msg.from === from), msg.subject, subject, (msg.subject === subject), (msg.send_type === sendTypes.NORMAL));
          return false;
        }
      };
    }
    else{
      console.log("Bad to field in msg:", msg);
    }
  };

  // note that this frameSpecificMessage assume we'll have a response handler, so fn should provide a return value, rather than sending its own messages
  pub.listenForFrameSpecificMessage = function _listenForFrameSpecificMessage(from, to, subject, fn){
    WALconsole.log("Listening for frame-specific messages: "+ from+" : "+to+" : "+subject);
    chrome.runtime.onMessage.addListener(function _frameSpecificListener(msg, sender) {
      if (msg.subject === subject && msg.send_type === sendTypes.FRAMESPECIFIC){
        var key = msg.frame_specific_subject;
        var sendResponse = function _sendResponse(content){
          pub.sendMessage(to, from, key, content);
        };
        WALconsole.log("Receiving frame-specific message: ", msg);
        fn(msg.content, sendResponse);
        return true; // must return true so that the sendResponse channel remains open (indicates we'll use sendResponse asynchronously.  may not always, but have the option)
      }
    });
  }

  var oneOffListenerCounter = 1;

  pub.listenForMessageOnce = function _listenForMessageOnce(from, to, subject, fn){
    WALconsole.log("Listening once for message: "+ from+" : "+to+" : "+subject);
    var key = "oneoff_"+oneOffListenerCounter;
    var newfunc = null;
    oneOffListenerCounter += 1;
    if (to === "background" || to === "mainpanel"){
      newfunc = function(msg){delete runtimeListeners[key]; fn(msg);};
    }
    else if (to === "content"){
      newfunc = function(msg){delete extensionListeners[key]; fn(msg);};
    }
    pub.listenForMessage(from, to, subject, newfunc, key);
  }

  pub.listenForMessageWithKey = function _listenForMessageWithKey(from, to, subject, key, fn){
    WALconsole.log("Listening for message with key: "+ from+" : "+to+" : "+subject);
    pub.listenForMessage(from, to, subject, fn, key);
  }

  pub.stopListeningForMessageWithKey = function _stopListeningForMessageWithKey(from, to, subect, key){
    // WALconsole.log("deleting key", key);
    if (to === "background" || to === "mainpanel"){
      delete runtimeListeners[key];
    }
    else if (to === "content"){
      delete extensionListeners[key];
    }
  }

  pub.sendMessage = function _sendMessage(from, to, subject, content, frame_ids_include, frame_ids_exclude, tab_ids_include, tab_ids_exclude){ // note: frame_ids are our own internal frame ids, not chrome frame ids
    if ((from ==="background" || from ==="mainpanel") && to === "content"){
      var msg = {from: from, subject: subject, content: content, frame_ids_include: frame_ids_include, frame_ids_exclude: frame_ids_exclude};
      msg.send_type = sendTypes.NORMAL;
      WALconsole.log("Sending message: ", msg);
      WALconsole.log(tab_ids_include, tab_ids_exclude);
      if (tab_ids_include){
        for (var i =0; i<tab_ids_include.length; i++){
          if (tab_ids_include[i]){
            chrome.tabs.sendMessage(tab_ids_include[i], msg); 
          }
          else{
            WALconsole.warn("Tried to send message to undefined tab, very bad.");
            var err = new Error();
            WALconsole.warn(err.stack);
          }
        } 
        WALconsole.log("(Sent to ", tab_ids_include.length, " tabs: ", tab_ids_include, " )");
      }
      else{
          chrome.tabs.query({windowType: "normal"}, function _sendMessageTabs(tabs){
            tabs_messaged = 0;
            for (var i =0; i<tabs.length; i++){
              if (!(tab_ids_exclude && tab_ids_exclude.indexOf(tabs[i].id) > -1)){
                try {
                    chrome.tabs.sendMessage(tabs[i].id, msg); 
                }
                catch(err) {
                    // WALconsole.warn("failure to send message:", msg);
                }
                tabs_messaged ++;
              }
            }
            WALconsole.log("(Sent to "+tabs_messaged+" tabs.)");
        });
      }
    }
    else if (to === "background" || to === "mainpanel"){
      var msg = {from: from, subject: subject, content: content};
      msg.send_type = sendTypes.NORMAL;
      WALconsole.log("Sending message: ", msg);
      chrome.runtime.sendMessage(msg);
    }
    else{
      WALconsole.warn("Bad from field in msg:", msg);
    }
  };

  // this is a weird one where we make a channel based on the frame id and the subject, and anything that comes from that
  // frame with that subject will go to that channel
  pub.sendFrameSpecificMessage = function _sendFrameSpecificMessage(from, to, subject, content, chromeTabId, chromeFrameId, responseHandler){ // note: not the same as our interna frame ids
    var msg = {from: from, subject: subject, content: content};
    msg.send_type = sendTypes.FRAMESPECIFIC;
    WALconsole.log("Sending frame-specific message: ", msg);
    var newResponseHandler = function(data){
      //console.log("in response handler", data);
      responseHandler(data);
    }
    var key = subject+"_"+chromeFrameId;
    // let's register what to do when we actually get a response
    // and remember, multiple frames might be sending this, so we need to make sure we'll always get the right handler
    // (a different one for each frame), so we'll use the new frame-specific key as the 'subject'
    pub.listenForMessage(to, from, key, newResponseHandler, key); 
    msg.frame_specific_subject = key;
    chrome.tabs.sendMessage(chromeTabId, msg, {frameId: chromeFrameId}); // only send to the correct tab!
  }

return pub; }());

var DOMCreationUtilities = (function _DOMCreationUtilities() { var pub = {};

  pub.replaceContent = function _replaceContent(div1, div2){
    var div2clone = div2.clone();
    div1.html(div2clone.html());
  };

  pub.arrayOfTextsToTableRow = function _arrayOfTextsToTableRow(array){
      var $tr = $("<tr></tr>");
      for (var j= 0; j< array.length; j++){
        var $td = $("<td></td>");
        $td.html(_.escape(array[j]).replace(/\n/g,"<br>"));
        $tr.append($td);
      }
      return $tr;
    };

  pub.arrayOfArraysToTable = function _arrayOfArraysToTable(arrayOfArrays){
      var $table = $("<table></table>");
      for (var i = 0; i< arrayOfArrays.length; i++){
        var array = arrayOfArrays[i];
        $tr = DOMCreationUtilities.arrayOfTextsToTableRow(array);
        $table.append($tr);
      }
      return $table;
    };

  pub.toggleDisplay = function _toggleDisplay(node){
    console.log(node);
    if (node.css("display") === "none"){
      node.css("display", "inline");
    }
    else{
      node.css("display", "none");
    }
  };

return pub; }());

/*
A very important set of utilities for reviving objects that have been stringified
(as for sending to the server) but have returned to us, and need to be used as
proper objects again.
We always store all the fields; it's the methods we lose.  So we basically, when it 
comes time to revive it, want to union the attributes of the now unstringified dict
and the prototype, grabbing the methods back from the prototype.
*/
var Revival = (function _Revival(){ var pub = {};

  var revivalLabels = {};

  pub.introduceRevivalLabel = function _introduceRevivalLabel(label, prototype){
    revivalLabels[label] = prototype;
  };

  pub.addRevivalLabel = function _addRevivalLabel(object){
    for (var prop in revivalLabels){
      if (object instanceof revivalLabels[prop]){
        object.___revivalLabel___ = prop;
        return;
      }
    }
    WALconsole.log("No known revival label for the type of object:", object);
  };

  pub.revive = function _revive(objectAttributes){

    var seen = []; // we're going to be handling circular objects, so have to keep track of what we've already handled
    var fullSeen = [];

    var reviveHelper = function _reviveHelper(objectAttributes){
      // ok, now let's figure out what kind of case we're dealing with
      if (typeof objectAttributes !== "object" || objectAttributes === null){ // why is null even an object?
        return objectAttributes; // nothing to do here
      }
      else if (seen.indexOf(objectAttributes) > -1){
        // already seen it
        var i = seen.indexOf(objectAttributes);
        return fullSeen[i]; // get the corresponding revived object
      }
      else{
        // ok, it's an object and we haven't processed it before
        var fullObj = objectAttributes;
        if (objectAttributes.___revivalLabel___){
          // ok, we actually want to revive this very object
          var prototype = revivalLabels[objectAttributes.___revivalLabel___];
          fullObj = new prototype();
          _.extend(fullObj, objectAttributes);
          // now the fullObj is restored to having methods and such
        }
        seen.push(objectAttributes);
        fullSeen.push(fullObj);
        // ok, whether we revived this obj or not, we definitely have to descend
        for (var prop in objectAttributes){
          var val = objectAttributes[prop];
          var fullVal = reviveHelper(val, false);
          fullObj[prop] = fullVal; // must replace the old fields-only val with the proper object val
        }
      }
      return fullObj;
    };
    var obj = reviveHelper(objectAttributes);
    return obj;
  };

return pub; }());

var Clone = (function _Clone() { var pub = {};

  pub.cloneProgram = function _cloneProgram(origProgram){
    function replacer(key, value) {
      // filtering out the blockly block, which we can recreate from the rest of the state
      if (key === "block") {
        return undefined;
      }
      return value;
    }
    var programAttributes = JSOG.parse(JSOG.stringify(origProgram, replacer)); // deepcopy
    var program = Revival.revive(programAttributes);  // copy all those fields back into a proper Program object
    return program;
  };

return pub; }());

var ServerTranslationUtilities = (function _ServerTranslationUtilities() { var pub = {};

  // for when we want to send a relation object to the server
  pub.JSONifyRelation = function _JSONifyRelation(origRelation){
    if (origRelation instanceof WebAutomationLanguage.Relation){
      // ok, first let's get the nice dictionary-looking version that we use for passing relations around, instead of our internal object representation that we use in the mainpanel/program
      var relationDict = origRelation.messageRelationRepresentation();
      // let's start by deep copying so that we can JSONify the selector, next_button_selector, and column suffixes without messing up the real object
      relation = JSON.parse(JSON.stringify(relationDict)); // deepcopy
      // now that it's deep copied, we can safely strip out jsog stuff that we don't want in there, since it will
      // interfere with our canonicalization process
      MiscUtilities.removeAttributeRecursive(relation, "__jsogObjectId");
      relation.selector = StableStringify.stringify(relation.selector);
      relation.next_button_selector = StableStringify.stringify(relation.next_button_selector);
      for (var k = 0; k < relation.columns.length; k++){
        relation.columns[k].suffix = StableStringify.stringify(relation.columns[k].suffix); // is this the best place to deal with going between our object attributes and the server strings?
      }
      WALconsole.log("relation after jsonification", relation);
      return relation;
    }
    else if (origRelation instanceof WebAutomationLanguage.TextRelation){
      var stringifiedTextRelation = JSON.stringify(origRelation.relation);
      return stringifiedTextRelation;
    }
  };

  // for when we get a relation back from the server
  pub.unJSONifyRelation = function _unJSONifyRelation(relationDict){
    // let's leave the original dictionary with it's JSONified attributes alone by deepcopying first
    relation = JSON.parse(JSON.stringify(relationDict)); // deepcopy
    relation.selector = JSON.parse(relation.selector);
    if (relation.next_button_selector){
      relation.next_button_selector = JSON.parse(relation.next_button_selector);
    }
    else{
      relation.next_button_selector = null;
    }
    for (var k = 0; k < relation.columns.length; k++){
      relation.columns[k].suffix = JSON.parse(relation.columns[k].suffix); // is this the best place to deal with going between our object attributes and the server strings?
    }
    return relation;
  };

  pub.JSONifyProgram = function _JSONifyProgram(origProgram){
    // let's start by deep copying so that we can delete stuff and mess around without messing up the real object
    var program = Clone.cloneProgram(origProgram);
    // relations aren't part of a JSONified program, because this is just the string part that will be going into a single db column
    // we want interesting info like what relations it uses to be stored in a structured way so we can reason about it, do interesting stuff with it
    // so blank out relations

    // for now, even though we are separately saving proper representations of the relations involved
    // let's also save these relation associated with the current prog, so user doesn't get any surprises
    // can later allow them to update from server if it's failing...
    /*
    program.traverse(function(statement){
      if (statement instanceof WebAutomationLanguage.LoopStatement){
        WALconsole.log(program.relations.indexOf(statement.relation));
        statement.relation = program.relations.indexOf(statement.relation); // note this means we must have the relations in same order from server that we have them here
      }
    });
    delete program.relations;
    */
    return JSOG.stringify(program);
  };

  pub.unJSONifyProgram = function _unJSONifyProgram(stringifiedProg){
    var programAttributes = JSOG.parse(stringifiedProg);
    var program = Revival.revive(programAttributes); // copy all those fields back into a proper Program object
    return program;
  };

return pub; }());

const MiscUtilities = (function _MiscUtilities() { var pub = {};

  pub.scrapeConditionString = "<kbd>ALT</kbd> + click";
  pub.scrapeConditionLinkString = "<kbd>ALT</kbd> + <kbd>SHIFT</kbd> + click";
  var osString = window.navigator.platform;
  if (osString.indexOf("Linux") > -1){
    // there's a weird thing where just ALT + click doesn't raise events in Linux Chrome
    // pressing CTRL at the same time causes the events to be raised without (at the moment, apparently) messing up other stuff
    pub.scrapeConditionString = "<kbd>ALT</kbd> + <kbd>CTRL</kbd> + click";
    pub.scrapeConditionLinkString = "<kbd>ALT</kbd> + <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + click";
  }

  // this is silly, but it does seem the easiest way to deal with this
  pub.useCorrectScrapingConditionStrings = function _useCorrectScrapingConditionStrings(selectorstring, normalScrapeStringToReplace, linkScrapeStringToReplace){
    $(selectorstring).html($(selectorstring).html().replace(new RegExp(normalScrapeStringToReplace,"g"), pub.scrapeConditionString));
    $(selectorstring).html($(selectorstring).html().replace(new RegExp(linkScrapeStringToReplace,"g"), pub.scrapeConditionLinkString));
  }

  pub.sendAndReSendInternals = function _sendAndReSendInternals(func, url, msg, successHandler, showThatWereWaiting=true, extraText=""){
    // only ever call this from the mainpanel!  otherwise we might disturb the dom structure of content pages.
    // alternatively, pass in false for showThatWereWaiting if you really need this from a content script
    var currentWait = 5000;
    console.log("waiting for request", url);

    var successHandlerWrapped = successHandler;
    if (showThatWereWaiting){
      var waitingForServerAlert = $("<div class='waiting_for_server'><img style='margin-right:7px' src='../icons/ajax-loader2.gif' height='10px'><span id='extra'></span>Waiting for the server"+extraText+"...</div>");
      $("body").append(waitingForServerAlert);
      var successHandlerWrapped = function(param){
        waitingForServerAlert.remove();
        successHandler(param);
      }
    }
    var sendHelper = function _sendHelper(){
      func(url, 
        msg, 
        successHandlerWrapped).fail(function(jqxhr, settings, ex){
          console.log(jqxhr, settings, ex);
          setTimeout(function(){sendHelper(msg);}, currentWait); // if we failed, need to be sure to send again...
          currentWait = currentWait * 2; // doing a little bit of backoff, but should probably do this in a cleaner way
          if (showThatWereWaiting){
            // this was a failure, so say we're trying again
            waitingForServerAlert.find("#extra").html("Trying again.  Is the server down?  Is your Internet connection slow?  ");
            var additional = $("<div>"+settings+"</div>");
            waitingForServerAlert.append(additional);
            setTimeout(function(){additional.remove()}, 10000);
          }
        });
    };
    sendHelper(msg);
  }

  pub.getAndReGetOnFailure = function _getAndReGetOnFailure(url, msg, successHandler, showThatWereWaiting=true, extraText=""){
    pub.sendAndReSendInternals($.get, url, msg, successHandler, showThatWereWaiting, extraText);
  }

  pub.postAndRePostOnFailure = function _postAndRePostOnFailure(url, msg, successHandler, showThatWereWaiting=true, extraText=""){
    pub.sendAndReSendInternals($.post, url, msg, successHandler, showThatWereWaiting, extraText);
  };

  pub.makeNewRecordReplayWindow = function _makeNewRecordReplayWindow(cont, specifiedUrl=false, winWidth=false, winHeight=false){
    chrome.windows.getCurrent(function (currWindowInfo){
      var right = currWindowInfo.left + currWindowInfo.width;
      var width = null;
      var height = null;
      chrome.system.display.getInfo(function(displayInfoLs){
        for (var i = 0; i < displayInfoLs.length; i++){
          var bounds = displayInfoLs[i].bounds;
          bounds.right = bounds.left + bounds.width;
          WALconsole.log(bounds);
          if (bounds.left <= right && bounds.right >= right){
            // we've found the right display
            var top = currWindowInfo.top - 40; // - 40 because it doesn't seem to count the menu bar and I'm not looking for a more accurate solution at the moment
            var left = right; // let's have it adjacent to the control panel
            console.log(bounds.right - right, bounds.top + bounds.height - top);
            if (!winWidth || !winHeight){
              width = bounds.right - right;
              height = bounds.top + bounds.height - top;
            }
            else{
              width = winWidth;
              height = winHeight;
            }

            // for now let's actually make width and height fixed for stability across different ways of running (diff machines, diff panel sizes at start)
            // 1419 1185
           //var width = 1419;
           //var height = 1185;
            var url = specifiedUrl;
            if (!url || ((typeof url) !== "string")){
              url = "pages/newRecordingWindow.html"
            }
            chrome.windows.create({url: url, focused: true, left: left, top: top, width: width, height: height}, function(win){
              WALconsole.log("new record/replay window created.");
              //pub.sendCurrentRecordingWindow(); // todo: should probably still send this for some cases
              cont(win.id);
            });
          }
        }
      });
    });
  };

  pub.currentDateString = function _currentDateString(){
    return pub.basicDateString(new Date());
  };

  pub.basicDateString = function _basicDateString(d){
    return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getHours() + ":" + d.getMinutes();
  };

  pub.toBlocklyBoolString = function _toBlocklyBoolString(bool){
    if (bool){
      return 'TRUE';
    }
    return 'FALSE';
  };

  pub.levenshteinDistance = function _levenshteinDistance(a, b) {
    if(a.length === 0) return b.length; 
    if(b.length === 0) return a.length; 

    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) === a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }

    return matrix[b.length][a.length];
  };

  pub.targetFromEvent = function _targetFromEvent(event){
    return event.target; // this used to be fancier.  unclear if this will always be necessary
  }

  pub.depthOf = function _depthOf(object) {
    var level = 1;
    var key;
    for(key in object) {
        if (!object.hasOwnProperty(key)) continue;

        if(typeof object[key] == 'object'){
            var depth = pub.depthOf(object[key]) + 1;
            level = Math.max(depth, level);
        }
    }
    return level;
  }

  // note that this does not handle cyclic objects!
  pub.removeAttributeRecursive = function _removeAttributeRecursive(obj, attribute){
    if (typeof obj !== "object" || obj === null){ 
      return; // nothing to do here
    }
    else{
      // ok, it's an object
      if (attribute in obj){
        // ok, we actually want to remove
        delete obj[attribute];
      }
      // time to descend
      for (var prop in obj){
        pub.removeAttributeRecursive(obj[prop], attribute);
      }
    }
  };

  pub.repeatUntil = function _repeatUntil(repeatFunction, untilFunction, afterFunction, interval, grow){
    if (grow === undefined){ grow = false;}
    if (untilFunction()){
      afterFunction();
      return;
    }
    repeatFunction();
    var nextInterval = interval;
    if (grow){
      nextInterval = nextInterval * 2; // is this really how we want to grow it?  should it be a strategy passed in?
    }
    WALconsole.log("grow", grow);
    WALconsole.log("interval", nextInterval);
    setTimeout(function(){pub.repeatUntil(repeatFunction, untilFunction, afterFunction, nextInterval, grow);}, interval);
  };

  /* there are some messages that we send repeatedly from the mainpanel because we don't know whether the 
  content script has actually received them.  but for most of these, we don't actually want a dozen answers, 
  we just want to get one answer with the current, most up-to-date answer, and if we later decide we want 
  another, we'll send another later.  for these cases, rather than build up an enormous backlog of messages 
  (and it can get enormous and even crash everything), better to just register that we want the current 
  response, then let us send the one */
  // note that if we have *anything* changing about the message, this is currently a bad way to handle
  // so if we have something like a counter in the message telling how many times it's been sent, this approach won't help

  function sub(a, limit){
    if (a.length <= limit){
      return a;
    }
    return a.slice(0, limit);
  }

  var currentResponseRequested = {};
  var currentResponseHandler = {};

  function handleRegisterCurrentResponseRequested(message){
    var key = StableStringify.stringify(message);
    if (currentResponseRequested[key]){
      currentResponseRequested[key] = false;
      // now call the actual function
      currentResponseHandler[key](message);
      WALconsole.namedLog("getRelationItems","we successfully did handleRegisterCurrentResponseRequested for key", sub(key, 40));
    }
    else{
      WALconsole.namedLog("getRelationItems","we tried to do handleRegisterCurrentResponseRequested for key", sub(key, 40), "but there was nothing registered.  throwing it out.");
    }
    // else nothing to do.  yay!
  };

  pub.registerCurrentResponseRequested = function _registerCurrentResponseRequested(message, functionToHandleMessage){
    var key = StableStringify.stringify(message);
    WALconsole.namedLog("getRelationItems", "registering new handler for key", sub(key, 40));
    var newFunctionToHandleMessage = function(msg){
      WALconsole.namedLog("getRelationItems", "running the current handler for key:", sub(key, 40));
      functionToHandleMessage(msg);
    }
    currentResponseRequested[key] = true;
    currentResponseHandler[key] = newFunctionToHandleMessage;
    setTimeout(
      function(){handleRegisterCurrentResponseRequested(message);},
      0);
    // so it does get called immediately if there's no backup, but just goes in its place at the back of the queue 
    // if there is a backup right now, and then we can get a bunch of them backed up but we'll still 
    // only run it the first time.  must have a separate dictionary for the function, because you 
    // want to attach the current handler, not run an old handler.  For instance, we might send the same message to 
    // request a new fresh set of relation items, but have a different mainpanel response handler, and we want to 
    // send it to the current handler, not the old one.

    // basically what's happening is this function (registerCurrentResponseRequested) updates the handler
    // but then we push any requests to actually run that handler into the queue, and then we'll only run
    // one of those requests (a handleRegisterCurrentResponseRequested call), and we'll ignore later ones
    // unless we get another of the same message (same input to registerCurrentResponseRquested), 
    // which prompts us to do the process over again
  };

  // for now, if there's no favicon url and if the title of the page is actually just a segment of the url, go ahead and assume it didn't manage to load
  pub.looksLikeLoadingFailure = function _looksLikeLoadingFailure(tabInfo){
    if (!tabInfo.favIconUrl && tabInfo.url.indexOf(tabInfo.title) > -1){
      return true;
    }
    return false;
  };

  pub.truncateDictionaryStrings = function _truncateDictionaryStrings(dict, stringLengthLimit, keysToSkip){
    for (var key in dict){
      var val = dict[key];
      if (keysToSkip.indexOf(key) < 0 && typeof val === 'string' && val.length > stringLengthLimit){
        dict[key] = val.slice(0, stringLengthLimit);
      }
    }
  };

  pub.dirtyDeepcopy = function _dirtyDeepcopy(obj){
    return JSON.parse(JSON.stringify(obj));
  };

return pub; }());


var Highlight = (function _Highlight() { var pub = {};

  var highlightCount = 0;
  var highlights = [];
  pub.highlightNode = function _highlightNode(target, color, display, pointerEvents) {
    if (!target){
      WALconsole.log("Woah woah woah, why were you trying to highlight a null or undefined thing?");
      return $('<div/>');
    }
    if (display === undefined){ display = true;}
    if (pointerEvents === undefined){ pointerEvents = false;}
    highlightCount +=1;
    $target = $(target);
    var offset = $target.offset();
    if (!target.getBoundingClientRect){
      // document sometimes gets hovered, and there's no getboundingclientrect for it
      return;
    }
    var boundingBox = target.getBoundingClientRect();
    var newDiv = $('<div/>');
    var idName = 'vpbd-hightlight-' + highlightCount;
    newDiv.attr('id', idName);
    newDiv.css('width', boundingBox.width);
    newDiv.css('height', boundingBox.height);
    newDiv.css('top', offset.top);
    newDiv.css('left', offset.left);
    newDiv.css('position', 'absolute');
    newDiv.css('z-index', 2147483640);
    newDiv.css('background-color', color);
    newDiv.css('opacity', .4);
    if (display === false){
      newDiv.css('display', 'none');
    }
    if (pointerEvents === false){
      newDiv.css('pointer-events', 'none');
    }
    $(document.body).append(newDiv);
    highlights.push(newDiv);
    newDiv.highlightedNode = target;
    return newDiv;
  };

  pub.isHighlight = function _isHighlight(node){
    var id = $(node).attr("id");
    return (id !== null && id !== undefined && id.indexOf("vpbd-hightlight") > -1);
  };

  pub.getHighligthedNodeFromHighlightNode = function _getHighligthedNodeFromHighlightNode(highlightNode){
    return highlightNode.highlightedNode;
  }

  pub.clearHighlight = function _clearHighlight(highlightNode){
    if (!highlightNode){
      return;
    }
    highlights = _.without(highlights, highlightNode);
    highlightNode.remove();
  }

  pub.clearAllHighlights = function _clearAllHighlights(){
    _.each(highlights, function(highlight){highlight.remove()});
    highlights = [];
  }

return pub; }());

var NextTypes = {
  NONE: 1,
  NEXTBUTTON: 2,
  MOREBUTTON: 3,
  SCROLLFORMORE: 4
};

var RelationItemsOutputs = {
  NOMOREITEMS: 1,
  NONEWITEMSYET: 2,
  NEWITEMS: 3
};

var TraceManipulationUtilities = (function _TraceManipulationUtilities() { var pub = {};

  pub.completedEventType = function _completedEventType(ev){
            return ((ev.type === "completed" && ev.data.type === "main_frame")
              ||
              (ev.type === "webnavigation" && ev.data.type === "onCompleted" && ev.data.parentFrameId === -1));
          };

  pub.lastTopLevelCompletedEvent = function _lastTopLevelCompletedEvent(trace){
    for (var i = trace.length - 1; i >= 0; i--){
      var ev = trace[i];
      if (pub.completedEventType(ev)){
        return ev;
      }
    }
    return null; // bad!
  }

  pub.tabId = function _tabId(ev){
    return ev.data.tabId;
  };
  pub.frameId = function _frameId(ev){
    return ev.data.frameId;
  };

  pub.lastTopLevelCompletedEventTabId = function _lastTopLevelCompletedEventTabId(trace){
    var ev = pub.lastTopLevelCompletedEvent(trace);
    return ev.data.tabId;
  }

  pub.tabsInTrace = function _tabsInTrace(trace){
    var tabs = [];
    for (var i = 0; i < trace.length; i++){
      var ev = trace[i];
      if (pub.completedEventType(ev)){
        if (tabs.indexOf(ev.data.tabId) === -1){
          tabs.push(ev.data.tabId);
        }
      }
    }
    return tabs;
  }

return pub; }());

/* https://github.com/javascript/sorted-array/blob/master/sorted-array.js */
var SortedArray = (function () {
    var SortedArray = defclass({
        constructor: function (array, compare) {
            this.array   = [];
            this.compare = compare || compareDefault;
            var length   = array.length;
            var index    = 0;

            while (index < length) this.insert(array[index++]);
        },
        insert: function (element) {
            var array   = this.array;
            var compare = this.compare;
            var index   = array.length;

            array.push(element);

            while (index > 0) {
                var i = index, j = --index;

                if (compare(array[i], array[j]) < 0) {
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

            return this;
        },
        search: function (element) {
            var array   = this.array;
            var compare = this.compare;
            var high    = array.length;
            var low     = 0;

            while (high > low) {
                var index    = (high + low) / 2 >>> 0;
                var ordering = compare(array[index], element);

                     if (ordering < 0) low  = index + 1;
                else if (ordering > 0) high = index;
                else return index;
            }

            return -1;
        },
        remove: function (element) {
            var index = this.search(element);
            if (index >= 0) this.array.splice(index, 1);
            return this;
        },
        get: function(i) {
          WALconsole.log("index:", i);
          return this.array[i];
        },
        length: function() {
          return this.array.length;
        }
    });

    SortedArray.comparing = function (property, array) {
        return new SortedArray(array, function (a, b) {
            return compareDefault(property(a), property(b));
        });
    };

    return SortedArray;

    function defclass(prototype) {
        var constructor = prototype.constructor;
        constructor.prototype = prototype;
        return constructor;
    }

    function compareDefault(a, b) {
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }
}());


var XMLBuilder = (function _XMLBuilder() { var pub = {};

  pub.newNode = function _newNode(name, options, content){
    if (content === null || content === undefined){
      console.log("no content, returning");
      return ""; // assuming we don't actually want this?
    }
    var optionsStrs = [];
    if ("type" in options){
      // we have to do type first, if it's in here
      optionsStrs.push("type=\""+options["type"]+"\"");
    }
    for (var prop in options){
      if (prop === "type"){
        continue;
      }
      optionsStrs.push(prop + "=\"" + options[prop] + "\"");
    }
    var optionsStr = optionsStrs.join(" ");
    return "<" + name + " " + optionsStr + ">" + content + "</" + name + ">";
  }

return pub; }());

var DefaultHelenaValues = (function _DefaultHelenaValues() { var pub = {};

  pub.nextButtonAttemptsThreshold = 4;
  pub.relationFindingTimeoutThreshold = 15000;
  pub.relationScrapeWait = 1000;

return pub; }());

var DownloadUtilities = (function _DownloadUtilities() { var pub = {};

  pub.download = function _download(filename, text) {
    var element = document.createElement('a');
    //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('href', URL.createObjectURL(new Blob([text], {
                  type: "application/octet-stream"})));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

return pub; }());




/***/ }),

/***/ "./src/content/recording_UI.js":
/*!*************************************!*\
  !*** ./src/content/recording_UI.js ***!
  \*************************************/
/*! exports provided: RecordingHandlers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RecordingHandlers", function() { return RecordingHandlers; });
/**********************************************************************
 * Author: S. Chasins
 **********************************************************************/

 

/**********************************************************************
 * User event handlers
 **********************************************************************/

const RecordingHandlers = (function _RecordingHandlers() { var pub = {};
  
  // listening for context menu events allows us to prevent the right click menu from appearing during recording
  // which is important since interactions with the context menu won't be recorded and thus Helena won't be able
  // to replay them and the resulting script will fail without giving the user any information abtout the cause
  pub.contextmenuHandler = function _contextmenuHandler(event){
    if (currentlyRecording()){
      // prevents right click from working
      event.preventDefault();
      if (navigator.appVersion.toLocaleLowerCase().indexOf("win") !== -1) {
        alert("Trying to open a new tab? Try CTRL+click instead!");
      } else if (navigator.appVersion.toLocaleLowerCase().indexOf("mac") !== -1) {
        alert("Trying to open a new tab? Try CMD+click instead!");
      } else { // linux or unix, depends on computer 
        alert("Trying to open a new tab? Use a keyboard shortcut (like CTRL+click) instead!");
      }
    }
  }

  pub.mouseoverHandler = function _mouseoverHandler(event){
    if (currentlyRecording()){
      Tooltip.scrapingTooltip(MiscUtilities.targetFromEvent(event));
      RelationPreview.relationHighlight(MiscUtilities.targetFromEvent(event));
    }
    // just a backup in case the checks on keydown and keyup fail to run, as seems to happen sometimes with focus issues
    pub.updateScraping(event);
    if (currentlyScraping() && currentlyRecording()){
      Scraping.scrapingMousein(event);
    }
  }

  pub.mouseoutHandler = function _mouseoutHandler(event){
    if (currentlyRecording()){
      Tooltip.removeScrapingTooltip(MiscUtilities.targetFromEvent(event));
      RelationPreview.relationUnhighlight();
    }
    // just a backup in case the checks on keydown and keyup fail to run, as seems to happen sometimes with focus issues
    pub.updateScraping(event);
    if (currentlyScraping() && currentlyRecording()){
      Scraping.scrapingMousein(event);
    }
  }

  // scraping is happening if ctrl and c are held down
  var ctrlDown = false;
  var altDown = false;

  pub.updateScraping = function _updateScraping(event){
    pub.updateScrapingTrackingVars(event);
    pub.checkScrapingOn();
    pub.checkScrapingOff();
  };

  pub.updateScrapingTrackingVars = function _updateScrapingTrackingVars(event){
    if (event.ctrlKey){
      ctrlDown = true;
    }
    else{
      ctrlDown = false;
    }

    if (event.altKey){
      altDown = true;
    }
    else{
      altDown = false;
    }
  };

  pub.checkScrapingOn = function _checkScrapingOn(){
    if (!currentlyScraping() && (altDown)){
      Scraping.startProcessingScrape();
    }
  };

  pub.checkScrapingOff = function _checkScrapingOff(){
    if (currentlyScraping() && currentlyRecording() && !(altDown)){
      Scraping.stopProcessingScrape();
    }
  };

  function addOverlayDiv(observer){
      var overlay = $("<div id='helena_overlay' style='position: fixed; width: 100%; height: 100%; \
                                    top: 0; left: 0; right: 0; bottom: 0; \
                                    background-color: rgba(0,0,0,0); \
                                    z-index: 2147483647; cursor: pointer;'></div>");
      var messageDiv = $("<div style='background-color: rgba(0,255,0,0.85); padding: 10px;'>\
        <div style='font-size:20px'>This page is being controlled by Helena.</div>\
        If you want to interact with this page anyway, click here to remove the overlay.  Keep in mind that navigating away from the current page may disrupt the Helena process.\
        </div>");
      overlay.append(messageDiv);

      // if the user clicks on the box with the warning, go ahead and remove the whole overlay
      // but stop the observer first, becuase we don't want to add it again because of the user's click and resultant removal
      messageDiv.click(function(){
        observer.disconnect();
        overlay.remove();
      });

      $("body").append(overlay);
  }

  var addedOverlay = false;
  pub.applyReplayOverlayIfAppropriate = function _applyReplayOverlayIfAppropriate(replayWindowId){
    // only apply it if we're in the replay window, if we haven't already applied it, and if we're the top-level frame
    WALconsole.namedLog("tooCommon", "applyReplayOverlayIfAppropriate", replayWindowId, windowId, addedOverlay);
    if (replayWindowId === windowId && !addedOverlay && self === top){
      // ok, we're a page in the current replay window.  put in an overlay

      // and remember, don't add the overlay again in future
      addedOverlay = true;

      // ok, now one weird thing about this is this alters the structure of the page if other nodes are added later
      // which can prevent us from finding things like, say, relations.  so we have to make sure to put it back at the
      // end of the body nodes list whenever new stuff gets added
      // select the target node
      var target = document.querySelector('body');
      // create an observer instance
      // configuration of the observer:
      var config = { childList: true }
      var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) { 
              // stop observing while we edit it ourself
              console.log("paused observing");
              observer.disconnect();
              $("#helena_overlay").remove();
              addOverlayDiv(observer);
              // and start again
              observer.observe(target, config);
          });
      });
      // pass in the target node, as well as the observer options
      observer.observe(target, config);

      // now actually add the overlay
      addOverlayDiv(observer);
    }
  };

return pub;}());

document.addEventListener('contextmenu', RecordingHandlers.contextmenuHandler, true);
document.addEventListener('mouseover', RecordingHandlers.mouseoverHandler, true);
document.addEventListener('mouseout', RecordingHandlers.mouseoutHandler, true);
document.addEventListener('keydown', RecordingHandlers.updateScraping, true);
document.addEventListener('keyup', RecordingHandlers.updateScraping, true);

/**********************************************************************
 * For getting current status
 **********************************************************************/

function currentlyRecording(){
  return recording === RecordState.RECORDING && currentRecordingWindows.indexOf(windowId) > -1; // recording variable is defined in scripts/lib/record-replay/content_script.js, tells whether r+r layer currently recording
}

function currentlyScraping(){
  return additional_recording_handlers_on.scrape;
}

/**********************************************************************
 * Tooltips, for giving user feedback about current node
 **********************************************************************/

var Tooltip = (function _Tooltip() { var pub = {};
  var tooltipColorDefault = "rgba(255, 255, 255, 0.9)";
  var tooltipBorderColorDefault = "#B0B0B0";
  pub.scrapingTooltip = function _scrapingTooltip(node, tooltipColor, tooltipBorderColor){
    if(tooltipColor === undefined) { tooltipColor = tooltipColorDefault;}
    if(tooltipBorderColor === undefined) { tooltipBorderColor = tooltipBorderColorDefault;}
    var $node = $(node);
    // var nodeText = MiscUtilities.scrapeConditionString+" to scrape:<br>"+NodeRep.nodeToText(node)+"<br>"+MiscUtilities.scrapeConditionLinkString+" to scrape:<br>"+NodeRep.nodeToLink(node);
    var nodeText = NodeRep.nodeToText(node);
    if (nodeText){
      nodeText = nodeText.replace(/\n/g, "<br>");
      if (nodeText.length > 400){
        nodeText = nodeText.slice(0,200)+"..."+nodeText.slice(nodeText.length - 200, nodeText.length);
      }
    }
    var offset = $node.offset();
    var boundingBox = node.getBoundingClientRect();
    var newDiv = $('<div>'+nodeText+'<div/>');
    var width = boundingBox.width;
    var threshold = 150;
    if (width < threshold){width = threshold;}

    newDiv.attr('id', 'vpbd-hightlight');
    // newDiv.css('min-width', width);
    // newDiv.css('width', 'auto');
    newDiv.css('width', width);
    newDiv.css('top', offset.top+boundingBox.height);
    newDiv.css('left', offset.left);
    newDiv.css('position', 'absolute');
    newDiv.css('z-index', 2147483647);
    newDiv.css('background-color', tooltipColor);
    newDiv.css('box-shadow', '0px 0px 5px grey');
    newDiv.css('padding', '3px');
    newDiv.css('overflow', 'hidden');
    newDiv.css('overflow-wrap', 'break-word');
    $(document.body).append(newDiv);
    node.scrapingTooltip = newDiv;
  }

  pub.removeScrapingTooltip = function _removeScrapingTooltip(node){
    node.scrapingTooltip.remove();
  }
return pub;}());

/**********************************************************************
 * Handle scraping interaction
 **********************************************************************/

var Scraping = (function _Scraping() { var pub = {};

  // note that this line must run after the r+r content script runs (to produce the additional_recording_handlers object)
  additional_recording_handlers.scrape = function(node, eventMessage){
    var data = NodeRep.nodeToMainpanelNodeRepresentation(node,false);
    var linkScraping = eventMessage.data.shiftKey || eventMessage.data.metaKey; // convention is SHIFT means we want to scrape the link, not the text 
    data.linkScraping = linkScraping;
    if (eventMessage.data.type === "click") {
      utilities.sendMessage("content", "mainpanel", "scrapedData", data);
    } // send it to the mainpanel for visualization
    return data;
  };

  // Chrome on Windows records "hold down" a key differently (repeated events) than 
  // Chrome on MacOS (one event). This filters out extra ctrl and alt key events from
  // being recorded
  additional_recording_filters.scrape = function(eventData){
    // key code 18: alt; key code 17: ctrl
    if ((eventData.keyCode === 18 || eventData.keyCode === 17) && (eventData.type === "keypress" || eventData.type === "keydown")){
      // we're going to see a ton of these because holding ctrl/alt for scraping mode makes them.  we're going to ignore, although this could cause problems for some interactions
      return true;
    } else {
      return false;
    }

    /*
    if (eventData.keyCode === 66 && (eventData.type === "keypress" || eventData.type === "keydown")){
      // we're going to see a ton of these because holding c for scraping mode makes them.  we're going to ignore, although this could cause problems for some interactions
      return true;
    }
    return false;
    */
    /*
    if (eventData.type === "click"){
      return false; // this is a scraping event, so want to keep it; don't filter
    }
    else if (eventData.keyCode === 18){
      return false; // 18 is alt.  need to listen to this so we can have that turned on for link scraping
    } 
    else if (eventData.type === "keyup"){
      return false; // keyup events can end our scraping mode, so keep those
    }
    return true; // filter everything else
    */
    /*
    else if (eventData.keyCode === "c" && eventData.type !== "keyup") { // c is the special case because this is the one we're pressing down so we'll get a ton if we're not careful
      return true; // true says to drop the event.  c is the one we want to get rid of, unless it's 
    }
    return false;
    */
  }

  let currKeyState = {}; // keeps track of the keys that are currently being pressed down

  // Because Windows has this habit of producing multiple keypress, keydown events 
  // for a continued key press, we want to throw out events that are repeats of events
  // we've already seen. This change fixes a major issue with running Helena
  // on Windows, in that the top-level tool chooses to ignore events that can be
  // accomplished without running Ringer (e.g. scraping relation items), but keydown
  // events can only be accomplished by Ringer.  So replay gets slow because of having to
  // replay all the Ringer events for each row of the relation.
  // note: if we run into issues where holding a key down in a recording produces a bad replay,
  // look here first
  additional_recording_filters.ignoreExtraKeydowns = function(eventData){
    if (eventData.type === "keypress" || eventData.type === "keydown") { // for now, we'll ignore multiple keypresses for all keys (not just ctrl and alt)
      if (!currKeyState[eventData.keyCode]) { // first seen, record that it's being pressed down
        currKeyState[eventData.keyCode] = true;
        return false;
      } else { // not first seen, ignore
        return true;
      }
    } else if (eventData.type === "keyup") { // key is no longer being pressed, no longer need to keep track of it
      currKeyState[eventData.keyCode] = false;
      return false;
    }
    return false;
  }
  additional_recording_filters_on.ignoreExtraKeydowns = true; // we always want this filter to be on when recording

  // must keep track of current hovered node so we can highlight it when the user enters scraping mode
  var mostRecentMousemoveTarget = null;
  document.addEventListener('mousemove', updateMousemoveTarget, true);
  function updateMousemoveTarget(event){
    mostRecentMousemoveTarget = event.target;
  }

  // functions for letting the record and replay layer know whether to run the additional handler above
  var currentHighlightNode = null
  pub.startProcessingScrape = function _startProcessingScrape(){
    additional_recording_handlers_on.scrape = true;
    additional_recording_filters_on.scrape = true;
    if (!currentlyRecording()){
      // don't want to run this visualization stuff if we're in replay mode rather than recording mode, even though of course we're recording during replay
      return;
    }
    currentHighlightNode = Highlight.highlightNode(mostRecentMousemoveTarget, "#E04343", true, false); // want highlight shown now, want clicks to fall through
  }

  pub.stopProcessingScrape = function _stopProcessingScrape(){
    additional_recording_handlers_on.scrape = false;
    additional_recording_filters_on.scrape = false;
    Highlight.clearHighlight(currentHighlightNode);
  }

  pub.scrapingMousein = function _scrapingMousein(event){
    if (!currentlyRecording()){
      // don't want to run this visualization stuff if we're in replay mode rather than recording mode, even though of course we're recording during replay
      return;
    }
    Highlight.clearHighlight(currentHighlightNode);
    currentHighlightNode = Highlight.highlightNode(MiscUtilities.targetFromEvent(event), "#E04343", true, false);
  };

  pub.scrapingMouseout = function _scrapingMouseout(event){
    if (!currentlyRecording()){
      // don't want to run this visualization stuff if we're in replay mode rather than recording mode, even though of course we're recording during replay
      return;
    }
    Highlight.clearHighlight(currentHighlightNode);
  };

  // clicks during scraping mode are special.  don't want to follow links for example
  document.addEventListener('click', scrapingClick, true);
  function scrapingClick(event){
    if (currentlyScraping()){
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  pub.scrapingCriteria = function _scrapingCriteria(event){
    return event.shiftKey && event.altKey; // convention is we need shift+alt+click to scrape
  }
return pub;}());

/**********************************************************************
 * For visualization purposes, it is useful for us if we can get 'snapshots' of the nodes with which we interact
 **********************************************************************/

var Visualization = (function _Visualization() { var pub = {};
  $(function(){
    additional_recording_handlers.visualization = function(node, eventMessage){
      if (!currentlyRecording()){
        // don't want to run this visualization stuff if we're in replay mode rather than recording mode, even though of course we're recording during replay
        return;
      }
      if (eventMessage instanceof KeyboardEvent){
        // ignore below.  this was when we were also checking if there was no node.value;  but in general we're having issues with trying to screenshot things for keyboard events when we really shouldn't so for now changing presentation so that there is no 'target node' for typing in the user-facing representation of the script
        // for now we're using this to determine whether the user is actually typing text into a particular node or not.  since no node.value, probably not, and we are likely to be 'focus'ed on something big, so don't want to freeze the page by screenshoting
        // this is a weird case to include, but practical.  we'll still raise the events on the right nodes, but it will be easier for the user to interact with the recording phase if we don't show the node
        // may want to send a different message in future
        // updateExistingEvent(eventMessage, "additional.visualization", "whole page");
        return "whole page";
      }
      if (node.html2canvasDataUrl){
        // yay, we've already done the 'screenshot', need not do it again
        // updateExistingEvent(eventMessage, "additional.visualization", node.html2canvasDataUrl);
        return node.html2canvasDataUrl;
      }
      if (node.waitingForRender){
        setTimeout(function(){additional_recording_handlers.visualization(node, eventMessage);}, 100);
        return;
      }
      if (node === document.body){
        // never want to screenshot the whole page...can really freeze the page, and we have an easier way to refer to it
        // updateExistingEvent(eventMessage, "additional.visualization", "whole page");
        return "whole page";
      }
      // ok, looks like this is actually the first time seeing this, better actually canvasize it
      node.waitingForRender = true;
      // WALconsole.log("going to render: ", node);
      html2canvas(node, {
        onrendered: function(canvas) { 
          canvas = identifyTransparentEdges(canvas);
          var dataUrl = canvas.toDataURL();
          node.html2canvasDataUrl = dataUrl;
          updateExistingEvent(eventMessage, "additional.visualization", dataUrl);
        }
      });
      return null;
    };
  additional_recording_handlers_on.visualization = true;
  }); //run once page loaded, because else runs before r+r content script

  function identifyTransparentEdges(canvas){
    var context = canvas.getContext("2d");
    var imgData = context.getImageData(0,0,canvas.width,canvas.height);
    var data = imgData.data;

    // what rows and columns are empty?

    var columnsEmpty = [];
    for (var i = 0; i < canvas.width; i++){
      columnsEmpty.push(true);
    }
    var rowsEmpty = [];
    for (var i = 0; i < canvas.height; i++){
      rowsEmpty.push(true);
    }

    for(var i=0; i<data.length; i+=4) {
      var currX = (i / 4) % canvas.width,
        currY = ((i / 4) - currX) / canvas.width;
      var alpha = data[i+3];
      if (alpha > 0){
        columnsEmpty[currX] = false;
        rowsEmpty[currY] = false;
      }
    }

    // how far should we crop?

    var left = 0;
    var i = left;
    while (columnsEmpty[i]){
      left = i;
      i += 1;
    }

    var right = canvas.width - 1;
    var i = right;
    while (columnsEmpty[i]){
      right = i;
      i -= 1;
    }

    var top = 0;
    var i = top;
    while (rowsEmpty[i]){
      top = i;
      i += 1;
    }
    
    var bottom = canvas.height - 1;
    var i = bottom;
    while (rowsEmpty[i]){
      bottom = i;
      i -= 1;
    }

    if (left === 0 && right === (canvas.width - 1) && top === 0 && bottom === (canvas.height - 1)){
      // no need to do any cropping
      return canvas;
    }

    // use a temporary canvas to crop
    var tempCanvas = document.createElement("canvas"),
        tContext = tempCanvas.getContext("2d");
    tempCanvas.width = (right - left);
    tempCanvas.height = (bottom - top);
    tContext.drawImage(canvas, left, top, tempCanvas.width, tempCanvas.height, 0, 0, tempCanvas.width, tempCanvas.height);

    // WALconsole.log(canvas.width, canvas.height);
    // WALconsole.log(left, right, top, bottom);
    // WALconsole.log(tempCanvas.width, tempCanvas.height);

    return tempCanvas;
  }

return pub;}());

/**********************************************************************
 * We may want to give users previews of the relations we can find on their pages.  When hover, highlight.
 **********************************************************************/

var RelationPreview = (function _RelationPreview() { var pub = {};
  var knownRelations = [];
  function setup(){
    WALconsole.log("running setup");
    // have to use postForMe right now to make the extension do the acutal post request, because modern Chrome won't let us
    // requrest http content from https pages and we don't currently have ssl certificate for kaofang
    utilities.sendMessage("content", "background", "postForMe", {url: helenaServerUrl+'/allpagerelations', params: { url: window.location.href }});
    utilities.listenForMessageOnce("background", "content", "postForMe", function(resp){
      WALconsole.log(resp);
      knownRelations = resp.relations;
      preprocessKnownRelations();
    });
  }
  // we need to tell the record+replay layer what we want to do when a tab leanrs it's recording
  addonStartRecording.push(setup);

  var knownRelationsInfo = [];
  function preprocessKnownRelations(){
    // first let's apply each of our possible relations to see which nodes appear in them
    // then let's make a set of highlight nodes for each relation, so we can toggle them between hidden and displayed based on user's hover behavior.
    for (var i = 0; i < knownRelations.length; i++){
      var selectorObj = knownRelations[i];
      selectorObj = ServerTranslationUtilities.unJSONifyRelation(selectorObj);
      var relationOutput = RelationFinder.interpretRelationSelector(selectorObj);
      var nodeList = _.flatten(relationOutput);
      knownRelationsInfo.push({selectorObj: selectorObj, nodes: nodeList, relationOutput: relationOutput, highlighted: false});
    }  
  }

  pub.relationHighlight = function _relationHighlight(node){
    // for now we'll just pick whichever node includes the current node and has the largest number of nodes on the current page
    var winningRelation = null;
    var winningRelationSize = 0;
    for (var i = 0; i < knownRelationsInfo.length; i++){
      var relationInfo = knownRelationsInfo[i];
      if (relationInfo.nodes.indexOf(node) > -1){
        if (relationInfo.nodes.length > winningRelationSize){
          winningRelation = relationInfo;
          winningRelationSize = relationInfo.nodes.length;
        }
      }
    }
    if (winningRelation !== null){
      // cool, we have a relation to highlight
      winningRelation.highlighted = true;
      // important to make the highlight nodes now, since the nodes might be shifting around throughout interaction, especially if things still loading
      
      var currTime = new Date().getTime();
      var highlightNodes = null;
      if (winningRelation.highlightNodesTime && ((currTime - winningRelation.highlightNodesTime) < 2000)){
        // cache the highlight nodes for up to two second, then go ahead and recompute those positions
        highlightNodes = winningRelation.highlightNodes;
      }
      else{
        highlightNodes = RelationFinder.highlightRelation(winningRelation.relationOutput, false, false);
      }
      winningRelation.highlightNodes = highlightNodes;
      winningRelation.highlightNodesTime = new Date().getTime();
      for (var i = 0; i < highlightNodes.length; i++){
        var n = highlightNodes[i];
        n.css("display", "block");
      }
    }

  };

  pub.relationUnhighlight = function _relationUnhighlight(){
    for (var i = 0; i < knownRelationsInfo.length; i++){
      var relationInfo = knownRelationsInfo[i];
      if (relationInfo.highlighted){
        for (var j = 0; j < relationInfo.highlightNodes.length; j++){
          var node = relationInfo.highlightNodes[j];
          node.css("display", "none");
        }
      }
    }
  };

return pub;}());


/***/ }),

/***/ "./src/content/relation_finding.js":
/*!*****************************************!*\
  !*** ./src/content/relation_finding.js ***!
  \*****************************************/
/*! exports provided: RelationFinder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RelationFinder", function() { return RelationFinder; });
/**********************************************************************
 * Author: S. Chasins
 **********************************************************************/

 

const RelationFinder = (function _RelationFinder() { var pub = {};

  /**********************************************************************
   * Web-specific relation-finder code -- how to get features, how to tell when features match, how to combine features to get a more general feature, all candidates
   **********************************************************************/

  /* Available features:
   * tag
   * class
   * left, bottom, right, top
   * font-size, font-family, font-style, font-weight, color
   * background-color
   * xpath
   * Additional processing:
   * excludeFirst
   */

   var all_features = ["tag", "class", 
   "left", "bottom", "right", "top", "width", "height",
   "font-size", "font-family", "font-style", "font-weight", "color",
   "background-color", 
   "preceding-text", "text",
   "xpath"];

    var almost_all_features = _.without(all_features, "xpath");

   function getFeature(element, feature){
    if (feature === "xpath"){
      return XPathList.xPathToXPathList(nodeToXPath(element));
    }
    else if (feature === "preceding-text"){
      return $(element).prev().text();
    }
    else if (feature === "text"){
      return $(element).text();
    }
    else if (_.contains(["tag","class"],feature)){
      return element[feature+"Name"];
    }
    else if (_.contains(["top", "right", "bottom", "left", "width", "height"], feature)){
      var rect = element.getBoundingClientRect();
      return rect[feature];
    }
    else{
      var style = window.getComputedStyle(element, null);
      return style.getPropertyValue(feature);
    }
  }

  function featureMatch(feature, value, acceptable_values){
    if (feature === "xpath"){
      return _.reduce(acceptable_values, function(acc, av){ return (acc || (XPathList.xPathMatch(av, value))); }, false);
    }
    else if (feature === "class"){
      //class doesn't have to be same, just has to include the target class
      //TODO: Decide if that's really how we want it
      return _.reduce(acceptable_values, function(acc, av){ return (acc || (value.indexOf(av) > -1)); }, false);
    }
    else {
      return _.contains(acceptable_values,value);
    }
  }

  function collapseValues(feature, values){
    if (feature === "xpath"){
      return XPathList.xPathReduction(values);
    }
    return _.uniq(values);
  }

  function makeSubcomponentFunction(suffixes){
    var subcomponentFunction = function(candidateRowNodes){
      var candidate_subitems = [];
      var row_node_xpaths = _.map(candidateRowNodes, function(candidateRow){return XPathList.xPathToXPathList(nodeToXPath(candidateRow));});
      var null_subitems = 0;
      for (var j = 0; j < suffixes.length; j++){
        // note that suffixes[j] will be depth 2 if only one suffix available, depth 3 if list of suffixes available; todo: clean that up
        var suffixLs = suffixes[j];
        if (MiscUtilities.depthOf(suffixLs) < 3){ // <3 rather than === 2 because we use empty suffix for single-col datasets
          suffixLs = [suffixLs];
        }
        var foundSubItem = false;
        for (var k = 0; k < suffixLs.length; k++){
          var row_node_xpath = null;
          var suffixListRep = null;
          if (suffixLs[k].selectorIndex !== undefined){
            // great, we know exactly which of the candidate row nodes to use
            row_node_xpath = row_node_xpaths[suffixLs[k].selectorIndex];
            suffixListRep = suffixLs[k].suffixRepresentation;
          }
          else{
            // ok, so this suffix isn't one of our selectorIndex-labeled objects.  it's just the old array rep
            // so we better have only one selector and thus only one candidate row node
            row_node_xpath = row_node_xpaths[0];
            suffixListRep = suffixLs[k];
            if (candidateRowNodes.length > 1){
              WALconsole.warn("Woah, bad, we have no selector index associated with a column suffix, but we have multiple row nodes.");
            }
          }
          var xpath = row_node_xpath.concat(suffixListRep);
          var xpath_string = XPathList.xPathToString(xpath);
          var nodes = xPathToNodes(xpath_string);
          if (nodes.length > 0){
            candidate_subitems.push(nodes[0]);
            foundSubItem = true;
            break;
          }
        }
        if (!foundSubItem){
          // uh oh, none of the suffixes available to us were able to actually find a node
          null_subitems += 1;
          candidate_subitems.push(null);
        }
      }
      if (candidate_subitems.length > 0 && candidate_subitems.length > null_subitems){
        return candidate_subitems;
      }
      return null;
    };
    return subcomponentFunction;
  }

  function getAllCandidates(){
    return document.getElementsByTagName("*");
  }

  /**********************************************************************
   * Domain-independent function to go from a selector to a relation of elements
   **********************************************************************/

  // given a selector, what elements from the domain match the selector?
  // feature_dict is the primary part of our selector
  // exclude_first tells us whether to skip the first row, as we often do when we have headers
  // suffixes tell us how to find subcomponents of a row in the relation
  pub.interpretRelationSelectorHelper = function _interpretRelationSelectorHelper(feature_dict, exclude_first){
    // WALconsole.log("interpretRelationSelectorHelper", feature_dict, exclude_first, subcomponents_function);
    var candidates = getAllCandidates();
    var listOfRowNodes = [];
    for (var i=0;i<candidates.length;i++){
      var candidate = candidates[i];
      var candidate_ok = true;
      for (var feature in feature_dict){
        var value = getFeature(candidate,feature);
        var acceptable_values = feature_dict[feature].values;
        var pos = feature_dict[feature].pos;
        var candidate_feature_match = featureMatch(feature, value, acceptable_values);
        if ((pos && !candidate_feature_match) || (!pos && candidate_feature_match)){
          candidate_ok = false;
          break;
        }
      }
      if (candidate_ok){
        listOfRowNodes.push(candidate);
      }
    }
    if (exclude_first > 0 && listOfRowNodes.length > exclude_first){
      return listOfRowNodes.slice(exclude_first,listOfRowNodes.length);
    }
    WALconsole.log("listOfRowNodes", listOfRowNodes);
    return listOfRowNodes;
  };


  pub.interpretTableSelectorHelper = function _interpretTableSelectorHelper(featureDict, excludeFirst){
    // we don't use this for nested tables!  this is just for very simple tables, otherwise we'd graduate to the standard approach
    var nodes = xPathToNodes(featureDict.xpath);
    var table = null;
    if (nodes.length > 0){
      // awesome, we have something at the exact xpath
      table = $(nodes[0]);
    }
    else {
      // ok, I guess we'll have to see which table on the page is closest
      var tables = $("table");
      var bestTableScore = Number.POSITIVE_INFINITY;

      _.each(tables, function(t){
        var distance = MiscUtilities.levenshteinDistance(nodeToXPath(t), featureDict.xpath);
        if (distance < bestTableScore){
          bestTableScore = distance;
          table = $(t);
        }
      })
    }

    // ok, now we know which table to use

    if (table === null){
      return []; // todo: why is this arising?
    }

    var rows = table.find("tr");
    rows = rows.slice(excludeFirst, rows.length);
    return rows;
  };

  pub.interpretRelationSelectorRowNodes = function _interpretRelationSelectorRowNodes(selector){
    if (!selector.selector){
      return [];
    }

    if (selector.selector.constructor === Array){
      // the case where we need to recurse
      var selectorArray = selector.selector;
      var rowNodeLists = [];
      for (var i = 0; i < selectorArray.length; i++){
        var possibleSelector = selectorArray[i];
        selector.selector = possibleSelector;
        var newRowNodesLs = pub.interpretRelationSelectorRowNodes(selector);
        rowNodeLists = rowNodeLists.concat(newRowNodesLs);
      }
      selector.selector = selectorArray;
      return rowNodeLists;
    }

    WALconsole.log("interpretRelationSelector", selector);

    if (selector.selector.table === true){
      // let's go ahead and sidetrack off to the table extraction routine
      return [pub.interpretTableSelectorHelper(selector.selector, selector.exclude_first)];
    }
    // else the normal case with the normal extractor
    return [pub.interpretRelationSelectorHelper(selector.selector, selector.exclude_first)];
  };

  pub.interpretRelationSelectorCellNodes = function _interpretRelationSelectorCellNodes(selector, rowNodeLists){
    WALconsole.log("rowNodeLists", rowNodeLists);
    // now we'll use the columns info to actually get the cells
    var suffixes = _.pluck(selector.columns, "suffix");
    var subcomponentsFunction = makeSubcomponentFunction(suffixes);
    // in general, we pick selectors so that we'll only have two selectors at the same time if they actually have the same number of rows
    var counter = 0;
    var allCells = [];
    while (true){
      var rowNodes = [];
      var allNull = true;
      for (var i = 0; i < rowNodeLists.length; i++){
        if (rowNodeLists[i].length > counter){
          allNull = false;
          rowNodes.push(rowNodeLists[i][counter]);
        }
        else{
          rowNodes.push(null);
        }
      }
      if (allNull){
        // ok, all our lists of nodes have run out of nodes
        break;
      }
      // cool, we have a list or rowNodes that includes at least some nodes
      var thisRowCells = subcomponentsFunction(rowNodes);
      if (thisRowCells !== null){
        allCells.push(thisRowCells);
      }
      counter += 1;
    }
    return allCells;
  };

  pub.interpretPulldownSelector = function(selector){
    var allSelectNodes = $("select");
    // then just index into it, because our current approach to pulldowns is crazy simplistic
    var selectorNode = allSelectNodes[selector.index];
    console.log("selector: ", selector, selector.index, selectorNode);
    if ($(selectorNode).is(':enabled')){
      console.log("selector enabled");
      var optionNodes = extractOptionNodesFromSelectorNode(selectorNode);
      console.log("option nodes", optionNodes);
      return optionNodes;
    }
    console.log("selector not enabled");
    // else, we know which pulldown we want, but it's disabled right now.  let's wait
    return [];
  }

  function onlyDisplayedCellsAndRows(rows){
    var outputRows = [];
    for (var i = 0; i < rows.length; i++){
      var cells = rows[i];
      var allCellsInvisible = true;
      for (var j = 0; j < cells.length; j++){
        if ($(cells[j]).is(":visible")){
          allCellsInvisible = false;
        }
        else{
          // huh, it is invisible.  ok, null it out
          cells[j] = null;
        }
      }
      if (!allCellsInvisible){
        outputRows.push(cells);
      }
    }
    return outputRows;
  }

  pub.interpretRelationSelector = function _interpretRelationSelector(selector){
    if (selector.selector_version === 1 || selector.selector_version === undefined || selector.selector_version === null){ // should really get rid of undefined, probably...
      var rowNodeLists = pub.interpretRelationSelectorRowNodes(selector);
      WALconsole.log("rowNodeLists", rowNodeLists);
      // ok, now that we have some row nodes, time to extract the individual cells
      var cells = pub.interpretRelationSelectorCellNodes(selector, rowNodeLists);
      WALconsole.log("cells", cells);
      // a wrapper function that goes through and tosses cells/rows that are display:none
      //cells = onlyDisplayedCellsAndRows(cells);
      WALconsole.log("returning cells 1", cells);
      return cells;      
    }
    else if (selector.selector_version === 2){
      var optionNodes = pub.interpretPulldownSelector(selector.selector); // todo: ugh, gross that we descend here butnot in the above
      console.log("selector.exclude_first", selector.exclude_first);
      optionNodes = optionNodes.splice(selector.exclude_first, optionNodes.length);
      var cells = _.map(optionNodes, function(o){return [o];});
      return cells;
      // 
      // a wrapper function that goes through and tosses cells/rows that are display:none
      // cells = onlyDisplayedCellsAndRows(cells);
      // WALconsole.log("returning cells 2", cells);
    }
    else{
      console.log("about to throw new unknown selector type version error", selector);
      throw new Error("Unknown selectorTypeVersion");
    }
  };


/**********************************************************************
 * How to actually synthesize the selectors used by the relation-finder above
 **********************************************************************/

  function findCommonAncestor(nodes){
    // this doesn't handle null nodes, so filter those out first
    nodes = _.filter(nodes, function(node){return node !== null && node !== undefined && $(node).parents().length;});
    var xpath_lists = _.map(nodes, function(node){ return XPathList.xPathToXPathList(nodeToXPath(node)); });
    if (xpath_lists.length === 0){
      WALconsole.log("Why are you trying to get the common ancestor of 0 nodes?");
      return;
    }
    var first_xpath_list = xpath_lists[0];
    for (var i = 0; i< first_xpath_list.length; i++){
      var all_match = _.reduce(xpath_lists, function(acc, xpath_list){return acc && _.isEqual(xpath_list[i],first_xpath_list[i]);}, true);
      if (!all_match){ break; }
    }
    var last_matching = i - 1;
    var ancestor_xpath_list = first_xpath_list.slice(0,last_matching+1);
    var ancestor_nodes = xPathToNodes(XPathList.xPathToString(ancestor_xpath_list));
    return ancestor_nodes[0];
  }

  function hasAllSubnodes(node, suffixes){
    var xpath_list = XPathList.xPathToXPathList(nodeToXPath(node));
    //check whether this node has an entry for all desired suffixes
    for (var j = 0; j < suffixes.length; j++){
      var suffix = suffixes[j];
      var suffix_xpath_string = XPathList.xPathToString(xpath_list.concat(suffix));
      var suffix_nodes = xPathToNodes(suffix_xpath_string);
      if (suffix_nodes.length === 0){
        return false;
      }
      return true;
    }
  }

  function findSiblingAtLevelIIndexJ(xpath_list, i, j, suffixes){
    xpath_list[i].index = j;
    var xpath_string = XPathList.xPathToString(xpath_list); 
    var nodes = xPathToNodes(xpath_string); // the node at index j, because we updated the index in xpath_list
    if (nodes.length > 0) { 
      // awesome.  there's actually a node at this xpath.  let's make it our candidate node
      var candidateNode = nodes[0];
      if (hasAllSubnodes(candidateNode, suffixes)){
        return candidateNode;
      }
    }
    return null;
  }

  // find a sibling of the argument node that also has all the suffixes
  function findSibling(node, suffixes){
    var xpath_list = XPathList.xPathToXPathList(nodeToXPath(node));
    var xpath_list_length = xpath_list.length;
    for (var i = (xpath_list.length - 1); i >= 0; i--){ // start at the end of the xpath, move back towards root
      var index = parseInt(xpath_list[i].index); // at this component of the xpath, what index?
      var candidateNode = findSiblingAtLevelIIndexJ(xpath_list, i, index + 1, suffixes); // try one index over
      if (candidateNode !== null) {return candidateNode;}
      xpath_list[i].index = index; // set it back to the original index since we may be using it later
    }
    return null;
  }

  function suffixFromAncestor(ancestor, descendant){
    var axpl = XPathList.xPathToXPathList(nodeToXPath(ancestor));
    var dxpl = XPathList.xPathToXPathList(nodeToXPath(descendant));
    var suffix = dxpl.slice(axpl.length, dxpl.length);
    return suffix;
  }

  function columnsFromNodeAndSubnodes(node, subnodes){
    var columns = [];
    for (var i = 0; i < subnodes.length; i++){
      var xpath = nodeToXPath(subnodes[i]);
      var suffix = suffixFromAncestor(node, subnodes[i]);
      columns.push({xpath: xpath, suffix: suffix, id: null});
    }
    return columns;
  }

  function Selector(dict, exclude_first, columns, positive_nodes, negative_nodes){
    return {selector: dict, 
              exclude_first: exclude_first, 
              columns: columns, 
              positive_nodes: positive_nodes, 
              negative_nodes: negative_nodes,
              selector_version: 1}; // this form of Selector object should only be used for version 1 selectors, or else change this
  }

  function synthesizeSelector(positive_nodes, negative_nodes, columns, features){
    if(typeof(features)==='undefined') {features = ["tag", "xpath"];}
    
    var feature_dict = featureDict(features, positive_nodes);
    if (feature_dict.hasOwnProperty("xpath") && feature_dict["xpath"].length > 3 && features !== almost_all_features){
      //xpath alone can't handle our positive nodes
      return synthesizeSelector(positive_nodes, negative_nodes, columns, almost_all_features);
    }
    //if (feature_dict.hasOwnProperty("tag") && feature_dict["tag"].length > 1 && features !== all_features){
    //  return synthesizeSelector(all_features);
    //}
    var rows = pub.interpretRelationSelector(Selector(feature_dict, false, columns));
    
    //now handle negative examples
    var exclude_first = 0;
    for (var j = 0; j < rows.length; j++){
      var nodes = rows[j];
      for (var i = 0; i < nodes.length ; i++){
        var node = nodes[i];
        if (_.contains(negative_nodes, node)){
          if (j === 0){
            exclude_first = 1;
          }
          else if (features !== almost_all_features) {
            //xpaths weren't enough to exclude nodes we need to exclude
            WALconsole.log("need to try more features.");
            return synthesizeSelector(positive_nodes, negative_nodes, columns, almost_all_features);
          }
          else {
            WALconsole.log("using all our features and still not working.  freak out.");
            WALconsole.log(feature_dict);
            //we're using all our features, and still haven't excluded
            //the ones we want to exclude.  what do we do?  TODO
          }
        }
      }
    }
    return Selector(feature_dict, exclude_first, columns, positive_nodes, negative_nodes);
  }

  function featureDict(features, positive_nodes){
    //initialize empty feature dict
    var feature_dict = {};
    for (var i = 0; i < features.length; i++){
      feature_dict[features[i]] = {"values":[],"pos":true};
    }
    //add all positive nodes' values into the feature dict
    for (var i = 0; i < positive_nodes.length; i++){
      var node = positive_nodes[i];
      for (var j = 0; j < features.length; j++){
        var feature = features[j];
        var value = getFeature(node,feature);
        feature_dict[feature]["values"].push(value);
      }
    }

    WALconsole.log("featureDict feature_dict", feature_dict);
    
    //where a feature has more then 3 values, it's too much
    //also need to handle xpath differently, merging to xpaths with *s
    var filtered_feature_dict = {};
    for (var feature in feature_dict){
      var values = collapseValues(feature, feature_dict[feature]["values"]);
      WALconsole.log(feature, values.length, positive_nodes.length);
      if (feature === "xpath" || (values.length <= 3 && values.length !== positive_nodes.length)){
        WALconsole.log("accept feature: ", feature);
        filtered_feature_dict[feature] = {"values":values,"pos":true};
      }
    }

    WALconsole.log("returning featureDict filtered_feature_dict", filtered_feature_dict);
    return filtered_feature_dict;
  }

  function synthesizeEditedSelectorFromOldSelector(currentSelectorToEdit){
    var newSelector = synthesizeSelector(currentSelectorToEdit.positive_nodes, currentSelectorToEdit.negative_nodes, currentSelectorToEdit.columns);
    // now remember -- must keep the features of the old selector that don't relate to the actual row selector
    newSelector.next_type = currentSelectorToEdit.next_type;
    newSelector.next_button_selector = currentSelectorToEdit.next_button_selector;
    newSelector.name = currentSelectorToEdit.name;
    newSelector.id = currentSelectorToEdit.id;
    newSelector.url = currentSelectorToEdit.url;
    return newSelector;
  }
    

  pub.synthesizeFromSingleRow = function _synthesizeFromSingleRow(rowNodes){
    var ancestor = findCommonAncestor(rowNodes);
    var positive_nodes = [ancestor];
    var columns = columnsFromNodeAndSubnodes(ancestor, rowNodes);
    var suffixes = _.pluck(columns, "suffix");
    var likeliest_sibling = findSibling(ancestor, suffixes);
    if (likeliest_sibling !== null){
      positive_nodes.push(likeliest_sibling);
    }
    var selector = synthesizeSelector(positive_nodes, [], columns);
    var relation = pub.interpretRelationSelector(selector);

    for (var i = 0; i < relation.length; i++){
      var relRow = relation[i];
      var foundTheRow = _.reduce(relRow, function(acc, cell){return acc || (cell === rowNodes[0]);}, false);
      if (foundTheRow){
        // awesome.  we found a row of the relation that includes the first row node
        selector.exclude_first = i;
      }
    }
    return selector;
  }

  function combinations(arr) {
      var ps = [[]];
      for (var i=0; i < arr.length; i++) {
          for (var j = 0, len = ps.length; j < len; j++) {
              ps.push(ps[j].concat(arr[i]));
          }
      }
      // ok, ps has them in order from smallest to largest.  let's reverse that
      return ps.reverse();
  }

  function synthesizeSelectorForSubsetThatProducesLargestRelation(rowNodes, smallestSubsetToConsider){
    // todo: in future, can we just order the combos by number of rowNodes included in the combo, stop once we get one that has a good selector?
    // could this avoid wasting so much time on this?  even in cases where we don't already have server-suggested to help us with smallestSubsetToConsider?
    var combos = combinations(rowNodes);
    WALconsole.log("combos", combos);
    var maxNumCells = -1;
    var maxSelector = null;
    var maxComboSize = -1;
    for (var i = 0; i < combos.length; i++){
      WALconsole.log("*********** synthesizeSelectorForSubsetThatProducesLargestRelation", i, combo, maxNumCells, maxSelector, maxComboSize);
      var combo = combos[i];
      WALconsole.log("working on a new combo", combo);
      // the if below is an inefficient way to do this!  do it better in future!  just make the smaller set of combos! todo
      if (combo.length < smallestSubsetToConsider){
        WALconsole.log("skipping a combo becuase it's smaller than the server-suggested combo", combo, smallestSubsetToConsider);
        continue;
      }
      if (combo.length < maxComboSize){
        // remember, we're going through combinations in order from the largest size to the smallest
        // so if we've already found one of a large size (a large number of matched xpaths),
        // there's no need to spend time looking for smaller ones that we actually don't prefer
        continue;
      }
      if (combo.length < 1){ continue; }
      var selector = pub.synthesizeFromSingleRow(combo);
      WALconsole.log("selector", selector);
      var relation = pub.interpretRelationSelector(selector);
      if (relation.length < 2){
        // we're really not interested in relations of size one -- that's not going to require parameterization at all, after all
        WALconsole.log("ignoring a combo becuase it produces a length 1 relation", combo, relation);
        continue;
      }
      var numCells = combo.length * relation.length;
      if (numCells > maxNumCells){
        maxNumCells = numCells;
        maxSelector = selector;
        maxSelector.relation = relation; // go ahead and save that relation with it
        maxComboSize = combo.length; // keep track of the largest set of cells for which we've found a good selector
        WALconsole.log("maxselector so far", maxSelector);
        WALconsole.log("relation so far", relation);
      }
    }
    if (!maxSelector){
      WALconsole.log("No maxSelector");
      return null;
    }
    WALconsole.log("returning maxselector", maxSelector);
    return maxSelector;
  }

  function tableFeatureDict(tableNode){
    return {table: true, xpath: nodeToXPath(tableNode)};
  }

  function jqueryIndexOf(list, item){
    for (var i = 0; i < list.length; i++){
      if (list[i] === item){
        return i;
      }
    }
    return -1;
  }

  function synthesizeSelectorForWholeSetTable(rowNodes){
    WALconsole.log(rowNodes);
    var parents = $(rowNodes[0]).parents();
    var trs = [];
    for (var i = 0; i < parents.length; i++){
      if (parents[i].tagName === "TR"){
        trs.push(parents[i]);
        // for the time being, we're choosing not to deal with nested tables;  may ultimately want to return and do more; todo.
        break;
      }
    }

    if (trs.length === 0){
      WALconsole.log("No tr parents.");
      return null;
    }

    var parentLists = _.map(rowNodes, function(rowNode){return $(rowNode).parents();});
    var acceptedTrs = [];  // there could in fact be multiple, if we have nested tables...not totally sure how want to do multiples, but for now we'll just assume we want the one with the most cells
    _.each(trs, function(tr){
      var allInRow = _.reduce(parentLists, function(acc, parentList) {return acc && jqueryIndexOf(parentList, tr) > -1;}, true);
      if (allInRow){
        acceptedTrs.push(tr);
      }
    });

    if (acceptedTrs.length === 0){
      WALconsole.log("No shared tr parents.");
      return null;
    }

    var bestScore = 0;
    var bestSelector = null;
    for (var i = 0; i < acceptedTrs.length; i++){
      var tr = acceptedTrs[i];
      var parents = $(tr).parents();
      var tableParent = null;
      for (var j = 0; j < parents.length; j++){
        if (parents[j].tagName === "TABLE"){
          tableParent = parents[j];
          break;
        }
      }
      var children = $(tableParent).find("tr");
      var index = jqueryIndexOf(children, tr); // using this as the number of rows to exclude from the top of the table, since the rowNodes arg should represent first row of target table
      if (index === -1){
        throw "hey, we already know these are all part of one tr";
      }
      var featureDict = tableFeatureDict(tableParent);
      var cellNodes = _.union($(tr).find("td, th").toArray(), rowNodes); // we'll make columns for each argument node of course, but let's also do all the td elements
      var selector = Selector(featureDict, index, columnsFromNodeAndSubnodes(tr, cellNodes), rowNodes, []);
      var relation = pub.interpretRelationSelector(selector);
      selector.relation = relation;
      var score = relation.length * relation[0].length;
      if (score > bestScore){
        bestScore = score;
        bestSelector = selector;
      }
    }

    return bestSelector;
  }

  function numMatchedXpaths(targetXpaths, firstRow){
    var firstRowXpaths = _.pluck(firstRow, "xpath");
    var matchedXpaths = _.intersection(targetXpaths, firstRowXpaths);
    WALconsole.log("numMatchedXpaths", matchedXpaths.length, targetXpaths, firstRowXpaths, matchedXpaths);
    return matchedXpaths.length;
  }

  function unmatchedXpaths(targetXpaths, firstRow){
    var firstRowXpaths = _.pluck(firstRow, "xpath");
    var unmatchedXpaths = _.difference(targetXpaths, firstRowXpaths);
    return unmatchedXpaths;
  }

  function recordComparisonAttributesNewSelector(selectorData, targetXpaths){
    var rel = selectorData.relation;
    selectorData.numMatchedXpaths = numMatchedXpaths(targetXpaths, rel[0]);
    selectorData.numRows = rel.length;
    selectorData.numRowsInDemo = selectorData.numRows;
    if (rel.length < 1){
      selectorData.numColumns = 0;
    }
    else{
      selectorData.numColumns = rel[0].length;
    }
  }

  function recordComparisonAttributesServerSelector(selectorData, targetXpaths){
    var rel = selectorData.relation;
    selectorData.numMatchedXpaths = numMatchedXpaths(targetXpaths, rel[0]);
    selectorData.numRows = rel.length;
    selectorData.numRowsInDemo = selectorData.num_rows_in_demonstration;
    selectorData.numColumns = rel[0].length;
  }

  function bestSelector(defaultRel, alternativeRel){
    // first things first, before we get into anything else, we always want a relation with more than one row
    // or else we don't really care about it.  so default or no, we're going to eliminate it if it only has one
    if (defaultRel.numRowsInDemo > 1 && alternativeRel.numRowsInDemo <= 1){
      return defaultRel;
    }
    else if (alternativeRel.numRowsInDemo > 1 && defaultRel.numRowsInDemo <= 1){
      return alternativeRel;
    }

    // normal processesing - just go through the features we care about, and pick default if it wins on any of our ordered list of features, else the alternative
    // we only really get into crazy tie breakers if we're tied on num of matched xpaths, because whichever wins there can automatically win the whole thing
    // but if they're tied, we go into the extra feature deciders
    if (defaultRel.numMatchedXpaths > alternativeRel.numMatchedXpaths){
      return defaultRel;
    }
    else if (defaultRel.numMatchedXpaths === alternativeRel.numMatchedXpaths){
      if (defaultRel.numRows > alternativeRel.numRows){
        return defaultRel;
      }
      else if (defaultRel.numRows === alternativeRel.numRows){
        if (defaultRel.numRowsInDemo > alternativeRel.numRowsInDemo){
          return defaultRel;
        }
        else if (defaultRel.numRowsInDemo === alternativeRel.numRowsInDemo){
          if (defaultRel.numColumns > alternativeRel.numColumns){
            return defaultRel;
          }
          else if (defaultRel.numColumns === alternativeRel.numColumns){
            if (defaultRel.next_type !== null && alternativeRel.next_type === null){
              // defaultRel has a next button method, but alternativeRel doesn't, so defaultRel better
              return defaultRel;
            }
            else if (!(alternativeRel.next_type !== null && defaultRel.next_type === null)){
              // it's not the case that altRel has next method and defRel doesn't, so either both have it or neither has it, so they're the same
              // they're the same, so just return the default one
              return defaultRel;
            }
          }
        }
      }
    }
    return alternativeRel;
  }

  function xpathsToNodes(xpaths){
    if (!xpaths || xpaths.length <= 0){
      WALconsole.warn("Woah woah woah, why are there no xpaths.  This is probably very bad.");
      return [];
    }
    var nodes = [];
    for (var i = 0; i < xpaths.length; i++){
      var node = xPathToNodes(xpaths[i])[0];
      if (!node){
        continue; // todo: this may not be the right thing to do!  for now we're assuming that if we can't find a node at this xpath, it's because we jumbled in the nodes from a different page into the relation for this page (becuase no updat to url or something); but it may just mean that this page changed super super quickly, since the recording
      }
      nodes.push(node);
    }
    return nodes;
  }

  function labelColumnSuffixesWithTheirSelectors(columnLs, selectorIndex){
    for (var i = 0; i < columnLs.length; i++){
      var col = columnLs[i];
      var currSuffixes = col.suffix;
      if (MiscUtilities.depthOf(currSuffixes) < 3){
        // when we have only one suffix, we don't store it in a list, but the below is cleaner if we just have a list; todo: clean up
        currSuffixes = [currSuffixes];
      }
      var outputSuffixLs = [];
      for (var j = 0; j < currSuffixes.length; j++){
        if (currSuffixes[j].selectorIndex){
          // great, it's already an object with a selector index, and we just need to update the selectorIndex
          currSuffixes[j].selectorIndex = selectorIndex;
          outputSuffixLs.push(currSuffixes[j]);
        }
        else{
          // ah, still just the old list representation of a selector.  need to make it into a selectorIndex-labeled object
          outputSuffixLs.push({selectorIndex: selectorIndex, suffixRepresentation: currSuffixes[j]});
        }
      }
      col.suffix = outputSuffixLs;
    }
  }

  function addSelectorToSelector(selectorToAugment, selectorToBeAdded){
    if (selectorToBeAdded.selector.constructor === Array){
      WALconsole.warn("Woah, you shouldn't be adding a fresh selector that already has multiple selectors.  Have to add those one at a time for this function.");
    }

    var currSelectorOrSelectorList = selectorToAugment.selector;
    if (!currSelectorOrSelectorList){ // can happen that we have no selector to agument, if we're actually demo-ing a new relation
      currSelectorOrSelectorList = [];
      selectorToAugment.columns = [];
    }
    if (currSelectorOrSelectorList.constructor === Array){
      // cool, no need to mess around with the current selector's columns
      // let's just add the new selector to the list
      selectorToAugment.selector = currSelectorOrSelectorList.concat([selectorToBeAdded.selector]);
    }
    else{
      // ok, this selector used to have just one.  let's go ahead and turn it into a list and make sure all its
      // column objects have all their suffixes labeled with index 0, since the curr selector will be the first in the list
      selectorToAugment.selector = [selectorToAugment.selector, selectorToBeAdded.selector];
      labelColumnSuffixesWithTheirSelectors(selectorToAugment.columns, 0);
    }
    // and in either case, we need to add the new selectors columns to the prior set of columns, and we need to label them with the position in the list of selectors (len minus one)
    labelColumnSuffixesWithTheirSelectors(selectorToBeAdded.columns, selectorToAugment.selector.length - 1);
    selectorToAugment.columns = selectorToAugment.columns.concat(selectorToBeAdded.columns);
    return selectorToAugment;
  }

  var timesToTry = 5;
  var timesTried = 0;
  // todo: does it make any sense to have this here when we have the mainpanel asking multiple times anyway?
  pub.likelyRelationWrapper = function _likelyRelationWrapper(msg){
    var msg = pub.likelyRelation(msg);
    WALconsole.log("msg", msg);
    if (msg){ // a casual way to check if maybe this isn't a serious enough relation.  should probably do better
      timesTried = 0;
      WALconsole.log("msg", msg);
      return msg;
    }
    else if (timesTried <= timesToTry) {
      // you never know...we may need to just wait a little while...
      timesTried += 1;
      return null;
    }
    else{
      // ok, time to give up
      return msg;
    }
  }

  function extractOptionNodesFromSelectorNode(node){
    var options = $(node).find("option");
    return options;
  }

  function extractOptionsRelationFromSelectorNode(node){
    var options = extractOptionNodesFromSelectorNode(node);
    var optionsRelation = _.map(options, function(o){return [NodeRep.nodeToMainpanelNodeRepresentation(o)];});
    console.log("optionsRelation in extractOptionsRelationFromSelectorNode", optionsRelation, optionsRelation.length);
    return optionsRelation;
  }

  function makeRelationsForPulldownXpaths(msg, pulldownxpaths){
    var pulldownRelations = [];
    var selectNodes = $("select");
    for (var i = 0; i < pulldownxpaths.length; i++){
      var xpath = pulldownxpaths[i];
      var newMsg = {page_var_name: msg.pageVarName, url: window.location.href}; // this pageVarName is used by the mainpanel to keep track of which pages have been handled already
      var node = xPathToNodes(xpath)[0];
      if (!node){
        continue; // right thing to do?
      }
      var index = selectNodes.index(node);
      var optionsRelation = extractOptionsRelationFromSelectorNode(node);
      var firstRowXpath = optionsRelation[0][0].xpath;
      var excludeFirst = 0; // convenient to always use 0 so we can correctly index into the relation
      optionsRelation = optionsRelation.splice(excludeFirst, optionsRelation.length);

      newMsg.relation_id = null;
      newMsg.name = "pulldown_" + (index + 1);
      // for a pulldown menu, there better be no more items
      newMsg.next_type = NextTypes.NONE;
      newMsg.next_button_selector = null;
      newMsg.exclude_first = excludeFirst; // todo: can we do better?  extra recording info?
      newMsg.num_rows_in_demonstration = optionsRelation.length;
      newMsg.selector = {type: "pulldown", index: index};
      newMsg.selector_version = 2; // 2 is for pulldown selectors?
      newMsg.columns = [{
        id: null,
        index: 0, // only one column
        name: newMsg.name + "_option",
        suffix: [],
        xpath: firstRowXpath
      }];
      newMsg.first_page_relation = optionsRelation;  

      pulldownRelations.push(newMsg);
    }
    return pulldownRelations;
  }

  var processedCount = 0;
  var processedLikelyRelationRequest = false;
  pub.likelyRelation = function _likelyRelation(msg){
    if (processedLikelyRelationRequest){
      // should only even send a likely relation once from one page, since it gets closed after we get the answer we wanted
      // may end up sending multiples if we're sent the inciting message multiple times because the page loads slowly
      return;
    }

    var xpaths = msg.xpaths;

    // we're going to do something a little different for the case where one or more nodes come from pulldown menus
    var pulldownxpaths = [];
    if (xpaths){
      for (var i = 0; i < xpaths.length; i++){
        var xpath = xpaths[i].toLowerCase();
        if (xpath.indexOf("/select[") > -1){
          // ok, we've grabbed something from a pulldown
          pulldownxpaths.push(xpath);
        }
      }      
    }

    // for the non-pulldown xpaths, we'll proceed with normal processing
    xpaths = _.difference(xpaths, pulldownxpaths);
    // for pulldown xpaths, we'll do something different
    var pulldownRelations = makeRelationsForPulldownXpaths(msg, pulldownxpaths);

    var nodes = xpathsToNodes(xpaths);

    var maxNodesCoveredByServerRelations = 0;
    var serverSuggestedRelations = msg.serverSuggestedRelations;
    if (serverSuggestedRelations){
      for (var i = 0; i < serverSuggestedRelations.length; i++){
        var rel = serverSuggestedRelations[i];
        if (rel === null){
          continue;
        }
        var columns = rel.columns;
        var relXpaths = _.pluck(columns, "xpath");
        WALconsole.log(relXpaths);
        var matched = 0;
        for (var j = 0; j < xpaths.length; j++){
          if (relXpaths.indexOf(xpaths[j]) > -1){
            matched += 1;
          }
        }
        if (matched > maxNodesCoveredByServerRelations){
          maxNodesCoveredByServerRelations = matched;
        }
      }
      WALconsole.log("maxNodesCoveredByServerRelations", maxNodesCoveredByServerRelations);
    }

    // if this is actually in an html table, let's take a shortcut, since some sites use massive tables and trying to run the other approach would take forever
    var selectorData = synthesizeSelectorForWholeSetTable(nodes);

    if (selectorData === null){
      // ok, no table, we have to do the standard, possibly slow approach
      selectorData = synthesizeSelectorForSubsetThatProducesLargestRelation(nodes, maxNodesCoveredByServerRelations + 1);
    }
    if (selectorData === null){
      // well, huh.  we just don't know what to do here.
      selectorData = {};
      selectorData.relation = [];
    }
    var relationData = _.map(selectorData.relation, function(row){return _.map(row, function(cell){return NodeRep.nodeToMainpanelNodeRepresentation(cell);});});
    selectorData.relation = relationData;
    WALconsole.log("synthesized a selector, selectorData", selectorData);

    // this (above) is the candidate we auto-generate from the page, but want to compare to the relations the server suggested
    // criteria (1) largest number of target xpaths in the first row, (2) largest number of rows retrieved from the page, (3), largest num of rows in original demonstration (4) largest number of columns associated with relation
    // and if it's tied after all of that, pick the one from the server since it might have next interaction associated, might have good col names

    var bestSelectorIsNew = true;
    var currBestSelector = selectorData;
    recordComparisonAttributesNewSelector(selectorData, xpaths);

    WALconsole.log("serverSuggestedRelations", serverSuggestedRelations, "selectorData", selectorData);
    var serverSuggestedRelations = msg.serverSuggestedRelations;
    if (serverSuggestedRelations){
      for (var i = 0; i < serverSuggestedRelations.length; i++){
        var rel = serverSuggestedRelations[i];
        if (rel === null){
          continue;
        }
        var selector_obj = Selector(rel.selector, rel.exclude_first, rel.columns);
        selector_obj.selector_version = rel.selector_version;
        var relationNodes = pub.interpretRelationSelector(selector_obj);
        if (relationNodes.length === 0){
          // no need to consider empty one
          continue;
        }
        var relationData = _.map(relationNodes, function(row){return _.map(row, function(cell){return NodeRep.nodeToMainpanelNodeRepresentation(cell);});});
        rel.relation = relationData; 
        recordComparisonAttributesServerSelector(rel, xpaths);

        WALconsole.log("default", rel, "new", currBestSelector);
        // use the server-provided rel as our default, since that'll make the server-side processing when we save the relation easier, and also gives us the nice names
        var newBestSelector = bestSelector(rel, currBestSelector);
        if (newBestSelector !== currBestSelector){
          currBestSelector = newBestSelector;
          bestSelectorIsNew = false;
        }
      }
    }

    // ok, we've picked our best selector.  of course, it's possible it doesn't cover all columns
    // if it doesn't cover all columns, we're willing to add up to one more supplementary selector
    // todo: in future, consider adding more than one additional selector -- may need up to one selector per column
    // but for now, we'll try one
    var uncoveredSoFar = unmatchedXpaths(xpaths, currBestSelector.relation[0]);
    WALconsole.log("uncoveredSoFar", uncoveredSoFar);
    if (uncoveredSoFar.length > 0){
      // let's see if we can cover as many as possible of the remaining nodes
      var uncoveredNodes = xpathsToNodes(uncoveredSoFar);
      var additionalSelector = synthesizeSelectorForSubsetThatProducesLargestRelation(uncoveredNodes, 0);
      // now reason about the length of the lists and whether it even makes sense to pair them
      if (additionalSelector && currBestSelector.relation.length == additionalSelector.relation.length){
        WALconsole.log("We're adding an additional selector.", additionalSelector);
        currBestSelector = addSelectorToSelector(currBestSelector, additionalSelector);
        WALconsole.log("currBestSelector", currBestSelector);
        WALconsole.log("currBestSelector.selector.length", currBestSelector.selector.length);
        WALconsole.log("currBestSelector.selector.constructor === Array", currBestSelector.selector.constructor === Array);
        var rel = pub.interpretRelationSelector(currBestSelector);
        var relationData = _.map(rel, function(row){return _.map(row, function(cell){return NodeRep.nodeToMainpanelNodeRepresentation(cell);});});
        currBestSelector.relation = relationData;
        WALconsole.log("currBestSelector.relation", currBestSelector.relation);
      }
    }

    var newMsg = {page_var_name: msg.pageVarName, url: window.location.href}; // this pageVarName is used by the mainpanel to keep track of which pages have been handled already
    if (bestSelectorIsNew) {
      newMsg.relation_id = null;
      newMsg.name = null;
      // we always guess that there are no more items (no more pages), and user has to correct it if this is not the case
      newMsg.next_type = NextTypes.NONE;
      newMsg.next_button_selector = null;
    }
    else {
      newMsg.relation_id = currBestSelector.id;
      newMsg.name = currBestSelector.name;
      newMsg.next_type = currBestSelector.next_type;
      newMsg.next_button_selector = currBestSelector.next_button_selector;
    }
    WALconsole.log("currBestSelector", currBestSelector);
    newMsg.exclude_first = currBestSelector.exclude_first;
    newMsg.num_rows_in_demonstration = currBestSelector.relation.length;
    newMsg.selector = currBestSelector.selector;
    newMsg.selector_version = 1; // right now they're all 1.  someday may want to be able to add new versions of selectors that are processed differently
    newMsg.columns = currBestSelector.columns;
    newMsg.first_page_relation = currBestSelector.relation;

    if (pulldownRelations.length > 0){
      newMsg.pulldown_relations = pulldownRelations;
    }

    if (currBestSelector.relation.length < 1 && pulldownRelations.length < 1){
      processedCount += 1;
      if (processedCount < 10){
        // ok, looks like we don't actually have any data yet.  might be because data hasn't fully loaded on page yet
        // the mainpanel will keep asking for likelyrelations, so let's wait a while, see if the next time works; try 10 times
        // todo: not sure this is where we want to deal with this?
        return null;
      }
    }

    //utilities.sendMessage("content", "mainpanel", "likelyRelation", newMsg);
    processedLikelyRelationRequest = true;
    return newMsg; // return rather than sendmessage because it's a builtin response handler one
  }

  pub.getRelationItems = function _getRelationItems(msg, sendMsg){
    if (sendMsg === undefined){ sendMsg = true; }
    console.log("msg", msg);
    if (!msg.selector_version){
      console.log("No selector version!!!");
    }
    var relation = pub.interpretRelationSelector(msg);
    var relationData = pub.relationNodesToMainpanelNodeRepresentation(relation);
    if (sendMsg){
      utilities.sendMessage("content", "mainpanel", "relationItems", {relation: relationData});
    }
    return relationData;
  };

  pub.relationNodesToMainpanelNodeRepresentation = function _relationNodesToMainpanelNodeRepresentation(relationNodes){
    var relationData = _.map(relationNodes, function(row){return _.map(row, function(cell){return NodeRep.nodeToMainpanelNodeRepresentation(cell);});});
    return relationData;
  }

  function selectorId(selectorObject){
    var keysToKeep = ["name", "selector", "columns", "selector_version", "exclude_first", "next_type", "next_button_selector", "url", "num_rows_in_demonstration"];
    var newObj = _.map(keysToKeep, function(key){return selectorObject[key];});
    return StableStringify.stringify(newObj);
  }

/**********************************************************************
 * Highlight stuff
 **********************************************************************/

  var colors = ["#9EE4FF","#9EB3FF", "#BA9EFF", "#9EFFEA", "#E4FF9E", "#FFBA9E", "#FF8E61"];
  pub.highlightRelation = function _highlightRelation(arrayOfArrays, display, pointerEvents){
    var nodes = [];
    for (var i = 0; i < arrayOfArrays.length ; i++){
      for (var j = 0; j < arrayOfArrays[i].length; j++){
        var node = arrayOfArrays[i][j];
        if (node === null){continue;}
        // first make sure there is a color at index j, add one if there isn't
        if (j >= colors.length){
          colors.push("#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}));
        }
        var node = Highlight.highlightNode(node, colors[j], display, pointerEvents);
        nodes.push(node);
      }
    }
    return nodes;
  }

/**********************************************************************
 * Everything we need for editing a relation selector
 **********************************************************************/

  var currentSelectorToEdit = null;
  var currentSelectorEmptyOnThisPage = false;
  pub.editRelation = function _editRelation(msg){
    if (currentSelectorToEdit !== null){
      // we've already set up to edit a selector, and we should never use the same tab to edit multiples
      // always close tab and reload.  so don't run setup again
      return;
    }
    // utilities.sendMessage("mainpanel", "content", "editRelation", {selector: this.selector, selector_version: this.selectorVersion, exclude_first: this.excludeFirst, columns: this.columns}, null, null, [tab.id]);};
    currentSelectorToEdit = msg;
    document.addEventListener('click', editingClick, true);
    // don't try to process the page till it's loaded!  jquery onloaded stuff will run immediately if page already loaded, once loaded else
    var editingSetup = function(){
      pub.setRelation(currentSelectorToEdit);
      if (currentSelectorToEdit.relation.length < 1){
        // ugh, but maybe the page just hasn't really finished loading, so try again in a sec
        //setTimeout(editingSetup, 1000);
	// but also need to send the editing colors just in case
	       pub.sendSelector(currentSelectorToEdit);
         currentSelectorEmptyOnThisPage = true;
        return;
      }
      pub.highlightSelector(currentSelectorToEdit);
      // start with the assumption that the first row should definitely be included
      msg.positive_nodes = [findCommonAncestor(currentSelectorToEdit.relation[0]),findCommonAncestor(currentSelectorToEdit.relation[1])];
      msg.negative_nodes = [];
      pub.sendSelector(currentSelectorToEdit);
      if (msg.next_type === NextTypes.NEXTBUTTON || msg.next_type === NextTypes.MOREBUTTON){
        highlightNextOrMoreButton(msg.next_button_selector);
      }

      // we want to highlight the currently hovered node
      document.addEventListener('mouseenter', highlightHovered, true);

      // also, if we have a selector highlighted, and the user scrolls, we're going to need to update...
      var didScroll = false;
      $("*").scroll(function() {
        didScroll = true;
      });

      setInterval(function() {
        if ( didScroll ) {
          didScroll = false;
          // Ok, we're ready to redo the relation highlighting with new page situation
          WALconsole.log("scroll updating");
          pub.newSelectorGuess(currentSelectorToEdit);
        }
        }, 250);
    };

    $(editingSetup);
  };

  pub.setEditRelationIndex = function _setEditRelationIndex(i){
    currentSelectorToEdit.editingClickColumnIndex = i;
  }

  var currentHoverHighlight = null;
  function highlightHovered(event){
    var prevHoverHighlight = currentHoverHighlight;
    var color = "#9D00FF";
    if (listeningForNextButtonClick){
      color = "#E04343";
    }
    if (prevHoverHighlight) {prevHoverHighlight.remove(); prevHoverHighlight = null;}
    currentHoverHighlight = Highlight.highlightNode(event.target, color);
  }

  pub.setRelation = function _setRelation(selectorObj){
    selectorObj.relation = pub.interpretRelationSelector(selectorObj);
    selectorObj.num_rows_in_demo = selectorObj.relation.length;
  };

  var currentSelectorHighlightNodes = [];
  pub.highlightSelector = function _highlightSelector(selectorObj){
    currentSelectorHighlightNodes = pub.highlightRelation(selectorObj.relation, true, true); // we want to allow clicks on the highlights (see editingClick)
  };
  pub.highlightCurrentSelector = function _highlightCurrentSelector(){
    pub.highlightSelector(currentSelectorToEdit);
  }

  pub.sendSelector = function _sendSelector(selectorObj){
    var relation = selectorObj.relation;
    var relationData = _.map(relation, function(row){return _.map(row, function(cell){return NodeRep.nodeToMainpanelNodeRepresentation(cell);});}); // mainpanel rep version
    selectorObj.demonstration_time_relation = relationData;
    selectorObj.relation = null; // don't send the relation
    selectorObj.colors = colors;
    utilities.sendMessage("content", "mainpanel", "editRelation", selectorObj);
    selectorObj.relation = relation; // restore the relation
  };

  pub.clearCurrentSelectorHighlight = function(){
    for (var i = 0; i < currentSelectorHighlightNodes.length; i++){
      Highlight.clearHighlight(currentSelectorHighlightNodes[i]);
    }
    currentSelectorHighlightNodes = [];
  };

  pub.newSelectorGuess = function _newSelectorGuess(selectorObj){
    pub.setRelation(selectorObj);
    pub.clearCurrentSelectorHighlight();
    pub.highlightSelector(selectorObj);
    pub.sendSelector(selectorObj);
  }

  function findAncestorLikeSpec(spec_ancestor, node){
    //will return exactly the same node if there's only one item in first_row_items
    WALconsole.log("findAncestorLikeSpec", spec_ancestor, node);
    var spec_xpath_list = XPathList.xPathToXPathList(nodeToXPath(spec_ancestor));
    var xpath_list = XPathList.xPathToXPathList(nodeToXPath(node));
    var ancestor_xpath_list = xpath_list.slice(0,spec_xpath_list.length);
    var ancestor_xpath_string = XPathList.xPathToString(ancestor_xpath_list);
    var ancestor_xpath_nodes = xPathToNodes(ancestor_xpath_string);
    return ancestor_xpath_nodes[0];
  }

  var targetsSoFar = [];
  function editingClick(event){
    if (listeningForNextButtonClick){
      // don't want to do normal editing click...
      nextButtonSelectorClick(event);
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    var target = event.target;

    if (currentSelectorEmptyOnThisPage){
      // ok, it's empty right now, need to make a new one
      if (!currentSelectorToEdit.origSelector){
        currentSelectorToEdit.origSelector = JSON.parse(JSON.stringify(currentSelectorToEdit)); // deepcopy
      }
      targetsSoFar.push(target);
      var newSelector = pub.synthesizeFromSingleRow(targetsSoFar);
      currentSelectorToEdit.currentIndividualSelector = newSelector; // just the individual selector that we want to play with
      currentSelectorToEdit.selector = currentSelectorToEdit.origSelector; // reset this so the addSelectorToSelector call will work
      var mergedSelector = addSelectorToSelector(currentSelectorToEdit.origSelector, newSelector);
      currentSelectorToEdit.selector = mergedSelector.selector;
      currentSelectorToEdit.columns = mergedSelector.columns;
      //currentSelectorToEdit = newSelector;
      pub.newSelectorGuess(currentSelectorToEdit);
      // and let's go back to using .selector as the current one we want to edit and play with
      currentSelectorToEdit.selector = currentSelectorToEdit.currentIndividualSelector;
      currentSelectorToEdit.positive_nodes = [target];
      currentSelectorEmptyOnThisPage = false;
      return;
    }

    var removalClick = false;
    // it's only a removal click if the clicked item is a highlight
    if (Highlight.isHighlight(target)){
      removalClick = true;
      // actual target is the one associated with the highlight
      target = Highlight.getHighligthedNodeFromHighlightNode(target);
      var nodeToRemove = target; // recall the target itself may be the positive example, as when there's only one column
      if (currentSelectorToEdit.positive_nodes.indexOf(target) < 0){
        // ok it's not the actual node, better check the parents
        var parents = $(target).parents(); 
        for (var i = parents.length - 1; i > 0; i--){
          var parent = parents[i];
          var index = currentSelectorToEdit.positive_nodes.indexOf(parent);
          if ( index > -1){
            // ok, so this click is for removing a node.  removing the row?  removing the column?
            // not that useful to remove a column, so probably for removing a row...
            nodeToRemove = parent;
            break;
          }
        }
      }
      // actually remove the node from positive, add to negative
      var ind = currentSelectorToEdit.positive_nodes.indexOf(nodeToRemove);
      currentSelectorToEdit.positive_nodes.splice(ind, 1);
      if (!currentSelectorToEdit.negative_nodes){
        currentSelectorToEdit.negative_nodes = [];
      }
      currentSelectorToEdit.negative_nodes.push(nodeToRemove);
    }
    // we've done all our highlight stuff, know we no longer need that
    // dehighlight our old list
    _.each(currentSelectorHighlightNodes, Highlight.clearHighlight);

    if (!removalClick){
      // ok, so we're trying to add a node.  is the node another cell in an existing row?  or another row?  could be either.
      // for now we're assuming it's always about adding rows, since it's already possible to add columns by demonstrating first row

      var newCellInExistingRow = false;
      if (newCellInExistingRow){
        // for now, assume it's another cell in an existing row
        // todo: give the user an interaction that allows him or her say it's actually another row
        // todo: put some kind of outline around the ones we think of the user as having actually demonstrated to us?  the ones we're actually using to generate the selector?  so that he/she knows which to actually click on to change things
        // maybe green outlines (or color-corresponding outlines) around the ones we're trying to include, red outlines around the ones we're trying to exclude.

        // let's figure out which row it should be
        // go through all rows, find common ancestor of the cells in the row + our new item, pick whichever row produces an ancestor deepest in the tree
        var currRelation = currentSelectorToEdit.relation;
        var deepestCommonAncestor = null;
        var deepestCommonAncestorDepth = 0;
        var currRelationIndex = 0;
        for (var i = 0; i < currRelation.length; i++){
          var nodes = currRelation[i];
          var ancestor = findCommonAncestor(nodes.concat([target]));
          var depth = $(ancestor).parents().length;
          if (depth > deepestCommonAncestorDepth){
            deepestCommonAncestor = ancestor;
            deepestCommonAncestorDepth = depth;
            currRelationIndex = i;
          }
        }

        var columns = columnsFromNodeAndSubnodes(deepestCommonAncestor, currRelation[currRelationIndex].concat([target]));
        currentSelectorToEdit.columns = columns;

        // let's check whether the common ancestor has actually changed.  if no, this is easy and we can just change the columns
        // if yes, it gets more complicated
        var origAncestor = findCommonAncestor(currRelation[currRelationIndex]);
        var newAncestor = findCommonAncestor(currRelation[currRelationIndex].concat([target]));
        if (origAncestor === newAncestor){
          // we've already updated the columns, so we're ready
          pub.newSelectorGuess(currentSelectorToEdit);
          return;
        }
        // drat, the ancestor has actually changed.
        // let's assume that all the items in our current positive nodes list will have *corresponding* parent nodes...  (based on difference in depth.  not really a good assumption, but we already assume that we have fixed xpaths to get to subcomponents, so we're already making that assumption)
        var xpath = nodeToXPath(newAncestor);
        var xpathlen = xpath.split("/").length;
        var xpathO = nodeToXPath(origAncestor);
        var xpathlenO = xpath.split("/").length;
        var depthDiff = xpathlenO - xpathlen;
        for (var i = 0; i < currentSelectorToEdit.positive_nodes.length; i++){
          var ixpath = nodeToXPath(currentSelectorToEdit.positive_nodes[i]);
          var components = ixpath.split("/");
          components = components.slice(0, components.length - depthDiff);
          var newxpath = components.join("/");
          currentSelectorToEdit.positive_nodes[i] = xPathToNodes(newxpath)[0];
        }
        if (currentSelectorToEdit.positive_nodes.indexOf(deepestCommonAncestor) === -1){
          currentSelectorToEdit.positive_nodes.push(deepestCommonAncestor);
        }
      }
      else{
        // this one's the easy case!  the click is telling us to add a row, rather than to add a cell to an existing row
        // or it may be telling us to add a cell in an existing row to an existing column, which also should not require us to change
        // the ancestor node.  if it does require changing the ancestor node,then we will run into trouble bc won't find appropriate ancestor
        // todo: better structure available here?  maybe merge this and the above?
        var appropriateAncestor = findAncestorLikeSpec(currentSelectorToEdit.positive_nodes[0], target);
        var currColumnObj = currentSelectorToEdit.columns[currentSelectorToEdit.editingClickColumnIndex];
        var currSuffixes = currColumnObj.suffix;
        if (MiscUtilities.depthOf(currSuffixes) < 3){
          // when we have only one suffix, we don't store it in a list, but the below is cleaner if we just have a list; todo: clean up
          currSuffixes = [currSuffixes];
        }

        // is this suffix already in our suffixes?  if yes, we can just add the ancestor/row node, don't need to mess with columns
        var newSuffix = suffixFromAncestor(appropriateAncestor, target);
        var newSuffixAlreadyPresent = _.reduce(currSuffixes, function(acc, currSuffix){return acc || _.isEqual(currSuffix, newSuffix);}, false);
        if (!newSuffixAlreadyPresent){
          // ok it's not in our current suffixes, so we'll have to make the new suffixes list
          currSuffixes.push(newSuffix);     
          currColumnObj.suffix = currSuffixes;     
        }
    
        // is this ancestor node already in our positive_nodes?  if no, make new selector.  if yes, we're already set
        if (currentSelectorToEdit.positive_nodes.indexOf(appropriateAncestor) === -1){
          // this ancestor node (row node) is new to us, better add it to the positive examples
          currentSelectorToEdit.positive_nodes.push(appropriateAncestor);
        }
      }

    }

    var newSelector = synthesizeEditedSelectorFromOldSelector(currentSelectorToEdit);
    currentSelectorToEdit = newSelector;
    pub.newSelectorGuess(currentSelectorToEdit);
  }

/**********************************************************************
 * Handling next buttons
 **********************************************************************/

  var listeningForNextButtonClick = false;
  pub.nextButtonSelector = function _nextButtonSelector(){
    // ok, now we're listening for a next button click
    listeningForNextButtonClick = true;
    pub.clearNextButtonSelector(); // remove an old one if there is one
    pub.clearCurrentSelectorHighlight(); // in case the highlighting of cells blocks the next button, hide this
  };

  pub.clearNextButtonSelector = function _clearNextButtonSelector(){
    // we just want to unhighlight it if there is one...
    unHighlightNextOrMoreButton();
  };

  function nextButtonSelectorClick(event){
    listeningForNextButtonClick = false;

    event.stopPropagation();
    event.preventDefault();
    
    var next_or_more_button = $(event.target);
    var data = {};
    data.tag = next_or_more_button.prop("tagName");
    data.text = next_or_more_button.text();
    data.id = next_or_more_button.attr("id");
    data.class = next_or_more_button.attr("class");
    data.src = next_or_more_button.prop('src');
    data.xpath = nodeToXPath(event.target);
    data.frame_id = SimpleRecord.getFrameId();
    
    utilities.sendMessage("content", "mainpanel", "nextButtonSelector", {selector: data});
    highlightNextOrMoreButton(data);

    pub.highlightCurrentSelector(); // rehighlight the relaiton items
  }

  function rightText(next_button_data, node, prior_next_button_text){
    // either there's an actual image and it's the same, or the text is the same
    if (next_button_data.src){
      return (node.prop('src') === next_button_data.src);
    }
    if (!prior_next_button_text || isNaN(prior_next_button_text)){
      // we don't have a past next button or the past next button wasn't numeric.  so just look for the exact text
      return (node.text() === next_button_data.text);
    }
    else{
      // it was a number!  so we're looking for the next number bigger than this one...
      // oh cool, there's been a prior next button, and it had a number text
      // we'd better look for a button like it but that has a bigger number...
      // todo: make this more robust
      var prior = parseInt(prior_next_button_text);
      var currNodeText = node.text();
      if (isNaN(currNodeText)){
        return false;
      }
      var curr = parseInt(currNodeText);
      if (curr > prior){
        return true;
      }
    }
    return false;
  }

  function findNextButton(next_button_data, prior_next_button_text){
    WALconsole.namedLog("findNextButton", next_button_data, prior_next_button_text, !isNaN(prior_next_button_text));
    WALconsole.log(next_button_data);
    var next_or_more_button_tag = next_button_data.tag;
    var next_or_more_button_text = next_button_data.text;
    var next_or_more_button_id = next_button_data.id;
    var next_or_more_button_class = next_button_data.class;
    var next_or_more_button_xpath = next_button_data.xpath;
    var next_or_more_button_src = next_button_data.src;
    var button = null;
    var candidate_buttons = $(next_or_more_button_tag).filter(function(){ return rightText(next_button_data, $(this), prior_next_button_text);});
    WALconsole.namedLog("findNextButton", "candidate_buttons", candidate_buttons);

    var doNumberVersion = prior_next_button_text && !isNaN(prior_next_button_text);

    //hope there's only one button
    if (candidate_buttons.length === 1 && !doNumberVersion){
      WALconsole.namedLog("findNextButton", "only one button");
      button = candidate_buttons[0];
    }
    else{
      //if not and demo button had id, try using the id
      if (next_or_more_button_id !== undefined && next_or_more_button_id !== "" && !doNumberVersion){
        WALconsole.namedLog("findNextButton", "we had an id")
        button = $("#"+next_or_more_button_id);
      }
      else{
        // if not and demo button had class, try using the class{
          var cbuttons = candidate_buttons.filter(function(){return $(this).attr("class") === next_or_more_button_class;});
          if (cbuttons.length === 1  && !doNumberVersion){
            WALconsole.namedLog("findNextButton", "filtered by class and there was only one");
            return cbuttons[0];
          }
          // ok, another case where we probably want to decide based on sharing class
          // is the case where we have numeric next buttons
          var lowestNodeSoFar = null
          if (!isNaN(prior_next_button_text)){
            WALconsole.namedLog("findNextButton", "filtered by class and now trying to do numeric");
            // let's go through and just figure out which one has the next highest number relative to the prior next button text
            var lsToSearch = cbuttons;
            if (cbuttons.length < 1){
              lsToSearch = candidate_buttons;
            }
            var priorButtonNum = parseInt(prior_next_button_text);
            var lowestNumSoFar = Number.MAX_VALUE;
            WALconsole.namedLog("findNextButton", "potential buttons", lsToSearch);
            lsToSearch.each(function(idx, li) {
              var button = $(li);
              var buttonText = button.text();
              console.log("button", button, buttonText);
              var buttonNum = parseInt(buttonText);
              console.log("comparison", buttonNum, lowestNumSoFar, priorButtonNum, buttonNum < lowestNumSoFar, buttonNum > priorButtonNum);
              if (buttonNum < lowestNumSoFar && buttonNum > priorButtonNum){
                lowestNumSoFar = buttonNum;
                lowestNodeSoFar = button;
              }
            });
          }
          if (lowestNodeSoFar){
            WALconsole.namedLog("findNextButton", "numeric worked");
            return lowestNodeSoFar.get(0);
          }
          else{
            //see which candidate has the right text and closest xpath
            var min_distance = 999999;
            var min_candidate = null;
            for (var i=0; i<candidate_buttons.length; i++){
              var candidate_xpath = nodeToXPath(candidate_buttons[i]);
              var distance = MiscUtilities.levenshteinDistance(candidate_xpath,next_or_more_button_xpath);
              if (distance<min_distance){
                min_distance = distance;
                min_candidate = candidate_buttons[i];
              }
            }
            if (min_candidate === null){
              WALconsole.log("couldn't find an appropriate 'more' button");
              WALconsole.log(next_or_more_button_tag, next_or_more_button_id, next_or_more_button_text, next_or_more_button_xpath);
            }
            console.log("all right, last restort");
            button = min_candidate;
          }
      }
    }
    WALconsole.namedLog("findNextButton", "chosen button", button);
    return button;
  }

  var nextOrMoreButtonHighlight = null;
  function highlightNextOrMoreButton(selector){
    WALconsole.log(selector);
    var button = findNextButton(selector);
    nextOrMoreButtonHighlight = Highlight.highlightNode(button, "#E04343", true);
  }

  function unHighlightNextOrMoreButton(){
    if (nextOrMoreButtonHighlight !== null){
      Highlight.clearHighlight(nextOrMoreButtonHighlight);
    }
  }

/**********************************************************************
 * Handling everything we need for actually running the next interactions during replays
 **********************************************************************/

  var currentRelationData = {};
  var nextInteractionSinceLastGetFreshRelationItems = {}; // this will be adjusted when we're in the midst of running next button interactions
  var currentRelationSeenNodes = {};
  var noMoreItemsAvailable = {};

  function scrollThroughRows(crd){
    //console.log("scrolling through the rows based on crd", crd);
    var knowTheLastElement = false;
    for (var i = 0; i < crd.length; i++){
      var row = crd[i];
      for (var j = 0; j < row.length; j++){
        var elem = row[j];
        var elemNodes = xPathToNodes(elem.xpath);
        if (elemNodes.length > 0){
          var elemNode = elemNodes[0];
          elemNode.scrollIntoView(true);
          knowTheLastElement = true;
        }
      }
    }
    return knowTheLastElement;
  }

  function scrollThroughRowsOrSpace(crd){
    // let's try scrolling to last element if we know it
    // sometimes it's important to scroll through the range of data, not go directly to the end, 
    // so we'll try scrolling to each in turn
    //console.log("crd", crd);
    if (crd){
      var knowTheLastElement = scrollThroughRows(crd);
    }
    // but if we don't know it, just try scrolling window to the bottom
    // sadly, this doesn't work for everything.  (for instance, if have an overlay with a relation, the overlay may not get scrolled w window scroll)
    if (!knowTheLastElement){
      for (var i = 0; i < 1.1; i+= 0.01){ // go past 1 because sometimes the page is still working on loading content, getting longer
        window.scrollTo(0, document.body.scrollHeight*i);
      }
    }
  }

  pub.clearRelationInfo = function _clearRelationInfo(msg){
    WALconsole.namedLog("nextInteraction", "clearing relation info", msg);
    var sid = selectorId(msg);
    delete nextInteractionSinceLastGetFreshRelationItems[sid];
    delete currentRelationData[sid];
    delete currentRelationSeenNodes[sid];
    delete noMoreItemsAvailable[sid];
    utilities.sendMessage("content", "mainpanel", "clearedRelationInfo", {});
  }

  // below the methods for actually using the next button when we need the next page of results
  // this also identifies if there are no more items to retrieve, in which case that info is stored in case someone tries to run getFreshRelationItems on us
  pub.runNextInteraction = function _runNextInteraction(msg){
    WALconsole.namedLog("nextInteraction", "running next interaction", msg);

    utilities.sendMessage("content", "mainpanel", "runningNextInteraction", {}); // todo: will this always reach the page?  if not, big trouble
    var sid = selectorId(msg);
    if (sid in currentRelationData){
      WALconsole.namedLog("nextInteraction", "sid in currentRelationData");
    }
    else{
      WALconsole.namedLog("nextInteraction", "sid not in currentRelationData");
      WALconsole.namedLog("nextInteraction", currentRelationData);
      WALconsole.namedLog("nextInteraction", "----");
      WALconsole.namedLog("nextInteraction", sid);
      for (var key in currentRelationData){
        console.log(key === sid);
        console.log(key.slice(20));
        console.log(sid.slice(20));
      }
    }
    nextInteractionSinceLastGetFreshRelationItems[sid] = true; // note that we're assuming that the next interaction for a given relation only affects that relation

    var next_button_type = msg.next_type;

    if (next_button_type === NextTypes.SCROLLFORMORE){
      WALconsole.namedLog("nextInteraction", "scrolling for more");
      var crd = currentRelationData[sid];
      scrollThroughRowsOrSpace(crd);
    }
    else if (next_button_type === NextTypes.MOREBUTTON || next_button_type === NextTypes.NEXTBUTTON){
      WALconsole.namedLog("nextInteraction", "msg.next_button_selector", msg.next_button_selector);

      var crd = currentRelationData[sid];
      if (next_button_type === NextTypes.MOREBUTTON){
        // for user understanding what's happening, it's convenient if we're using the more button for us to actually scroll through the elements
        // this isn't critical, but probably can't hurt
        scrollThroughRowsOrSpace(crd);
      }

      var button = findNextButton(msg.next_button_selector, msg.prior_next_button_text);
      if (button !== null){
        utilities.sendMessage("content", "mainpanel", "nextButtonText", {text: button.textContent});
        WALconsole.namedLog("nextInteraction", "clicked next or more button");
        console.log("About to click on node", button, button.textContent);
        button.click();
        /*
        $button = $(button);
        $button.trigger("mousedown");
        //$button.trigger("focus");
        $button.trigger("mouseup");
        $button.trigger("click");
        //$button.trigger("blur");
        */
      }
      else{
        WALconsole.namedLog("nextInteraction", "next or more button was null");
        noMoreItemsAvailable[sid] = true;
      }
    }
    else if (next_button_type === NextTypes.NONE){
      // there's no next button, so it's usually safe to assume there are no more items
      // exception is when we have, for instance, a dropdown that gets updated because of other dropdowns
      // when that happens, don't want to say there are no more items available.
      // current idea for dealing with this...just don't ask to run the next interaction in the case
      // where we know there's no next button, so this won't get set, and we can just come back and ask
      // after doing whatever causes new items, ask for new items and be pleasantly surprised that some are there
      noMoreItemsAvailable[sid] = true;
    }
    else{
      WALconsole.namedLog("nextInteraction", "Failure.  Don't know how to produce items because don't know next button type.  Guessing we just want the current page items.");
      noMoreItemsAvailable[sid] = true;
    }
  }

  pub.getFreshRelationItems = function _getFreshRelationItems(msg){
    pub.getFreshRelationItemsHelper(msg, function(respMsg){
      WALconsole.log('respMsg', respMsg);
      utilities.sendMessage("content", "mainpanel", "freshRelationItems", respMsg);
    });
  }

  function extractFromRelationRep(rel, attributes){
    var extractorFunc = function(cell){return _.map(attributes, function(a){return cell[a];});};
    var processedRel = _.map(rel, function(row){return _.map(row, function(cell){return extractorFunc(cell);});});
    return processedRel;
  }

  function mainpanelRepresentationOfRelationsEqual(r1, r2){
    var r1Visible = extractFromRelationRep(r1, ["text", "frame"]); // todo: are these the right attributes to use?
    var r2Visible = extractFromRelationRep(r2, ["text", "frame"]); // todo: are these the right attributes to use?
    return _.isEqual(r1Visible, r2Visible);
  }

  var relationFinderIdCounter = 0;
  var waitingOnPriorGetFreshRelationItemsHelper = false;
  pub.getFreshRelationItemsHelper = function _getFreshRelationItemsHelper(msg, continuation, doData=false){
    if (waitingOnPriorGetFreshRelationItemsHelper && doData === false){
      return;
    }
    var strMsg = selectorId(msg);
    WALconsole.log("noMoreItemsAvailable", noMoreItemsAvailable[strMsg], noMoreItemsAvailable);
    if (noMoreItemsAvailable[strMsg]){
      // that's it, we're done.  last use of the next interaction revealed there's nothing left
      WALconsole.log("no more items at all, because noMoreItemsAvailable was set.");
      continuation({type: RelationItemsOutputs.NOMOREITEMS, relation: null});
    }
    // below is commented out in case there are cases where after first load, it may take a while for the data to all get there (get empty list first, that kind of deal)  Does that happen or is this a wasted opportunity to cache?
    /*
    if (!nextInteractionSinceLastGetFreshRelationItems[strMsg] && (strMsg in currentRelationData)){
      // we have a cached version and the data shouldn't have changed since we cached it
      utilities.sendMessage("content", "mainpanel", "freshRelationItems", {type: RelationItemsOutputs.NEWITEMS, relation: currentRelationData[strMsg]});
      return;
    }
    */
    // ok, don't have a cached version, either because never collected before, or bc done a next interaction since then.  better grab the data afresh

    var relationNodes = pub.interpretRelationSelector(msg);
    WALconsole.log("relationNodes", relationNodes);

    // ok, let's go through these nodes and give them ids if they've never been scraped for a node before
    // then we want to figure out whether we're in a next interaction or a more interaction, so we know how to deal with info about whether we've scraped already
    var relationNodesIds = [];
    _.each(relationNodes, function(row){
      var rowIds = [];
      _.each(row, function(cell){
        var id = null;
        if (cell === null || cell === undefined) { 
          // can't save an id on null
          return;
        }
        else if (!("___relationFinderId___" in cell)){
          // have to add the relationFinderId
          id = relationFinderIdCounter;
          cell.___relationFinderId___ = id;
          relationFinderIdCounter += 1;
        }
        else{
          // already have relationFinderId saved
          id = cell.___relationFinderId___;
        }
        rowIds.push(id);

        // now, it's nice that we're able to track these rows and all, but if the page gets updated by javascript
        // or some such thing, we might keep this id and think we've already scraped something even if we haven't
        // so use mutationobserver

        // todo: might be better to do this for relationNodes items (row-by-row), rather than on a cell-by-cell basis
        // that way if any of the cells change, we believe the whole row has been updated
        // of course, this still doesn't fix the case where the list has been ajax-updated, but one of the rows is the same
        // todo: handle that
         
        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
          // get rid of the old id, now that it's essentially a different node
          delete cell.___relationFinderId___;
          // stop observing
          observer.disconnect();
        });
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true };
        // pass in the target node, as well as the observer options
        try{
          observer.observe(cell, config);
        }
        catch(err){
          WALconsole.warn("woah, couldn't observe mutations.  are we getting all data?");
        }
        
      });
      relationNodesIds.push(rowIds);
    });

    if (!(strMsg in currentRelationSeenNodes)) { currentRelationSeenNodes[strMsg] = []; }
    // if there's supposed to be a next button or more button, or scroll for more, we have to do some special processing
    if (msg.next_type === NextTypes.NEXTBUTTON || msg.next_type === NextTypes.MOREBUTTON || msg.next_type === NextTypes.SCROLLFORMORE){
      // retrieve the list of ids we've already scraped
      var alreadySeenRelationNodeIds = currentRelationSeenNodes[strMsg];
      // figure out if the new rows include nodes that were already scraped
      var newRows = [];
      var newRowsIds = [];
      for (var i = 0; i < relationNodesIds.length; i++){
        var row = relationNodesIds[i];
        // todo: should we be looking for whether some are new, or all?  requring all can fail with ajax-updated pages
        // ex: say we're scraping a bunch of papers from a single conference.  conference cell of row will stay the same,
        // so conference node won't get updated and its id won't get wiped.
        // in this case, even requiring some to be new could be a problem if we're only scraping that single column
        // so todo: come up with a better solution
        var someNew = _.reduce(row, function(acc, cell){return (acc || alreadySeenRelationNodeIds.indexOf(cell) === -1);}, false);
        if (someNew){
          newRows.push(relationNodes[i]);
          newRowsIds.push(row);
        }
      }

      // ok, now that we know which rows are actually new, what do we want to do with that information?
      if (msg.next_type === NextTypes.NEXTBUTTON){
        // this is a next interaction, so we should never have overlap.  wait until everything is new
        if (relationNodes.length !== newRows.length){
      	  WALconsole.log("sending no new items yet because we found some repeated items and it's a next button.  is that bad?");
      	  WALconsole.log("alreadySeenRelationNodeIds", alreadySeenRelationNodeIds.length, alreadySeenRelationNodeIds);
      	  WALconsole.log("relationNodes", relationNodes.length, relationNodes);
      	  WALconsole.log("newRows", newRows.length, newRows);
          // looks like some of our rows weren't new, so next button hasn't happened yet

          WALconsole.log("newRows", newRows);
          continuation({type: RelationItemsOutputs.NONEWITEMSYET, relation: null});
        }
        // otherwise we can just carry on, since the relationNodes has the right set
      }
      else{
        // ok, we're in a more-style interaction, either morebutton or scrollformore
        // the newrows are the new rows, so let's use those!
        relationNodes = newRows;
        relationNodesIds = newRowsIds;
      }
    }

    // ok, we're about to try to figure out if our new data is actual new data and consider sending it along to mainpanel
    // we know some nodes exist, but we don't know that they've loaded/finished updating yet
    // to be on the safe side, let's give them a sec
    // in fact, ideally we'd like to do better, check if they've stopped updating; todo: look into this

    if (!doData){
      // call this function again in a sec, but with doData set to true
      waitingOnPriorGetFreshRelationItemsHelper = true;
      var wait = msg.relation_scrape_wait;
      if (!wait){
        wait = DefaultHelenaValues.relationScrapeWait;
      }
      console.log("wait time", wait);
      setTimeout(function(){pub.getFreshRelationItemsHelper(msg, continuation, true);}, wait);
    }
    else{
      // great, we've waited our time and it's time to go
      waitingOnPriorGetFreshRelationItemsHelper = false;
      console.log("relationNodes", relationNodes);
      var relationData = pub.relationNodesToMainpanelNodeRepresentation(relationNodes);
      var crd = currentRelationData[strMsg];
      // we can also have the problem where everything looks new, because everything technically gets updated, 
      // even though some of it is old data, didn't need to be redrawn. so need to do a text check too
      // so that's why we'll compare to the crd, figure out whether the head looks like it's actually old data
      if (crd && crd.length === relationData.length && mainpanelRepresentationOfRelationsEqual(crd, relationData)){
        // data still looks the same as it looked before.  no new items yet.
        WALconsole.log("No new items yet because the data is actualy equal");
        WALconsole.log(crd, relationData);
        continuation({type: RelationItemsOutputs.NONEWITEMSYET, relation: null});
      }

      // whee, we have some new stuff.  we can update the state
      nextInteractionSinceLastGetFreshRelationItems[strMsg] = false;
      // we only want the fresh ones!
      var newItems = relationData; // start by assuming that's everything
      if (crd){
        WALconsole.log("crd, relationData, relationData slice", crd, relationData, relationData.slice(0,crd.length), _.isEqual(crd, relationData.slice(0, crd.length)))
      }
      if (crd && mainpanelRepresentationOfRelationsEqual(crd, relationData.slice(0, crd.length))){
        // cool, this is a case of loading more into the same page, so we want to just grab the end
        newItems = relationData.slice(crd.length, relationData.length);
      }

      // it's important that we don't wipe out the currentRelationdata[strMsg] unless we actually have new data
      // if we're doing a more interaction, might have 0 rows in an intermediate state, but then still need
      // to trim the top off the list based on having already collected the data
      if (newItems.length > 0){
        WALconsole.namedLog("nextInteraction", "setting relation info", msg);
        currentRelationData[strMsg] = relationData;
        currentRelationSeenNodes[strMsg] = _.without(currentRelationSeenNodes[strMsg].concat(_.flatten(relationNodesIds)), null);
        WALconsole.log("actual new items", newItems);
        continuation({type: RelationItemsOutputs.NEWITEMS, relation: newItems});
      }
    }

  };


return pub;}());


/***/ }),

/***/ "./src/content/setup.ts":
/*!******************************!*\
  !*** ./src/content/setup.ts ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _recording_UI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./recording_UI */ "./src/content/recording_UI.js");
/* harmony import */ var _relation_finding__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./relation_finding */ "./src/content/relation_finding.js");
/* harmony import */ var _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/misc_utilities */ "./src/common/misc_utilities.js");



window.tabId = null;
window.windowId = null;
window.currentReplayWindowId = null;
window.currentRecordingWindows = null;
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("background", "content", "tabID", function (msg) {
    console.error('This function should never be called.');
    /* TODO: only restore these if the error above triggers
    window.tabId = msg.tab_id;
    window.windowId = msg.window_id;
    window.tabTopUrl = msg.top_frame_url;
    console.log("tabId info", window.tabId, window.windowId, window.tabTopUrl); */
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "getRelationItems", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].getRelationItems(msg);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "getFreshRelationItems", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].getFreshRelationItems(msg);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "editRelation", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].editRelation(msg);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "nextButtonSelector", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].nextButtonSelector();
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "clearNextButtonSelector", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].clearNextButtonSelector();
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "currentRecordingWindows", function (msg) {
    console.error('This function should never be called.');
    /* TODO: only restore these if the error above triggers
    window.currentRecordingWindows = msg.window_ids; */
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "currentReplayWindowId", function (msg) {
    window.currentReplayWindowId = msg;
    _recording_UI__WEBPACK_IMPORTED_MODULE_0__["RecordingHandlers"].applyReplayOverlayIfAppropriate(msg.window);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "backButton", function () {
    history.back();
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "pageStats", function () {
    _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].sendMessage("content", "mainpanel", "pageStats", {
        "numNodes": document.querySelectorAll('*').length
    });
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "runNextInteraction", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].runNextInteraction(msg);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "currentColumnIndex", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].setEditRelationIndex(msg.index);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForMessage("mainpanel", "content", "clearRelationInfo", function (msg) {
    _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].clearRelationInfo(msg);
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForFrameSpecificMessage("mainpanel", "content", "likelyRelation", function (msg, sendResponse) {
    _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["MiscUtilities"].registerCurrentResponseRequested(msg, function (m) {
        var likelyRel = _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].likelyRelationWrapper(m);
        console.log('likelyRel', likelyRel);
        if (likelyRel !== null) {
            sendResponse(likelyRel);
        }
    });
});
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].listenForFrameSpecificMessage("mainpanel", "content", "getFreshRelationItems", function (msg, sendResponse) {
    var newSendResponse = function (ans) {
        _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["WALconsole"].namedLog("getRelationItems", "actually running sendResponse with arg", ans);
        sendResponse(ans);
    };
    _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["MiscUtilities"].registerCurrentResponseRequested(msg, function (m) {
        _relation_finding__WEBPACK_IMPORTED_MODULE_1__["RelationFinder"].getFreshRelationItemsHelper(m, function (freshRelationItems) {
            _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["WALconsole"].namedLog("getRelationItems", 'freshRelationItems, about to send', freshRelationItems.type, freshRelationItems);
            newSendResponse(freshRelationItems);
        });
    });
});
// keep requesting this tab's tab id until we get it
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["MiscUtilities"].repeatUntil(function () {
    _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].sendMessage("content", "background", "requestTabID", {});
}, function () {
    return (window.tabId !== null && window.windowId !== null);
}, function () { }, 1000, true);
// keep trying to figure out which window is currently being recorded until we find out
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["MiscUtilities"].repeatUntil(function () {
    _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].sendMessage("content", "mainpanel", "requestCurrentRecordingWindows", {});
}, function () {
    return (window.currentRecordingWindows !== null);
}, function () { }, 1000, true);
// keep trying to figure out which window is currently being recorded until we find out
_common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["MiscUtilities"].repeatUntil(function () {
    _common_misc_utilities__WEBPACK_IMPORTED_MODULE_2__["utilities"].sendMessage("content", "mainpanel", "currentReplayWindowId", {});
}, function () {
    return (window.currentReplayWindowId !== null);
}, function () { }, 1000, true);


/***/ })

/******/ });
//# sourceMappingURL=setup.js.map