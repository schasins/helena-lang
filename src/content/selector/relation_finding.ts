import * as $ from "jquery";

import { PulldownSelector, ContentSelector, ComparisonSelector,
  RelationSelector, TableSelector } from "./relation_selector";

import { ColumnSelector } from "./column_selector";
import ColumnSelectorI = ColumnSelector.Interface;

import { NextButtonSelector } from "./next_button_selector";

import { MainpanelNode } from "../../common/mainpanel_node";
import MainpanelNodeI = MainpanelNode.Interface;

import { XPath } from "../utils/xpath";
import SuffixXPathList = XPath.SuffixXPathList;

import { EditRelationMessage, LikelyRelationMessage,
  FreshRelationItemsMessage } from "../../common/messages";

export interface ScrapedElement extends HTMLElement {
  ___relationFinderId___?: number;
}

export namespace RelationFinder {

/**********************************************************************
 * How to actually synthesize the selectors used by the relation-finder above
 **********************************************************************/

  /**
   * Returns the XPath expression in xpaths that are not a component of any of
   *   the xpaths of the cells.
   * @param xpaths XPath expressions
   * @param cells cells in mainpanel representation
   */
  function unmatchedXpaths(xpaths: string[], cells: MainpanelNodeI[]) {
    let cellXPaths = cells.map((cell) => cell.xpath);
    return xpaths.filter((xpath) => !cellXPaths.includes(xpath));
  }

  let processedCount = 0;
  let processedLikelyRelationRequest = false;
  /**
   * Retrieve the {@link RelationSelector} of the most likely relation given
   *   the information in the message.
   * @param msg message about likely relation
   */
  export function likelyRelation(msg: LikelyRelationMessage) {
    if (processedLikelyRelationRequest) {
      // should only even send a likely relation once from one page, since it
      //   gets closed after we get the answer we wanted may end up sending
      //   multiples if we're sent the inciting message multiple times because
      //   the page loads slowly
      return;
    }

    let xpaths = msg.xpaths;

    // we're going to do something a little different for the case where one or
    //   more nodes come from pulldown menus
    let pulldownxpaths: string[] = [];
    if (xpaths) {
      for (const xpath of xpaths) {
        if (xpath.toLowerCase().includes("/select[")) {
          // ok, we've grabbed something from a pulldown
          pulldownxpaths.push(xpath);
        }
      }      
    }

    // for pulldown xpaths, we'll do something different
    let pulldownRelations = PulldownSelector.fromXPaths(msg, pulldownxpaths);

    // for the non-pulldown xpaths, we'll proceed with normal processing
    let nonPulldownXPaths = xpaths.filter((xpath) =>
      !pulldownxpaths.includes(xpath));

    let elements = XPath.getFirstElementOfEach(nonPulldownXPaths);

    let maxNodesCoveredByServerRelations = 0;
    let serverSuggestedRelations = msg.serverSuggestedRelations;
    if (serverSuggestedRelations){
      for (const rel of serverSuggestedRelations) {
        if (!rel) {
          continue;
        }
        let columns = rel.columns;
        let relXpaths = columns.map((col: ColumnSelectorI) => col.xpath);
        window.WALconsole.log(relXpaths);

        let matched = 0;
        for (const xpath of nonPulldownXPaths) {
          if (relXpaths.includes(xpath)) {
            matched += 1;
          }
        }

        if (matched > maxNodesCoveredByServerRelations){
          maxNodesCoveredByServerRelations = matched;
        }
      }
      window.WALconsole.log("maxNodesCoveredByServerRelations",
        maxNodesCoveredByServerRelations);
    }

    // if this is actually in an html table, let's take a shortcut, since some
    //   sites use massive tables and trying to run the other approach would
    //   take forever
    let selector: TableSelector | ContentSelector | null =
      TableSelector.fromTableRow(elements);

    if (selector === null) {
      // ok, no table, we have to do the standard, possibly slow approach
      selector = ContentSelector.fromLargestRowSubset(elements,
        maxNodesCoveredByServerRelations + 1);
    }
    if (selector === null) {
      selector = new ContentSelector({}, 0, []);
      selector.relation = [];
      console.warn("Generated empty selector, not sure what it means.");
    }

    // this (above) is the candidate we auto-generate from the page, but want to
    //   compare to the relations the server-suggested criteria.
    let bestSelectorIsNew = true;
    let curBestSelector = selector.toComparisonSelector(
      MainpanelNode.convertRelation(selector.relation),
      xpaths);

    if (serverSuggestedRelations) {
      for (const serverSelector of serverSuggestedRelations) {
        if (serverSelector === null) {
          continue;
        }
        // let serverSelector = RelationSelector.fromMessage(serverRel);
        let relationNodes = serverSelector.getMatchingRelation();
        if (relationNodes.length === 0){
          // no need to consider empty one
          continue;
        }
        
        let compServerSel = serverSelector.toComparisonSelector(
          MainpanelNode.convertRelation(relationNodes), xpaths);

        // use the server-provided rel as our default, since that'll make the
        //   server-side processing when we save the relation easier, and also
        //   gives us the nice names
        let newBestSelector = ComparisonSelector.bestOf(compServerSel,
          curBestSelector);
        if (newBestSelector !== curBestSelector){
          curBestSelector = newBestSelector;
          bestSelectorIsNew = false;
        }
      }
    }

    // ok, we've picked our best selector.  of course, it's possible it doesn't
    //   cover all columns if it doesn't cover all columns, we're willing to add
    //   up to one more supplementary selector
    // todo: in future, consider adding more than one additional selector --
    //   may need up to one selector per column but for now, we'll try one
    let uncoveredSoFar = unmatchedXpaths(xpaths, curBestSelector.relation[0]);
    window.WALconsole.log("uncoveredSoFar", uncoveredSoFar);
    if (uncoveredSoFar.length > 0) {
      // let's see if we can cover as many as possible of the remaining nodes
      let uncoveredNodes = XPath.getFirstElementOfEach(uncoveredSoFar);
      let newSelector = ContentSelector.fromLargestRowSubset(uncoveredNodes, 0);
      
      // now reason about the length of the lists and whether it even makes
      //   sense to pair them
      if (newSelector &&
        curBestSelector.relation?.length === newSelector.relation?.length){
        window.WALconsole.log("We're adding an additional selector.", newSelector);
        curBestSelector.merge(newSelector);
        let rel = curBestSelector.getMatchingRelation();
        curBestSelector.relation = MainpanelNode.convertRelation(rel);
        window.WALconsole.log("currBestSelector.relation", curBestSelector.relation);
      }
    }

    // this pageVarName is used by the mainpanel to keep track of which pages
    //   have been handled already
    let resultSelector = new RelationSelector(curBestSelector.selector,
      curBestSelector.exclude_first, curBestSelector.columns);
    resultSelector.first_page_relation = curBestSelector.relation;
    resultSelector.num_rows_in_demonstration = curBestSelector.relation.length;
    resultSelector.page_var_name = msg.pageVarName;
    resultSelector.url = window.location.href;

    if (bestSelectorIsNew) {
      resultSelector.relation_id = null;
      resultSelector.name = null;
      // we always guess that there are no more items (no more pages), and user
      //   has to correct it if this is not the case
      resultSelector.next_type = window.NextTypes.NONE;
      resultSelector.next_button_selector = null;
    } else {
      resultSelector.relation_id = curBestSelector.id;
      resultSelector.name = curBestSelector.name;
      resultSelector.next_type = curBestSelector.next_type;
      resultSelector.next_button_selector =
        curBestSelector.next_button_selector;
    }
    window.WALconsole.log("currBestSelector", curBestSelector);

    if (pulldownRelations.length > 0){
      resultSelector.pulldown_relations = pulldownRelations;
    }

    if (curBestSelector.relation.length < 1 && pulldownRelations.length < 1) {
      processedCount += 1;
      if (processedCount < 10) {
        // ok, looks like we don't actually have any data yet.  might be because
        // data hasn't fully loaded on page yet the mainpanel will keep asking
        // for likelyrelations, so let's wait a while, see if the next time
        // works; try 10 times
        // todo: not sure this is where we want to deal with this?
        return null;
      }
    }

    //window.utilities.sendMessage("content", "mainpanel", "likelyRelation", newMsg);
    processedLikelyRelationRequest = true;
    return resultSelector; // return rather than sendmessage because it's a builtin response handler one
  }

