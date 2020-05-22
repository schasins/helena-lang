'use strict';

var ContentSimpleRecord = (function ContentSimpleRecordClosure() {
  function ContentSimpleRecord() {
    // do nothing
  }

  ContentSimpleRecord.prototype = {
    addNodeAddressing: function _addNodeAddressing(callback) {
      addonPostRecord.push(callback);
    },
    addNodeRetrieval: function _addNodeRetrieval(callback) {
      addonTarget.push(callback);
    },
    getFrameId: function _getFrameId() {
      if (frameId == 'setme'){
        return null;
      }
        
      return frameId;
    },
  };

  return new ContentSimpleRecord();
})();
