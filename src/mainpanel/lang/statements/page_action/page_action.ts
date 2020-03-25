import { HelenaLangObject, StatementParameter } from "../../helena_lang";
import { EventMessage } from "../../../../common/messages";
import { NodeVariable } from "../../../variables/node_variable";
import { PageVariable } from "../../../variables/page_variable";
import { TraceContributions, RunObject } from "../../program";
import { NodeSources, HelenaMainpanel } from "../../../helena_mainpanel";
import { GenericRelation } from "../../../relation/generic";
import { TextRelation } from "../../../relation/text_relation";
import { Relation } from "../../../relation/relation";
import { PulldownInteractionStatement } from "./pulldown_interaction";
import { ColumnSelector } from "../../../../content/selector/column_selector";

export class PageActionStatement extends HelenaLangObject {
  public cleanTrace: EventMessage[];
  public columnObj?: ColumnSelector.Interface;
  public contributesTrace?: TraceContributions;
  public currentNode: NodeVariable;
  public node?: string;
  public origNode?: string;
  public pageVar?: PageVariable;
  public relation?: GenericRelation;
  public trace: EventMessage[];

  public args(environment: EnvironmentPlaceholder): StatementParameter[] {
    return [];
  }

  public currentNodeXpath(environment: EnvironmentPlaceholder) {
    if (this.currentNode instanceof NodeVariable) {
      return this.currentNode.currentXPath(environment);
    }
    // this means currentNode better be an xpath if it's not a variable use!
    return this.currentNode;
  }

  public currentTab() {
    return this.pageVar?.currentTabId();
  }

  /**
   * Returns whether this Helena statement is Ringer based.
   */
  public isRingerBased() {
    return true;
  }

  public getNodeRepresentation(linkScraping = false) {
    if (this.currentNode instanceof NodeVariable) {
      // todo: this isn't really correct.  we could reuse a node scraped or
      //   clicked before, and then it would be bound already.  fix this.
      const alreadyBound =
        this.currentNode.getSource() === NodeSources.RELATIONEXTRACTOR;
      let nodeRep = this.currentNode.toString(alreadyBound, this.pageVar);
      if (linkScraping) {
        nodeRep += ".link";
      }
      return nodeRep;
    }
    if (this.trace[0].additional.visualization === "whole page") {
      return "whole page";
    }
    if (linkScraping) {
      // we don't have a better way to visualize links than just giving text
      return <string> this.trace[0].additional.scrape.link;
    }
    return `<img src='${this.trace[0].additional.visualization}'` +
      " style='max-height: 150px; max-width: 350px;'>";
  }

  public originalTab() {
    return this.pageVar?.originalTabId();
  }
  
  public parameterizeNodeWithRelation(genericRelation: GenericRelation,
      pageVar: PageVariable) {
    // note: may be tempting to use the columns' xpath attributes to decide
    //   this, but this is not ok!  now that we can have mutliple suffixes
    //   associated with a column, that xpath is not always correct but we're
    //   in luck because we know the selector has just been applied to the
    //   relevant page (to produce relation.demonstrationTimeRelation and from
    //   that relation.firstRowXpaths) so we can learn from those attributes
    //   which xpaths are relevant right now, and thus which ones the user would
    //   have produced in the current demo
    
    // if the relation is a text relation, we actually don't want to do the
    //   below, because it doesn't represent nodes, only texts
    if (genericRelation instanceof TextRelation) {
      return null;
    }

    let relation = <Relation> genericRelation;

    // hey, this better be in the same order as relation.columns and
    //   relation.firstRowXpaths!
    // todo: maybe add some helper functions to get rid of this necessity? since
    //   it may not be clear in there...
    const nodeRepresentations = relation.firstRowNodeRepresentations();

    for (let i = 0; i < relation.firstRowXPaths.length; i++) {
      const firstRowXpath = relation.firstRowXPaths[i];
      if (firstRowXpath === this.origNode || 
          (this instanceof PulldownInteractionStatement &&
            this.origNode && firstRowXpath.includes(this.origNode))) {
        this.relation = relation;
        const name = relation.columns[i].name;
        const nodeRep = nodeRepresentations[i];

        // not ok to just overwrite currentNode, because there may be multiple
        //   statements using the old currentNode, and becuase we're interested
        //   in keeping naming consistent, they should keep using it so...just
        //   overwrite some things
        if (!this.currentNode) {
          // have to check if there's a current node because if we're dealing
          //   with pulldown menu there won't be
          this.currentNode = new NodeVariable();
        }
        if (name) {
          this.currentNode.setName(name);
        }
        this.currentNode.nodeRep = nodeRep;
        this.currentNode.setSource(NodeSources.RELATIONEXTRACTOR);
        // statement.currentNode = new NodeVariable(name, nodeRep, null, null,
        //   NodeSources.RELATIONEXTRACTOR); // note that this means the
        //   elements in the firstRowXPaths and the elements in columns must be
        //   aligned!
        // ps. in theory the above commented out line should have just worked
        //   because we could search all prior nodes to see if any is the same
        //   but we just extracted the relation from a fresh run of the script,
        //   so any of the attributes we use (xpath, text, or even in some cases
        //   url) could have changed, and we'd try to make a new node, and mess
        //   it up since we know we want to treat this as the same as a prior
        //   one, better to just do this

        // the statement should track whether it's currently parameterized for a
        //   given relation and column obj
        this.relation = relation;
        this.columnObj = relation.columns[i];

        return relation.columns[i]; 
      }
    }
    return null;
  }
  
  public postReplayProcessing(runObject: RunObject, trace: EventMessage[],
      temporaryStatementIdentifier: number) {
    return;
  }

  /**
   * Parameterize by value. TODO: What does it mean?
   */
  public pbvs(): StatementParameter[] {
    return [];
  }

  public requireFeatures(featureNames: string[]) {
    if (featureNames.length > 0) { 
      if (!this.node) {
        // sometimes this.node will be empty, as when we add a scrape
        //   statement for known relation item, with no trace associated 
        window.WALconsole.warn("Hey, you tried to require some features, but " +
          "there was no Ringer trace associated with the statement.", this,
          featureNames);
      }
      // note that this.node stores the xpath of the original node
      window.ReplayTraceManipulation.requireFeatures(this.trace, this.node,
        featureNames);
      window.ReplayTraceManipulation.requireFeatures(this.cleanTrace, this.node,
        featureNames);
    }
  }

  public unParameterizeNodeWithRelation(relation: GenericRelation) {
    if (this.relation === relation) {
      this.relation = undefined;
      const columnObject = this.columnObj;
      this.columnObj = undefined;
      this.currentNode = HelenaMainpanel.makeNodeVariableForTrace(
        this.trace);
      return columnObject;
    }
    return null;
  }
}