import * as Blockly from "blockly";

import { HelenaMainpanel, NodeSources } from "../../../helena_mainpanel";

import { NodeVariable } from "../../../variables/node_variable";
import { EventMessage } from "../../../../common/messages";
import { PageActionStatement } from "./page_action";
import { GenericRelation } from "../../../relation/generic";
import { PageVariable } from "../../../variables/page_variable";
import { HelenaProgram } from "../../program";

function deleteAPropDelta(trace: EventMessage[], propertyName: string) {
  for (const event of trace) {
    if (event.type !== "dom") { continue; }
    const deltas = event.meta.deltas;
    if (deltas) {
      for (let j = 0; j < deltas.length; j++) {
        const delta = deltas[j];
        if (delta.divergingProp === propertyName) {
          deltas.splice(j, 1); // throw out the relevant delta
        }
      }
    }
  }
}

function firstUpdateToProp(trace: EventMessage[], propertyName: string) {
  for (const event of trace) {
    if (event.type !== "dom") { continue; }
    const deltas = event.meta.deltas;
    if (deltas) {
      for (let j = 0; j < deltas.length; j++) {
        const delta = deltas[j];
        if (delta.divergingProp === propertyName) {
          for (const key in delta.changed.prop) {
            if (key === propertyName) {
              // phew, finally found it.  grab it from the changed, not the
              //   original snapshot (want what it changed to)
              return delta.changed.prop[key];
            }
          }
        }
      }
    }
  }
}

export class PulldownInteractionStatement extends PageActionStatement {
  public node: string;
  public origTrace?: EventMessage[];
  public origCleanTrace?: EventMessage[];
  public pageVar: PageVariable;

  constructor(trace: EventMessage[]) {
    super();
    window.Revival.addRevivalLabel(this);
    this.setBlocklyLabel("pulldownInteraction");
    this.trace = trace;
    
    // find the record-time constants that we'll turn into parameters
    this.cleanTrace = HelenaMainpanel.cleanTrace(trace);
    const ev = HelenaMainpanel.firstVisibleEvent(trace);
    this.pageVar = window.EventM.getDOMInputPageVar(ev);
    this.node = ev.target.xpath;
    this.origNode = this.node;
    // we want the currentNode to be a nodeVariable so we have a name for the
    //   scraped node
    this.currentNode = HelenaMainpanel.makeNodeVariableForTrace(trace);
  }

  public toStringLines() {
    return ["pulldown interaction"];
  }

  public updateBlocklyBlock(program?: HelenaProgram,
      pageVars?: PageVariable[], relations?: GenericRelation[]) {
    if (!program) {
      return;
    }
    // addToolboxLabel(this.blocklyLabel, "web");
    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        this.appendDummyInput()
            .appendField("pulldown interaction");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(280);
      }
    };
  }

  public parameterizeForRelation(relation: GenericRelation) {
    const col = this.parameterizeNodeWithRelation(relation, this.pageVar);

    // if we did actually parameterize, we need to do something kind of weird.
    //   need to replace the trace with something that just sets 'selected' to
    //   true for the target node
    if (col) {
      this.origTrace = this.trace;
      this.origCleanTrace = this.cleanTrace;

      // clone it.  update it.  put the xpath in the right places. put a delta
      //   for 'selected' being true
      const trace = window.MiscUtilities.dirtyDeepcopy(this.trace);
      for (const event of trace) {
        if (event.meta) {
          event.meta.forceProp = ({ selected: true });
        }
      }
      // don't try to update the value of select node just update the
      //   selectindex
      deleteAPropDelta(trace, "value");
      this.trace = trace;
      this.cleanTrace = HelenaMainpanel.cleanTrace(this.trace);
    }
    return [col];
  }

  public unParameterizeForRelation(relation: GenericRelation) {
    const col = this.unParameterizeNodeWithRelation(relation);
    // if we did find a col, need to undo the thing where we replaced the trace
    //   with the 'selected' update, put the old trace back in
    if (col) {
      if (!this.origTrace || !this.origCleanTrace) {
        throw new ReferenceError("origTrace or origCleanTrace not set.");
      }
      this.trace = this.origTrace;
      this.cleanTrace = this.origCleanTrace;

      this.origTrace = undefined; // just to be clean
      this.origCleanTrace = undefined;
    }
  }

  public pbvs() {
    var pbvs = [];
    if (this.currentTab()) {
      // do we actually know the target tab already?  if yes, go ahead and
      //   paremterize that
      pbvs.push({
        type: "tab",
        value: this.originalTab()
      });
    }

    // we only want to pbv for things that must already have been extracted by
    //   relation extractor
    if (this.currentNode instanceof NodeVariable &&
        this.currentNode.getSource() === NodeSources.RELATIONEXTRACTOR) {
      //pbvs.push({type:"node", value: this.node});
      // crucial to make sure that selectedIndex for the select node gets
      //   updated
      // otherwise things don't change and it doesn't matter if change event is
      //   raised
      // what index was selected in the recording?
      const origVal = firstUpdateToProp(this.trace, "selectedIndex");
      const originalValDict = {
        property: "selectedIndex",
        value: origVal
      };
      pbvs.push({
        type: "property",
        value: originalValDict
      });
    }
    return pbvs;
  }

  public args(environment: EnvironmentPlaceholder) {
    const args = [];
    args.push({
      type: "tab",
      value: this.currentTab()
    });
    // we only want to pbv for things that must already have been extracted by
    //   relation extractor
    if (this.currentNode instanceof NodeVariable &&
        this.currentNode.getSource() === NodeSources.RELATIONEXTRACTOR) {
      //args.push({type:"node", value: currentNodeXpath(this, environment)});
      // crucial to make sure that selectedIndex for the select node gets
      //   updated. otherwise things don't change and it doesn't matter if
      //   change event is raised

      // extract the correct selectedIndex from the xpath of the current option
      //   node
      const xpath = <string> this.currentNodeXpath(environment);
      window.WALconsole.log("currentNodeXpath", xpath);
      const segments = xpath.split("[")
      let indexStr = segments[segments.length - 1].split("]")[0]; 
      let indexOfNextOption = parseInt(indexStr);
      // our node-to-xpath converter starts counting at 1, but selectedIndex
      //   property starts counting at 0, so subtract one
      indexOfNextOption = indexOfNextOption - 1;
      const valDict = {
        property: "selectedIndex",
        value: indexOfNextOption
      };

      args.push({
        type: "property",
        value: valDict
      });
    }
    return args;
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
    workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    HelenaMainpanel.attachToPrevBlock(this.block, prevBlock);
    HelenaMainpanel.setHelenaStatement(this.block, this);
    return this.block;
  };
}