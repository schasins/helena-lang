'use strict'

/**********************************************************************
 * Guide the user through making a demonstration recording
 **********************************************************************/

var HelenaUIBase = (function () {
  var pub = {};

  pub.blocklyReadjustFunc = null;
  var workspace = null;

  /**********************************************************************
   * We'll do a little setup and then we'll dig in on the real content
   **********************************************************************/

  function setUp(){
    // control blockly look and feel
    Blockly.HSV_SATURATION = 0.7;
    Blockly.HSV_VALUE = 0.97;
  }

  $(setUp);

  var toolboxId = null;
  var blocklyAreaId = null;
  var blocklyDivId = null;
  var containerId = null;
  pub.setBlocklyDivIds = function _setBlocklyDivIds(containerIdA, toolboxIdA, blocklyAreaIdA, blocklyDivIdA){
    containerId = containerIdA;
    toolboxId = toolboxIdA;
    blocklyAreaId = blocklyAreaIdA;
    blocklyDivId = blocklyDivIdA;
  }

  var helenaProg = null;
  pub.setBlocklyProgram = function _setBlocklyProgram(helenaProgObj){
    helenaProg = helenaProgObj;
    pub.blocklyReadjustFunc();
  }

  /**********************************************************************
   * Now onto the functions we'll use for controlling the UI
   **********************************************************************/


  function retrieveBlocklyComponent(componentId){
    var containerDiv = $($("#" + containerId)[0]);
    var componentDiv = containerDiv.find("#" + componentId)[0];
    return componentDiv;
  }

  pub.updateBlocklyToolbox = function _updateBlocklyToolbox(){
    WALconsole.log("updateBlocklyToolbox");
    var toolboxDiv = retrieveBlocklyComponent(toolboxId);
    var $toolboxDiv = $(toolboxDiv);

    // before we can use the toolbox, we have to actually have all the relevant blocks
    WebAutomationLanguage.updateBlocklyBlocks(helenaProg);
    
    $toolboxDiv.html("");
    for (var key in WebAutomationLanguage.blocklyLabels){
      var bls = WebAutomationLanguage.blocklyLabels[key];
      var $categoryDiv = $("<category name=" + key + ">");
      for (var i = 0; i < bls.length; i++){
        $categoryDiv.append($("<block type=\"" + bls[i] + "\"></block>"));
      }
      $toolboxDiv.append($categoryDiv);
    }
    
    if (workspace){
      workspace.updateToolbox($toolboxDiv[0]);
    }
    else{
      WALconsole.warn("Tried to update toolbox before the workspace was initialized (should be done with setUpBlocklyEditor).");
    }
  }

  function handleNewWorkspace(){
    // let's handle a little bit of blockly workspace stuff
    // specifically, we want to listen for any move events so that we can add new WAL statements to the loopy prog
    // when they're dragged in from the toolbox
    // todo: right now this only handles the case where a new block is dragged in from the toolbox
    // eventually should handle the case where existing blocks are being rearranged
    // and should keep in mind that the blocks mostly move in groupings, not just singly.  will have to test that

    // todo: reminder that the below (for now) still doesn't handle adding a new statement to the beginning of a program
    // because we focus on the block that moved rather than on the block towards which it moved...
    // todo: also, what will happen when someone moves out a big slice, then tries to move out a smaller slice and add
    // it to the already-taken-out slice?  it won't be in the root Helena program, so...we'll look for it and not find it
    // probably should have a list of other segments?  yeah, let's do that?

    function onBlockMove(event) {
      if (event.type === Blockly.Events.MOVE){
        console.log("move event", event);
        var removedSeq = null;
        // if we go from having a parent id to not having a parentId or having a different one, we need to pop some statements out
        // but if this thing was an input, not a following node, we'll do diff processing below
        if (event.oldParentId && event.oldParentId !== event.newParentId && !event.oldInputName){
          var movedBlock = workspace.getBlockById(event.blockId);
          var oldPriorBlock = workspace.getBlockById(event.oldParentId);
          // if for some reason, the movedBlock doesn't have a wal statement, we're in trouble
          var movedStatement = movedBlock.WALStatement;
          var oldPriorStatement = oldPriorBlock.WALStatement;
          removedSeq = helenaProg.statementRemovedByUI(movedStatement, oldPriorStatement);
        }
        // if we go from no parent id or one parentId to different parent id, have to pop some statements in
        // remember, the below is not an else if, because we could be popping off one parent and onto the next in a single move
        // also, remember this isn't what we should do if we're adding to an input rather than dealing with sequences
        if (event.newParentId && event.newParentId !== event.oldParentId && !event.newInputName){
          // ok, a new connection has been made
          console.log("move event is new connection");
          var movedBlock = workspace.getBlockById(event.blockId);
          var priorStatementBlock = workspace.getBlockById(event.newParentId);
          // if for some reason, the movedBlock doesn't have a wal statement, we're in trouble
          var movedStatement = movedBlock.WALStatement;
          var precedingStatement = priorStatementBlock.WALStatement;
          helenaProg.statementAddedByUI(movedStatement, precedingStatement, event.newInputName);
          // ok, sometimes this is going to be raised because we're programmatically constructing the right
          // program in the workspace.  which means it's not a real insertion.  The way we're going to figuer that out
          // is we'll just see if the 'new' statement is actually already in there
        }
        // now the same deal for inputs
        // remember, it might have moved to a new input slot by switching to a new parent or to a new input of the same parent
        if (event.oldInputName && (event.oldParentId !== event.newParentId || event.oldInputName !== event.newInputName)){
          var movedBlock = workspace.getBlockById(event.blockId);
          var oldParentBlock = workspace.getBlockById(event.oldParentId);
          // if for some reason, the movedBlock doesn't have a wal statement, we're in trouble
          var movedBlockWAL = movedBlock.WALStatement; // not really necessarilty a statment, but..
          var oldParentBlockWAL = oldParentBlock.WALStatement;
          removedSeq = helenaProg.inputRemovedByUI(movedStatement, oldParentBlockWAL, event.oldInputName);
        }
        // if we go from no parent id or one parentId to different parent id, have to pop some statements in
        // remember, the below is not an else if, because we could be popping off one parent and onto the next in a single move
        // remember, it might have moved to a new input slot by switching to a new parent or to a new input of the same parent
        if (event.newParentId && (event.oldParentId !== event.newParentId || event.oldInputName !== event.newInputName)){
          var movedBlock = workspace.getBlockById(event.blockId);
          var newStatementBlock = workspace.getBlockById(event.newParentId);
          // if for some reason, the movedBlock doesn't have a wal statement, we're in trouble
          var movedBlockWAL = movedBlock.WALStatement; // not really necessarilty a statment, but..
          var newStatementBlockWAL = newStatementBlock.WALStatement;
          helenaProg.inputAddedByUI(movedBlockWAL, newStatementBlockWAL, event.newInputName);
        }
      }
      if (pub.newBlocklyBlockDraggedIn && event.type === Blockly.Events.CREATE){
        var createdBlock = workspace.getBlockById(event.blockId);
        pub.newBlocklyBlockDraggedIn(createdBlock);
      }
    }
    workspace.addChangeListener(onBlockMove);
  }

  pub.blocklyReadjustFunc = function _blocklyReadjustFunc(e){
    var blocklyArea = retrieveBlocklyComponent(blocklyAreaId);
    var blocklyDiv = retrieveBlocklyComponent(blocklyDivId);
    if (!blocklyArea || !blocklyDiv){
      return;
    }
    // compute the absolute coordinates and dimensions of blocklyArea.
    var element = blocklyArea;
    var x = 0;
    var y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    blocklyDiv.style.left = x + 'px';
    blocklyDiv.style.top = y + 'px';
    blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
    blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  };

  var maxWaitsForDivAppearance = 10;
  var currWaitsForDivAppearance = 0;
  pub.setUpBlocklyEditor = function _setUpBlocklyEditor(updateToolbox){
    if (updateToolbox === undefined){updateToolbox = true;}
    WALconsole.log("handleBlocklyEditorResizing");
    var toolboxDiv = retrieveBlocklyComponent(toolboxId);
    var blocklyArea = retrieveBlocklyComponent(blocklyAreaId);
    var blocklyDiv = retrieveBlocklyComponent(blocklyDivId);
    if (!blocklyArea || !blocklyDiv){
      WALconsole.warn("Tried to set up the blockly editor display, but the blockly area or div not present now.");
      console.log(blocklyArea, blocklyDiv);
      if (currWaitsForDivAppearance < maxWaitsForDivAppearance){
        setTimeout(pub.setUpBlocklyEditor, 100);
        currWaitsForDivAppearance += 1;
      }
      return;
    }

    workspace = Blockly.inject(blocklyDiv, {toolbox: toolboxDiv});
    console.log("Updated workspace to:", workspace);
    handleNewWorkspace(workspace);

    window.addEventListener('resize', function(){pub.blocklyReadjustFunc();}, false);
    pub.blocklyReadjustFunc();
    // the blockly thing hovers over a node, so it's important that we call its update function whenever that node may have moved
    var observer = new MutationObserver(function(mutations, observer) {
        pub.blocklyReadjustFunc();
    });
    // Register the element root you want to look for changes
    observer.observe(document, {
      subtree: true,
      attributes: true
    });

    Blockly.svgResize(workspace);


    if (updateToolbox){
      pub.updateBlocklyToolbox(toolboxDiv);
    }
  };

  pub.displayBlockly = function _displayBlockly(program){
    pub.updateBlocklyToolbox();
    if (program){
      program.displayBlockly(workspace);
    }
    else{
      WALconsole.warn("Called displayBlockly, but no program to display yet.  Should be set with setBlocklyProgram.");
    }
  };

  return pub;
}());