  /**
   * Send relation matching selector to mainpanel.
   * @param selector selector
   */
  export function sendMatchingRelationToMainpanel(selector: RelationSelector) {
    if (!selector.selector_version){
      console.error("No selector version!!!");
    }
    let relation = selector.getMatchingRelation();
    let relationData = MainpanelNode.convertRelation(relation);
    window.utilities.sendMessage("content", "mainpanel", "relationItems", 
      { relation: relationData });
    return relationData;
  }

/**********************************************************************
 * Everything we need for editing a relation selector
 **********************************************************************/

  let currentSelectorToEdit: ContentSelector | null = null;
  let currentSelectorEmptyOnThisPage = false;
  export function editRelation(selector: RelationSelector) {
    if (currentSelectorToEdit !== null) {
      // we've already set up to edit a selector, and we should never use the
      //   same tab to edit multiples always close tab and reload.  so don't run
      //   setup again
      return;
    }
    // window.utilities.sendMessage("mainpanel", "content", "editRelation", {selector: this.selector, selector_version: this.selectorVersion, exclude_first: this.excludeFirst, columns: this.columns}, null, null, [tab.id]);};
    currentSelectorToEdit = <ContentSelector> selector;

    // TODO: cjbaik: move this to some place for all document listeners
    document.addEventListener('click', editingClick, true);

    // don't try to process the page till it's loaded!  jquery onloaded stuff
    //   will run immediately if page already loaded, once loaded else
    let editingSetup = function() {
      if (!currentSelectorToEdit) {
        throw new ReferenceError('Current selector to edit is null!');
      }

      let contentSelector = currentSelectorToEdit.toContentSelector();
      if (contentSelector.relation.length < 1) {
        // ugh, but maybe the page just hasn't really finished loading, so try again in a sec
        // setTimeout(editingSetup, 1000);
	      // but also need to send the editing colors just in case
	      sendEditedSelectorToMainpanel(contentSelector);
        currentSelectorEmptyOnThisPage = true;
        return;
      }
      highlightSelector(contentSelector);
      // start with the assumption that the first row should definitely be included
      selector.positive_nodes = [
        XPath.findCommonAncestor(contentSelector.relation[0]),
        XPath.findCommonAncestor(contentSelector.relation[1])
      ];
      selector.negative_nodes = [];
      sendEditedSelectorToMainpanel(contentSelector);
      if (selector.next_type === window.NextTypes.NEXTBUTTON ||
          selector.next_type === window.NextTypes.MOREBUTTON) {
        NextButtonSelector.highlightNextButton(
          <NextButtonSelector.Interface> selector.next_button_selector);
      }

      // we want to highlight the currently hovered node
      // TODO: cjbaik: move this document event listener? esp if editRelation
      //   gets called multiple times...
      document.addEventListener('mouseenter', highlightHovered, true);

      // also, if we have a selector highlighted, and the user scrolls, we're
      //   going to need to update...
      // TODO: cjbaik: move this too
      let didScroll = false;
      document.addEventListener('scroll', (e) => didScroll = true );
      
      // cjbaik: formerly, I don't think the '*' was desired behavior?
      // $('*').scroll(function () {
      //   didScroll = true;
      // });

      setInterval(function () {
        if ( didScroll ) {
          didScroll = false;
          // Ok, we're ready to redo the relation highlighting with new page
          //   situation
          window.WALconsole.log("scroll updating");
          newSelectorGuess(contentSelector);
        }
        }, 250);
    };

    $(editingSetup);
  }

