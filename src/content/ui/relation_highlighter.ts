import { SelectorMessage } from "../../common/messages";
import { RelationSelector } from "../selector/relation_selector";

/**
 * TODO: cjbaik: returned from Helena back-end server.
 *   Not sure what all parameters mean yet.
 */
interface KnownRelationMessage {
  selectorObj: RelationSelector;
  nodes: (Element | null)[];
  relationOutput: (Element | null)[][];
  highlighted: boolean;
  highlightNodesTime?: number;
  highlightNodes?: JQuery<HTMLElement>[];
}

/**
 * Highlight relations that can be found on the page on hover.
 */
export class RelationHighlighter {
  highlightColors: string[];
  knownRelations: KnownRelationMessage[];

  constructor () {
    this.knownRelations = [];
    this.highlightColors = ["#9EE4FF","#9EB3FF", "#BA9EFF", "#9EFFEA",
      "#E4FF9E", "#FFBA9E", "#FF8E61"];
  }

  /**
   * Retrieve known relations from the server.
   */
  public getKnownRelations() {
    let self = this;
    // TODO: cjbaik: switch this to a port rather than a one time msg

    // have to use postForMe right now to make the extension make a POST
    // request because modern Chrome won't let us request http content from
    // https pages and we don't currently have ssl certificate for kaofang
    window.utilities.sendMessage("content", "background", "postForMe", {
      url: helenaServerUrl + '/allpagerelations',
      params: {url: window.location.href }
    });
    window.utilities.listenForMessageOnce("background", "content", "postForMe",
      function (resp: { relations: SelectorMessage[] }) {
        window.WALconsole.log(resp);
        self.preprocessKnownRelations(resp.relations);
      }
    );
  }
  
  /**
   * Massage and reformat server response about known relations.
   * @param resp server response
   */
  private preprocessKnownRelations(resp: SelectorMessage[]) {
    for (let i = 0; i < resp.length; i++) {
      let selectorMsg = window.ServerTranslationUtilities.unJSONifyRelation(resp[i]);
      // first let's apply each of our possible relations to see which nodes
      //   appear in them
      try {
        let selector = RelationSelector.fromMessage(selectorMsg);
        let relationOutput = selector.getMatchingRelation();
        let nodes = relationOutput.reduce((memo, row) => memo.concat(row),
          []);

        // then let's make a set of highlight nodes for each relation, so we
        //   can toggle them between hidden and displayed based on user's
        //   hover behavior
        this.knownRelations.push(
          {
            selectorObj: selector,
            nodes: nodes,
            relationOutput: relationOutput,
            highlighted: false
          }
        );
      } catch (err) {
        console.error(err);
        // console.warn(`Known relation ${JSON.stringify(resp[i])} failed.`);
        continue;
      }
    }  
  }

  /**
   * Given an element, find most relevant relation and highlight.
   * @param element element to highlight
   */
  public highlightRelevantRelation(element: Element) {
    // for now we'll just pick whichever node includes the current node and has
    //   the largest number of nodes on the current page
    let winningRelation = null;
    let winningRelationSize = 0;
    for (let i = 0; i < this.knownRelations.length; i++) {
      let relationInfo = this.knownRelations[i];
      if (relationInfo.nodes.indexOf(element) > -1) {
        if (relationInfo.nodes.length > winningRelationSize) {
          winningRelation = relationInfo;
          winningRelationSize = relationInfo.nodes.length;
        }
      }
    }
    if (winningRelation) {
      // cool, we have a relation to highlight
      winningRelation.highlighted = true;
      
      // important to make the highlight nodes now, since the nodes might be
      // shifting around throughout interaction, especially if things still
      // loading
      let currTime = new Date().getTime();
      let highlightNodes: JQuery<HTMLElement>[] | null = null;

      if (winningRelation.highlightNodes &&
        winningRelation.highlightNodesTime &&
        ((currTime - winningRelation.highlightNodesTime) < 2000)) {
        // cache the highlight nodes for up to two second, then go ahead and
        //   recompute those positions
        highlightNodes = winningRelation.highlightNodes;
      } else {
        highlightNodes = this.highlightRelation(
          winningRelation.relationOutput, false, false);
      }
      winningRelation.highlightNodes = highlightNodes;
      winningRelation.highlightNodesTime = new Date().getTime();

      for (let i = 0; i < highlightNodes.length; i++) {
        highlightNodes[i].css("display", "block");
      }
    }
  }

  /**
   * Highlight the relation.
   * @param relation elements in relation
   * @param display whether to show highlight nodes or not
   * @param pointerEvents whether to enable or disable CSS pointer-events on
   *   highlight nodes
   * @returns highlighted nodes
   */
  public highlightRelation(relation: (Element | null)[][], display: boolean,
    pointerEvents: boolean) {
    let nodes = [];
    for (const row of relation) {
      for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
        let cell = row[cellIndex];
        if (cell === null){ continue; }
        // first make sure there is a color at index j, add one if there isn't
        if (cellIndex >= this.highlightColors.length) {
          this.highlightColors.push(
            "#000000".replace(/0/g,function () {
              return (~~(Math.random()*16)).toString(16);
            }));
        }
        let node = window.Highlight.highlightNode(cell,
          this.highlightColors[cellIndex], display, pointerEvents);
        nodes.push(node);
      }
    }
    return nodes;
  }

  /**
   * Unhighlight the relation.
   */
  public unhighlight() {
    for (let i = 0; i < this.knownRelations.length; i++) {
      let relationInfo = this.knownRelations[i];
      if (relationInfo.highlightNodes) {
        for (let j = 0; j < relationInfo.highlightNodes.length; j++) {
          relationInfo.highlightNodes[j].css("display", "none");
        }
      }
    }
  };
}