'use strict'

/**********************************************************************
 * Server interaction helper functions
 **********************************************************************/

var HelenaServerInteractions = (function () {
  var pub = {};

  pub.loadSavedPrograms = function _loadSavedPrograms(handler){
    WALconsole.log("loading programs");
    var toolId = WebAutomationLanguage.getHelenaToolId();
    console.log("toolId", toolId);
    MiscUtilities.getAndReGetOnFailure(helenaServerUrl+'/programs/', {tool_id: toolId}, function(response){
      handler(response);
    },true," to retrieve saved programs");
  };

  pub.loadSavedDataset = function _loadSavedDataset(datasetId, handler){
    WALconsole.log("loading dataset: ", datasetId);
    MiscUtilities.getAndReGetOnFailure(helenaServerUrl+'/programfordataset/'+datasetId, {}, function(response){
      var progId = response.program_id;
      handler(progId);
    },true," to load the saved dataset");
  };

  pub.loadSavedProgram = function _loadSavedProgram(progId, handler){
    WALconsole.log("loading program: ", progId);
    MiscUtilities.getAndReGetOnFailure(helenaServerUrl+'/programs/'+progId, {}, function(response){
      WALconsole.log("received program: ", response);
      handler(response);
    },true," to load the saved program");
  };

  return pub;
}());