  export function setEditRelationIndex(index: number) {
    if (!currentSelectorToEdit) {
      throw new ReferenceError('No selector to edit!');
    }
    currentSelectorToEdit.editingClickColumnIndex = index;
  }

  let currentHoverHighlight: JQuery<HTMLElement> | null = null;
  function highlightHovered(event: Event) {
    let prevHoverHighlight = currentHoverHighlight;
    let color = "#9D00FF";
    if (NextButtonSelector.listeningForNextButtonClick) {
      color = "#E04343";
    }
    if (prevHoverHighlight) {
      prevHoverHighlight.remove();
      prevHoverHighlight = null;
    }
    currentHoverHighlight = window.Highlight.highlightNode(event.target, color);
  }

  let currentSelectorHighlightNodes: JQuery<HTMLElement>[] = [];
  export function highlightSelector(selector: ContentSelector) {
    // we want to allow clicks on the highlights (see editingClick)
    currentSelectorHighlightNodes =
      window.helenaContent.relationHighlighter.highlightRelation(
        selector.relation, true, true);
  };

  export function highlightCurrentSelector() {
    if (!currentSelectorToEdit) {
      throw new ReferenceError('No selector to highlight!');
    }
    highlightSelector(currentSelectorToEdit);
  }

  /**
   * Send edited selector to the mainpanel.
   * @param selector selector
   */
  export function sendEditedSelectorToMainpanel(selector: RelationSelector) {
    if (!selector.relation) {
      throw new ReferenceError("Relation not set on selector.");
    }

    let mainpanelSelector = <RelationSelector & EditRelationMessage> selector;

    mainpanelSelector.demonstration_time_relation =
      MainpanelNode.convertRelation(
        <(HTMLElement | null)[][]> selector.relation
    );
    mainpanelSelector.relation = null;
    mainpanelSelector.colors =
      window.helenaContent.relationHighlighter.highlightColors;

    window.utilities.sendMessage("content", "mainpanel", "editRelation",
      mainpanelSelector);
  }

  export function clearCurrentSelectorHighlight(){
    for (var i = 0; i < currentSelectorHighlightNodes.length; i++) {
      window.Highlight.clearHighlight(currentSelectorHighlightNodes[i]);
    }
    currentSelectorHighlightNodes = [];
  };

  export function newSelectorGuess(selector: RelationSelector) {
    let contentSelector = selector.toContentSelector();
    clearCurrentSelectorHighlight();
    highlightSelector(contentSelector);
    sendEditedSelectorToMainpanel(contentSelector);
  }

  function findAncestorLikeSpec(specAncestor: HTMLElement,
    element: HTMLElement) {
    //will return exactly the same node if there's only one item in first_row_items
    window.WALconsole.log("findAncestorLikeSpec", specAncestor, element);
    let spec_xpath_list = XPath.toXPathNodeList(
      <string> XPath.fromNode(specAncestor));
    let xpath_list = XPath.toXPathNodeList(<string> XPath.fromNode(element));
    let ancestor_xpath_list = xpath_list.slice(0,spec_xpath_list.length);
    let ancestor_xpath_string = XPath.toString(ancestor_xpath_list);
    let ancestor_xpath_nodes = XPath.getNodes(ancestor_xpath_string);
    return <HTMLElement> ancestor_xpath_nodes[0];
  }

