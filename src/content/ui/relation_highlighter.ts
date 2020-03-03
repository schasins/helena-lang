import * as _ from "underscore";

/**
 * TODO: cjbaik: returned from Helena back-end server.
 *   Not sure what all parameters mean yet.
 */
interface KnownRelationResponse {
  selector_version: number;
  selector: string;
  name: string;
  exclude_first: number;
  id: number;
  columns: {
    id: number;
    xpath: string;
    suffix: string;
    name: string;
  }[];
  num_rows_in_demonstration: number;
  next_type: number;
  next_button_selector: string;
}

/**
 * TODO: cjbaik: returned from Helena back-end server.
 *   Not sure what all parameters mean yet.
 */
interface KnownRelation {
  selectorObj: {
    selector_version: number;
    selector: {
      tag: {
        pos: boolean;
        values: string[];
      };
      xpath: {
        pos: boolean;
        values: {
          index: string;
          iterable: boolean;
          nodeName: string;
        };
      }
    };
    name: string;
    exclude_first: number;
    id: number;
    columns: {
      xpath: string;
      suffix: {
        index: string;
        iterable: boolean;
        nodeName: string;
      }[];
      name: string;
      id: number;
    }[];
    num_rows_in_demonstration: number;
    next_type: number;
    next_button_selector: {
      frame_id: string;
      tag: string;
      text: string;
      xpath: string;
    } | null;
  },
  nodes: Element[];
  relationOutput: (Node | null)[][];
  highlighted: boolean;
  highlightNodesTime?: number;
  highlightNodes?: JQuery<HTMLElement>[];
}

/**
 * Highlight relations that can be found on the page on hover.
 * TODO: cjbaik: some part of this seems to be slowing down the whole UI when
 *   we start recording. Investigate and fix?
 */
export class RelationHighlighter {
    knownRelations: KnownRelation[];

    constructor () {
      this.knownRelations = [];
    }

    /**
     * Retreive known relations from the server.
     */
    public getKnownRelations() {
      let self = this;
      // TODO: cjbaik: switch this to a port rather than a one time msg

      // have to use postForMe right now to make the extension make a POST
      // request because modern Chrome won't let us request http content from
      // https pages and we don't currently have ssl certificate for kaofang
      utilities.sendMessage("content", "background", "postForMe", {
        url: helenaServerUrl + '/allpagerelations',
        params: {url: window.location.href }
      });
      utilities.listenForMessageOnce("background", "content", "postForMe",
        function (resp: { relations: KnownRelationResponse[] }) {
          WALconsole.log(resp);
          self.preprocessKnownRelations(resp.relations);
        }
      );
    }
    
    /**
     * Massage and reformat server response about known relations.
     * @param resp server response
     */
    private preprocessKnownRelations(resp: KnownRelationResponse[]) {
      for (let i = 0; i < resp.length; i++) {
        let selectorObj = ServerTranslationUtilities.unJSONifyRelation(resp[i]);
        // first let's apply each of our possible relations to see which nodes
        //   appear in them
        let relationOutput = RelationFinder.interpretRelationSelector(selectorObj);
        let nodeList = _.flatten(relationOutput);
  
        // then let's make a set of highlight nodes for each relation, so we can
        //   toggle them between hidden and displayed based on user's hover
        //   behavior
        this.knownRelations.push(
          {
            selectorObj: selectorObj,
            nodes: nodeList,
            relationOutput: relationOutput,
            highlighted: false
          }
        );
      }  
    }
  
    /**
     * Given an element, find most relevant relation and highlight.
     * @param element element to highlight
     */
    public highlight(element: Element) {
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
          highlightNodes = RelationFinder.highlightRelation(
            winningRelation.relationOutput, false, false);
        }
        winningRelation.highlightNodes = highlightNodes;
        winningRelation.highlightNodesTime = new Date().getTime();
  
        for (let i = 0; i < highlightNodes.length; i++) {
          highlightNodes[i].css("display", "block");
        }
      }
    };
  
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