  let targetsSoFar: HTMLElement[] = [];
  function editingClick(event: MouseEvent) {
    if (!currentSelectorToEdit) {
      throw new ReferenceError('No selector to edit!');
    }

    if (NextButtonSelector.listeningForNextButtonClick) {
      // don't want to do normal editing click...
      NextButtonSelector.record(event);
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    let target = <HTMLElement> event.target;

    if (currentSelectorEmptyOnThisPage) {
      // ok, it's empty right now, need to make a new one
      if (currentSelectorToEdit.origSelector === undefined) {
        // deepcopy
        currentSelectorToEdit.origSelector = JSON.parse(
          JSON.stringify(currentSelectorToEdit)
        );
      }
      targetsSoFar.push(target);

      let newSelector = ContentSelector.fromRow(targetsSoFar);
      // just the individual selector that we want to play with
      currentSelectorToEdit.currentIndividualSelector = newSelector;
      currentSelectorToEdit.origSelector!.merge(newSelector);
      currentSelectorToEdit.selector = currentSelectorToEdit.origSelector!.selector;
      currentSelectorToEdit.columns = currentSelectorToEdit.origSelector!.columns;
      //currentSelectorToEdit = newSelector;
      newSelectorGuess(currentSelectorToEdit);
      // and let's go back to using .selector as the current one we want to edit and play with
      currentSelectorToEdit.selector =
        currentSelectorToEdit.currentIndividualSelector;
      currentSelectorToEdit.positive_nodes = [ target ];
      currentSelectorEmptyOnThisPage = false;
      return;
    }

    if (!currentSelectorToEdit.positive_nodes) {
      throw new ReferenceError('Selector contains no positive_nodes.');
    }

    let removalClick = false;
    // it's only a removal click if the clicked item is a highlight
    if (window.Highlight.isHighlight(target)) {
      removalClick = true;
      // actual target is the one associated with the highlight
      target = window.Highlight.getHighligthedNodeFromHighlightNode(target);
      // recall the target itself may be the positive example, as when there's
      //   only one column
      let nodeToRemove = target; 
      if (!currentSelectorToEdit.positive_nodes.includes(target)) {
        // ok it's not the actual node, better check the parents
        let parents = $(target).parents(); 
        for (let i = parents.length - 1; i > 0; i--){
          let parent = parents[i];
          let index = currentSelectorToEdit.positive_nodes.indexOf(parent);
          if (index > -1) {
            // ok, so this click is for removing a node.  removing the row?
            //   removing the column? not that useful to remove a column, so 
            //   probably for removing a row...
            nodeToRemove = parent;
            break;
          }
        }
      }
      // actually remove the node from positive, add to negative
      let ind = currentSelectorToEdit.positive_nodes.indexOf(nodeToRemove);
      currentSelectorToEdit.positive_nodes.splice(ind, 1);
      if (!currentSelectorToEdit.negative_nodes){
        currentSelectorToEdit.negative_nodes = [];
      }
      currentSelectorToEdit.negative_nodes.push(nodeToRemove);
    }
    // we've done all our highlight stuff, know we no longer need that
    // dehighlight our old list
    currentSelectorHighlightNodes.forEach(window.Highlight.clearHighlight);

    if (!removalClick) {
      // ok, so we're trying to add a node.  is the node another cell in an
      //   existing row?  or another row?  could be either.
      // for now we're assuming it's always about adding rows, since it's
      //   already possible to add columns by demonstrating first row

      let newCellInExistingRow = false;
      if (newCellInExistingRow) {
        // for now, assume it's another cell in an existing row
        // todo: give the user an interaction that allows him or her say it's
        //   actually another row
        // todo: put some kind of outline around the ones we think of the user
        //   as having actually demonstrated to us?  the ones we're actually
        //   using to generate the selector?  so that he/she knows which to
        //   actually click on to change things
        // maybe green outlines (or color-corresponding outlines) around the
        //   ones we're trying to include, red outlines around the ones we're
        //   trying to exclude.

        // let's figure out which row it should be
        // go through all rows, find common ancestor of the cells in the row +
        //   our new item, pick whichever row produces an ancestor deepest in
        //   the tree
        let currRelation = currentSelectorToEdit.relation;
        let deepestCommonAncestor = null;
        let deepestCommonAncestorDepth = 0;
        let currRelationIndex = 0;
        for (let i = 0; i < currRelation.length; i++){
          let nodes = currRelation[i];
          let ancestor = XPath.findCommonAncestor(nodes.concat([target]));
          let depth = $(ancestor).parents().length;
          if (depth > deepestCommonAncestorDepth){
            deepestCommonAncestor = ancestor;
            deepestCommonAncestorDepth = depth;
            currRelationIndex = i;
          }
        }

        if (!deepestCommonAncestor) {
          throw new ReferenceError('No deepestCommonAncestor found.');
        }

        let columns = ColumnSelector.compute(deepestCommonAncestor,
          currRelation[currRelationIndex].concat([ target ]));
        currentSelectorToEdit.columns = columns;

        // let's check whether the common ancestor has actually changed.
        //   if no, this is easy and we can just change the columns
        //   if yes, it gets more complicated
        let origAncestor = XPath.findCommonAncestor(
          currRelation[currRelationIndex]);
        let newAncestor = XPath.findCommonAncestor(
          currRelation[currRelationIndex].concat([target]));
        if (origAncestor === newAncestor) {
          // we've already updated the columns, so we're ready
          newSelectorGuess(currentSelectorToEdit);
          return;
        }
        // drat, the ancestor has actually changed.
        // let's assume that all the items in our current positive nodes list
        //   will have *corresponding* parent nodes...  (based on difference in
        //   depth.  not really a good assumption, but we already assume that we
        //   have fixed xpaths to get to subcomponents, so we're already making
        //   that assumption)
        let xpath = <string> XPath.fromNode(newAncestor);
        let xpathlen = xpath.split("/").length;
        let xpathO = <string> XPath.fromNode(origAncestor);
        let xpathlenO = xpathO.split("/").length;
        let depthDiff = xpathlenO - xpathlen;
        for (let i = 0; i < currentSelectorToEdit.positive_nodes.length; i++) {
          let ixpath = <string> XPath.fromNode(
            currentSelectorToEdit.positive_nodes[i]);
          let components = ixpath.split("/");
          components = components.slice(0, components.length - depthDiff);
          let newxpath = components.join("/");
          currentSelectorToEdit.positive_nodes[i] =
            <HTMLElement> XPath.getNodes(newxpath)[0];
        }
        if (!currentSelectorToEdit.positive_nodes.includes(
          deepestCommonAncestor)) {
          currentSelectorToEdit.positive_nodes.push(deepestCommonAncestor);
        }
      } else {
        // this one's the easy case!  the click is telling us to add a row,
        //   rather than to add a cell to an existing row or it may be telling
        //   us to add a cell in an existing row to an existing column, which
        //   also should not require us to change the ancestor node.  if it does
        //   require changing the ancestor node,then we will run into trouble
        //   bc won't find appropriate ancestor
        // TODO: better structure available here?  maybe merge this and the above?
        let appropriateAncestor = findAncestorLikeSpec(
          currentSelectorToEdit.positive_nodes[0], target);
        if (!currentSelectorToEdit.editingClickColumnIndex) {
          throw new ReferenceError('editingClickColumnIndex not set');
        }
        let currColumnObj = currentSelectorToEdit.columns[
          currentSelectorToEdit.editingClickColumnIndex];
        let currSuffixes = <XPath.SuffixXPathList[]> currColumnObj.suffix;

        // is this suffix already in our suffixes?  if yes, we can just add the
        //   ancestor/row node, don't need to mess with columns
        let newSuffix = XPath.suffixFromAncestor(appropriateAncestor, target);
        let newSuffixAlreadyPresent = currSuffixes.some(
          (suffix: SuffixXPathList) => {
            if (suffix.length !== newSuffix.length) { return false; }
            for (let i = 0; i < newSuffix.length; i++) {
              if (newSuffix[i].nodeName !== suffix[i].nodeName ||
                  newSuffix[i].iterable !== suffix[i].iterable ||
                  newSuffix[i].index !== suffix[i].index) {
                return false;
              }
            }
            return true;
          }
        );

        if (!newSuffixAlreadyPresent) {
          // ok it's not in our current suffixes, so we'll have to make the new
          //   suffixes list
          currSuffixes.push(newSuffix);     
          currColumnObj.suffix = currSuffixes;     
        }
    
        // is this ancestor node already in our positive_nodes?  if no, make new
        //   selector.  if yes, we're already set
        if (!currentSelectorToEdit.positive_nodes.includes(
          appropriateAncestor)) {
          // this ancestor node (row node) is new to us, better add it to the
          //   positive examples
          currentSelectorToEdit.positive_nodes.push(appropriateAncestor);
        }
      }
    }

    if (!currentSelectorToEdit.negative_nodes) {
      throw new ReferenceError('Selector does not contain any negative nodes.');
    }

    let newSelector = RelationSelector.fromPositiveAndNegativeElements(
      currentSelectorToEdit.positive_nodes,
      currentSelectorToEdit.negative_nodes,
      currentSelectorToEdit.columns);
    newSelector.next_type = currentSelectorToEdit.next_type;
    newSelector.next_button_selector =
      currentSelectorToEdit.next_button_selector;
    newSelector.name = currentSelectorToEdit.name;
    newSelector.id = currentSelectorToEdit.id;
    newSelector.url = currentSelectorToEdit.url;
    
    newSelectorGuess(newSelector);
    currentSelectorToEdit = <ContentSelector> newSelector;
  }

/**********************************************************************
 * Handling everything we need for actually running the next interactions during replays
 **********************************************************************/

  let currentRelationData: {
    [key: string]: any;     // TODO: cjbaik: not sure what value types are
  } = {};
  // this will be adjusted when we're in the midst of running next button
  //   interactions
  let nextInteractionSinceLastGetFreshRelationItems: {
    [key: string]: boolean;
  } = {};
  let currentRelationSeenNodes: {
    [key: string]: number[]
  } = {};
  let noMoreItemsAvailable: {
    [key: string]: boolean;
  } = {};

  function scrollThroughRows(relation: MainpanelNodeI[][]) {
    //console.log("scrolling through the rows based on crd", crd);
    let knowTheLastElement = false;
    for (let i = 0; i < relation.length; i++){
      let row = relation[i];
      for (let j = 0; j < row.length; j++){
        let elem = row[j];
        let elemNodes = <HTMLElement[]> XPath.getNodes(elem.xpath);
        if (elemNodes.length > 0){
          let elemNode = elemNodes[0];
          elemNode.scrollIntoView(true);
          knowTheLastElement = true;
        }
      }
    }
    return knowTheLastElement;
  }

  function scrollThroughRowsOrSpace(relation: MainpanelNodeI[][]) {
    // let's try scrolling to last element if we know it
    // sometimes it's important to scroll through the range of data, not go
    //   directly to the end, so we'll try scrolling to each in turn
    let knowTheLastElement = null;
    if (relation) {
      knowTheLastElement = scrollThroughRows(relation);
    }
    // but if we don't know it, just try scrolling window to the bottom
    //   sadly, this doesn't work for everything.  (for instance, if have an
    //   overlay with a relation, the overlay may not get scrolled w window
    //   scroll)
    if (!knowTheLastElement) {
      // go past 1 because sometimes the page is still working on loading
      //   content, getting longer
      for (let i = 0; i < 1.1; i+= 0.01) { 
        window.scrollTo(0, document.body.scrollHeight * i);
      }
    }
  }

  export function clearRelationInfo(selector: RelationSelector) {
    window.WALconsole.namedLog("nextInteraction", "clearing relation info",
      selector);
    let sid = selector.hash();
    delete nextInteractionSinceLastGetFreshRelationItems[sid];
    delete currentRelationData[sid];
    delete currentRelationSeenNodes[sid];
    delete noMoreItemsAvailable[sid];
    window.utilities.sendMessage("content", "mainpanel", "clearedRelationInfo",
      {});
  }

  /**
   * Run the interaction needed to retrieve the next page of results (using the
   *   next/more/pagination buttons). If there are no more items to retrieved,
   *   the information is stored for the next time {@link getFreshRelationItems}
   *   is called.
   * @param selector relation selector
   */
  export function getNextPage(selector: RelationSelector) {
    window.WALconsole.namedLog("nextInteraction", "running next interaction",
      selector);

    // todo: will this always reach the page?  if not, big trouble
    window.utilities.sendMessage("content", "mainpanel",
      "runningNextInteraction", {});

    let sid = selector.hash();
    if (sid in currentRelationData) {
      window.WALconsole.namedLog("nextInteraction",
        "sid in currentRelationData");
    } else {
      window.WALconsole.namedLog("nextInteraction",
        "sid not in currentRelationData");
      window.WALconsole.namedLog("nextInteraction", currentRelationData);
      window.WALconsole.namedLog("nextInteraction", "----");
      window.WALconsole.namedLog("nextInteraction", sid);
      for (const key in currentRelationData){
        console.log(key === sid);
        console.log(key.slice(20));
        console.log(sid.slice(20));
      }
    }

    // note that we're assuming that the next interaction for a given relation
    //   only affects that relation
    nextInteractionSinceLastGetFreshRelationItems[sid] = true; 

    let nextButtonType = selector.next_type;

    if (nextButtonType === window.NextTypes.SCROLLFORMORE) {
      window.WALconsole.namedLog("nextInteraction", "scrolling for more");
      let crd = currentRelationData[sid];
      scrollThroughRowsOrSpace(crd);
    } else if (nextButtonType === window.NextTypes.MOREBUTTON ||
      nextButtonType === window.NextTypes.NEXTBUTTON) {
      window.WALconsole.namedLog("nextInteraction", "msg.next_button_selector",
        selector.next_button_selector);

      let crd = currentRelationData[sid];
      if (nextButtonType === window.NextTypes.MOREBUTTON) {
        // for user understanding what's happening, it's convenient if we're using the more button for us to actually scroll through the elements
        // this isn't critical, but probably can't hurt
        scrollThroughRowsOrSpace(crd);
      }

      let button = NextButtonSelector.findNextButton(
        <NextButtonSelector.Interface> selector.next_button_selector,
        selector.prior_next_button_text);
      if (button) {
        window.utilities.sendMessage("content", "mainpanel", "nextButtonText",
          { text: button.textContent });
        window.WALconsole.namedLog("nextInteraction",
          "clicked next or more button");
        console.log("About to click on node", button, button.textContent);
        button.click();
      } else {
        window.WALconsole.namedLog("nextInteraction",
          "next or more button was null");
        noMoreItemsAvailable[sid] = true;
      }
    } else if (nextButtonType === window.NextTypes.NONE) {
      // there's no next button, so it's usually safe to assume there are no
      //   more items exception is when we have, for instance, a dropdown that
      //   gets updated because of other dropdowns when that happens, don't want
      //   to say there are no more items available. current idea for dealing
      //   with this...just don't ask to run the next interaction in the case
      //   where we know there's no next button, so this won't get set, and we
      //   can just come back and ask after doing whatever causes new items, ask
      //   for new items and be pleasantly surprised that some are there
      noMoreItemsAvailable[sid] = true;
    } else {
      window.WALconsole.namedLog("nextInteraction",
        "Failure. Don't know how to produce items because don't know next button type.  Guessing we just want the current page items.");
      noMoreItemsAvailable[sid] = true;
    }
  }

  export function getFreshRelationItems(selector: RelationSelector) {
    getFreshRelationItemsHelper(selector,
      (respMsg: FreshRelationItemsMessage) => {
        window.WALconsole.log('respMsg', respMsg);
        window.utilities.sendMessage("content", "mainpanel", "freshRelationItems",
          respMsg);
    });
  }

  function extractFromRelationRep(rel: MainpanelNodeI[][]) {
    return rel.map((row) =>
      // TODO: cjbaik: is text & frame the correct attributes to use?
      row.map((cell) => [cell.text, cell.frame])
    );
  }

  function mainpanelRepresentationOfRelationsEqual(r1: MainpanelNodeI[][],
    r2: MainpanelNodeI[][]): boolean {
    let r1Visible = extractFromRelationRep(r1);
    let r2Visible = extractFromRelationRep(r2);
    
    if (r1Visible.length !== r2Visible.length) {
      return false;
    }

    for (let rowIndex = 0; rowIndex < r1Visible.length; rowIndex++) {
      let r1Row = r1Visible[rowIndex];
      let r2Row = r2Visible[rowIndex];
      
      if (r1Row.length !== r2Row.length) {
        return false;
      }
      for (let cellIndex = 0; cellIndex < r1Row.length; cellIndex++) {
        let r1CellAttrs = r1Row[cellIndex];
        let r2CellAttrs = r2Row[cellIndex];
        for (let attrIndex = 0; attrIndex < r1CellAttrs.length; attrIndex++) {
          if (r1CellAttrs[attrIndex] !== r2CellAttrs[attrIndex]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  let relationFinderIdCounter = 0;
  let waitingOnPriorGetFreshRelationItemsHelper = false;
  export function getFreshRelationItemsHelper(selector: RelationSelector,
    continuation: Function, doData = false) {
    if (waitingOnPriorGetFreshRelationItemsHelper && doData === false){
      return;
    }
    let sid = selector.hash();
    window.WALconsole.log("noMoreItemsAvailable", noMoreItemsAvailable[sid],
      noMoreItemsAvailable);
  
    if (noMoreItemsAvailable[sid]) {
      // that's it, we're done.  last use of the next interaction revealed there's nothing left
      window.WALconsole.log("no more items at all, because noMoreItemsAvailable was set.");
      continuation({
        type: window.RelationItemsOutputs.NOMOREITEMS,
        relation: null
      });
    }
    // below is commented out in case there are cases where after first load, it may take a while for the data to all get there (get empty list first, that kind of deal)  Does that happen or is this a wasted opportunity to cache?
    /*
    if (!nextInteractionSinceLastGetFreshRelationItems[strMsg] && (strMsg in currentRelationData)){
      // we have a cached version and the data shouldn't have changed since we cached it
      window.utilities.sendMessage("content", "mainpanel", "freshRelationItems", {type: RelationItemsOutputs.NEWITEMS, relation: currentRelationData[strMsg]});
      return;
    }
    */
    // ok, don't have a cached version, either because never collected before, or bc done a next interaction since then.  better grab the data afresh

    let relationNodes = selector.getMatchingRelation();
    window.WALconsole.log("relationNodes", relationNodes);

    // ok, let's go through these nodes and give them ids if they've never been
    //   scraped for a node before. then we want to figure out whether we're in
    //   a next interaction or a more interaction, so we know how to deal with
    //   info about whether we've scraped already
    let relationNodesIds: number[][] = [];
    for (const row of relationNodes) {
      let rowIds: number[] = [];
      for (const rawCell of row) {
        let cell = <ScrapedElement> rawCell;
        let id;
        if (cell === null || cell === undefined) { 
          // can't save an id on null
          continue;
        } else if (cell.___relationFinderId___ === undefined) {
          // can be 0, so check for undefined rather than truthiness
          // have to add the relationFinderId
          id = relationFinderIdCounter;
          cell.___relationFinderId___ = id;
          relationFinderIdCounter += 1;
        } else {
          // already have relationFinderId saved
          id = cell.___relationFinderId___;
        }
        rowIds.push(id);

        // now, it's nice that we're able to track these rows and all, but if
        //   the page gets updated by javascript or some such thing, we might
        //   keep this id and think we've already scraped something even if we
        //   haven't so use mutationobserver

        // todo: might be better to do this for relationNodes items (row-by-row)
        //   rather than on a cell-by-cell basis. that way if any of the cells
        //   change, we believe the whole row has been updated
        // of course, this still doesn't fix the case where the list has been
        //   ajax-updated, but one of the rows is the same
        // todo: handle that
         
        // create an observer instance
        let observer = new MutationObserver((mutations) => {
          // get rid of the old id, now that it's essentially a different node
          delete cell.___relationFinderId___;
          // stop observing
          observer.disconnect();
        });
    
        // configuration of the observer:
        let config = { attributes: true, childList: true, characterData: true };
        // pass in the target node, as well as the observer options
        try {
          observer.observe(cell, config);
        } catch (err) {
          window.WALconsole.warn("woah, couldn't observe mutations. are we getting all data?");
        }  
      }
      relationNodesIds.push(rowIds);
    }

    if (!(sid in currentRelationSeenNodes)) {
      currentRelationSeenNodes[sid] = [];
    }
    // if there's supposed to be a next button or more button, or scroll for
    //   more, we have to do some special processing
    if (selector.next_type === window.NextTypes.NEXTBUTTON ||
        selector.next_type === window.NextTypes.MOREBUTTON ||
        selector.next_type === window.NextTypes.SCROLLFORMORE) {
      // retrieve the list of ids we've already scraped
      let alreadySeenRelationNodeIds = currentRelationSeenNodes[sid];
      // figure out if the new rows include nodes that were already scraped
      let newRows = [];
      let newRowsIds = [];
      for (let rowIndex = 0; rowIndex < relationNodesIds.length; rowIndex++) {
        let row = relationNodesIds[rowIndex];
        // todo: should we be looking for whether some are new, or all?
        //   requiring all can fail with ajax-updated pages
        // ex: say we're scraping a bunch of papers from a single conference.
        //   conference cell of row will stay the same,
        //   so conference node won't get updated and its id won't get wiped.
        //   in this case, even requiring some to be new could be a problem if
        //   we're only scraping that single column
        // so todo: come up with a better solution
        let someNew = row.some((cell) =>
          !alreadySeenRelationNodeIds.includes(cell));
        if (someNew) {
          newRows.push(relationNodes[rowIndex]);
          newRowsIds.push(row);
        }
      }

      // ok, now that we know which rows are actually new, what do we want to do
      //   with that information?
      if (selector.next_type === window.NextTypes.NEXTBUTTON) {
        // this is a next interaction, so we should never have overlap.
        //   wait until everything is new
        if (relationNodes.length !== newRows.length) {
      	  window.WALconsole.log("sending no new items yet because we found some repeated items and it's a next button.  is that bad?");
          window.WALconsole.log("alreadySeenRelationNodeIds",
            alreadySeenRelationNodeIds.length, alreadySeenRelationNodeIds);
          window.WALconsole.log("relationNodes", relationNodes.length,
            relationNodes);
      	  window.WALconsole.log("newRows", newRows.length, newRows);
          // looks like some of our rows weren't new, so next button hasn't happened yet

          window.WALconsole.log("newRows", newRows);
          continuation({type: window.RelationItemsOutputs.NONEWITEMSYET, relation: null});
        }
        // otherwise we can just carry on, since the relationNodes has the right set
      } else {
        // ok, we're in a more-style interaction, either morebutton or scrollformore
        // the newrows are the new rows, so let's use those!
        relationNodes = newRows;
        relationNodesIds = newRowsIds;
      }
    }

    // ok, we're about to try to figure out if our new data is actual new data
    //   and consider sending it along to mainpanel we know some nodes exist,
    //   but we don't know that they've loaded/finished updating yet to be on
    //   the safe side, let's give them a sec.
    // in fact, ideally we'd like to do better, check if they've stopped
    //   updating; todo: look into this

    if (!doData) {
      // call this function again in a sec, but with doData set to true
      waitingOnPriorGetFreshRelationItemsHelper = true;
      let wait = selector.relation_scrape_wait;
      if (!wait) {
        wait = window.DefaultHelenaValues.relationScrapeWait;
      }
      console.log("wait time", wait);
      setTimeout(function(){
        getFreshRelationItemsHelper(selector, continuation, true);
      }, wait);
    } else {
      // great, we've waited our time and it's time to go
      waitingOnPriorGetFreshRelationItemsHelper = false;
      console.log("relationNodes", relationNodes);
      let relationData = MainpanelNode.convertRelation(relationNodes);
      let crd = currentRelationData[sid];
      // we can also have the problem where everything looks new, because everything technically gets updated, 
      // even though some of it is old data, didn't need to be redrawn. so need to do a text check too
      // so that's why we'll compare to the crd, figure out whether the head looks like it's actually old data
      if (crd && crd.length === relationData.length &&
          mainpanelRepresentationOfRelationsEqual(crd, relationData)){
        // data still looks the same as it looked before.  no new items yet.
        window.WALconsole.log("No new items yet because the data is actualy equal");
        window.WALconsole.log(crd, relationData);
        continuation({
          type: window.RelationItemsOutputs.NONEWITEMSYET,
          relation: null
        });
      }

      // whee, we have some new stuff.  we can update the state
      nextInteractionSinceLastGetFreshRelationItems[sid] = false;
      // we only want the fresh ones!
      let newItems = relationData; // start by assuming that's everything
      if (crd) {
        // window.WALconsole.log("crd, relationData, relationData slice", crd,
        //   relationData, relationData.slice(0,crd.length),
        //   _.isEqual(crd, relationData.slice(0, crd.length)))
      }
      if (crd && mainpanelRepresentationOfRelationsEqual(crd,
        relationData.slice(0, crd.length))){
        // cool, this is a case of loading more into the same page, so we want to just grab the end
        newItems = relationData.slice(crd.length, relationData.length);
      }

      // it's important that we don't wipe out the currentRelationdata[strMsg]
      //   unless we actually have new data. if we're doing a more interaction,
      //   might have 0 rows in an intermediate state, but then still need to
      //   trim the top off the list based on having already collected the data
      if (newItems.length > 0) {
        window.WALconsole.namedLog("nextInteraction", "setting relation info",
          selector);
        currentRelationData[sid] = relationData;
        let newRelationSeenNodes = currentRelationSeenNodes[sid].concat(
          (<number[]> []).concat(...relationNodesIds));
        currentRelationSeenNodes[sid] = newRelationSeenNodes.filter(
          (nodeId) => nodeId);
        window.WALconsole.log("actual new items", newItems);
        continuation({
          type: window.RelationItemsOutputs.NEWITEMS,
          relation: newItems
        });
      }
    }

  };
}
