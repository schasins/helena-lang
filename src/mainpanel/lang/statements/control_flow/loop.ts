import * as Blockly from "blockly";
import * as _ from "underscore";

import { HelenaConsole } from "../../../../common/utils/helena_console";

import { HelenaMainpanel } from "../../../helena_mainpanel";

import { HelenaLangObject } from "../../helena_lang";

import { SkipBlock, AnnotationItem } from "./skip_block";

import { ScrapeStatement } from "../page_action/scrape";

import { ColumnSelector } from "../../../../content/selector/column_selector";

import { GenericRelation } from "../../../relation/generic";
import { Relation } from "../../../relation/relation";
import { TextRelation } from "../../../relation/text_relation";
import { PageVariable } from "../../../variables/page_variable";
import { StatementContainer } from "../container";
import { HelenaProgram } from "../../program";
import { Revival } from "../../../revival";
import { Environment } from "../../../environment";
import { HelenaBlockUIEvent } from "../page_action/page_action";

/**
 * Loop statements not executed by run method, although may ultimately want to refactor to that
 */
export class LoopStatement extends StatementContainer {
  public static maxRowsFieldName = "maxRows";

  public cleanupStatements: HelenaLangObject[];
  public maxRows: number | null;
  public pageVar: PageVariable;
  public relation: GenericRelation;
  public relationColumnsUsed: (ColumnSelector.Interface | null)[];
  public rowsSoFar: number;
  public sourceBlock_: Blockly.Block;

  constructor(relation: GenericRelation,
      relationColumnsUsed: (ColumnSelector.Interface | null)[],
      bodyStatements: HelenaLangObject[],
      cleanupStatements: HelenaLangObject[],
      pageVar: PageVariable) {
    super();

    Revival.addRevivalLabel(this);
    this.setBlocklyLabel("loop");

    this.relation = relation;
    this.relationColumnsUsed = relationColumnsUsed;
    this.updateChildStatements(bodyStatements);
    this.pageVar = pageVar;

    this.bodyStatements = [];

    // note: for now, can only be set through js console.
    //   todo: eventually should have ui interaction for this.
    this.maxRows = null;
    this.rowsSoFar = 0;
    this.cleanupStatements = cleanupStatements;
  }

  public getChildren() {
    return this.bodyStatements;
  }

  public clearRunningState() {
    this.rowsSoFar = 0;
    return;
  }

  public toStringLines() {
    let varNames = this.relation.scrapedColumnNames();
    const addlVarNames = this.relation.columnName(this.relationColumnsUsed);
    varNames = [...new Set(varNames.concat(addlVarNames))];

    HelenaConsole.log("loopstatement", varNames, addlVarNames);
    let prefix = "";
    if (this.relation instanceof TextRelation) {
      prefix = `for (${varNames.join(", ")} in ${this.relation.name}) {`; 
    } else {
      prefix = `for (${varNames.join(", ")} in " +
        "${this.pageVar.toString()}.${this.relation.name}) {`; 
    }

    let statementStrings = this.bodyStatements
      .reduce((acc: string[], stmt) =>
        acc.concat(stmt.toStringLines()), [])
      .map((line) => (`&nbsp;&nbsp;&nbsp;&nbsp; ${line}`));
    return [prefix].concat(statementStrings).concat(["}"]);
  }

  public updateBlocklyBlock(program?: HelenaProgram,
      pageVars?: PageVariable[], relations?: GenericRelation[]) {
    // uses the program obj, so only makes sense if we have one
    if (!program) return;

    if (!relations || relations.length < 1) {
      HelenaConsole.log("no relations yet so can't have loops in blockly.");
      return;
    }

    const self = this;

    const handleMaxRowsChange = (newMaxRows: number) => {
      if (self.sourceBlock_ && window.helenaMainpanel.getHelenaStatement(self.sourceBlock_)) {
        const stmt = <LoopStatement> window.helenaMainpanel.getHelenaStatement(self.sourceBlock_);
        stmt.maxRows = newMaxRows;
        // if you changed the maxRows and it's actually defined, should make
        //   sure the max rows actually used...
        if (newMaxRows !== null && newMaxRows !== undefined) {
          dontUseInfiniteRows();
        }
      }
    };
  
    const useInfiniteRows = () => {
      const block = self.sourceBlock_;
      setTimeout(() => {
        block.setFieldValue("TRUE", "infiniteRowsCheckbox");
        block.setFieldValue("FALSE", "limitedRowsCheckbox");
      }, 0);
      const stmt = <LoopStatement> window.helenaMainpanel.getHelenaStatement(block);
      stmt.maxRows = null;
    };

    const dontUseInfiniteRows = () => {
      const block = this.sourceBlock_;
      setTimeout(() => {
        block.setFieldValue("FALSE", "infiniteRowsCheckbox");
        block.setFieldValue("TRUE", "limitedRowsCheckbox");
      }, 0);
      const stmt = <LoopStatement> window.helenaMainpanel.getHelenaStatement(block);
      stmt.maxRows =
        this.sourceBlock_.getFieldValue(LoopStatement.maxRowsFieldName);
    }

    const handleNewRelationName = () => {
      const block = this.sourceBlock_;
      // getWAL(block).maxRows = this.sourceBlock_.getFieldValue(maxRowsFieldName);
      const newName = this.sourceBlock_.getFieldValue("relationName");
      const loopStmt = <LoopStatement> window.helenaMainpanel.getHelenaStatement(block);
      if (loopStmt) {
        setTimeout(() => {
          const relObj = loopStmt.relation;
          if (relObj) {
            relObj.name = newName;
          }
          //UIObject.updateDisplayedScript();

          // update without updating how blockly appears
          window.helenaMainpanel.UIObject.updateDisplayedScript(false);
          window.helenaMainpanel.UIObject.updateDisplayedRelations();
        }, 0);
      }
    }

    // addToolboxLabel(this.blocklyLabel);

    if (!pageVars) {
      throw new ReferenceError("Page vars not set!");
    }
  
    const pageVarsDropDown = HelenaMainpanel.makePageVarsDropdown(pageVars);
    let startName = "relation_name";
    if (this.relation && this.relation.name) {
      startName = this.relation.name;
    }
  
    Blockly.Blocks[this.blocklyLabel] = {
      init: function(this: Blockly.Block) {
        const soFar = this.appendDummyInput()
            .appendField("for each row in")
            .appendField(new Blockly.FieldTextInput(startName,
              handleNewRelationName), "relationName")      
            .appendField("in")
            .appendField(new Blockly.FieldDropdown(pageVarsDropDown), "page");  
             
        if (!window.helenaMainpanel.demoMode) {
          soFar.appendField("(")
          .appendField(new Blockly.FieldCheckbox("TRUE", useInfiniteRows),
            'infiniteRowsCheckbox')
          .appendField("for all rows,")
          .appendField(new Blockly.FieldCheckbox("TRUE", dontUseInfiniteRows),
            'limitedRowsCheckbox')
          .appendField("for the first")
          .appendField(new Blockly.FieldNumber(20, 0, undefined, undefined,
            handleMaxRowsChange), LoopStatement.maxRowsFieldName)      
          .appendField("rows)");
        }
        
        // important for our processing that we always call this statements
        this.appendStatementInput("statements")
            .setCheck(null)
            .appendField("do");
        this.setPreviousStatement(true,  null);
        this.setNextStatement(true, null);
        this.setColour(44);
        this.setTooltip('');
        this.setHelpUrl('');
      },
      onchange: function(ev: Blockly.Events.Abstract) {
        if (ev instanceof Blockly.Events.Ui) {
          const uiEv = <HelenaBlockUIEvent> ev;
          
          // unselected
          if (uiEv.element === "selected" && uiEv.oldValue === this.id) {
            // remember that if this block was selected, relation names may have
            //   changed.  so we should re-display everything
            window.helenaMainpanel.UIObject.updateDisplayedScript(true);
          }
        }
      }
    };
  }

  public genBlocklyNode(prevBlock: Blockly.Block,
    workspace: Blockly.WorkspaceSvg) {
    this.block = workspace.newBlock(this.blocklyLabel);
    this.block.setFieldValue(this.relation.name, "relationName");
    if (this.pageVar) {
      this.block.setFieldValue(this.pageVar.toString(), "page");
    }
    
    if (!window.helenaMainpanel.demoMode) {
      if (this.maxRows) {
        this.block.setFieldValue(this.maxRows.toString(),
          LoopStatement.maxRowsFieldName);
        this.block.setFieldValue("FALSE", "infiniteRowsCheckbox");
      } else {
        // we're using infinite rows
        this.block.setFieldValue("FALSE", "limitedRowsCheckbox");
      }
    }
    
    HelenaMainpanel.attachToPrevBlock(this.block, prevBlock);

    // handle the body statements
    const firstNestedBlock = HelenaMainpanel.helenaSeqToBlocklySeq(
      this.bodyStatements, workspace);
    HelenaMainpanel.attachNestedBlocksToWrapper(this.block, firstNestedBlock);

    window.helenaMainpanel.setHelenaStatement(this.block, this);
    return this.block;
  }

  public getHelena() {
    // all well and good to have the things attached after this block, but also
    //   need the bodyStatements updated
    const firstNestedBlock = this.block.getInput('statements').connection
      .targetBlock();
    const nested = window.helenaMainpanel.blocklySeqToHelenaSeq(firstNestedBlock);
    this.bodyStatements = nested;
    return this;
  }

  public traverse(fn: Function, fn2: Function) {
    fn(this);
    for (const bodyStmt of this.bodyStatements) {
      bodyStmt.traverse(fn, fn2);
    }
    fn2(this);
  }

  private insertAnnotation(annotationItems: AnnotationItem[],
    availableAnnotationItems: AnnotationItem[], index: number,
    currProg: HelenaProgram) {
    const loopBodyStatements = this.bodyStatements;
    const bodyStatements = loopBodyStatements.slice(index,
      loopBodyStatements.length);
    const annotation = new SkipBlock(annotationItems,
      availableAnnotationItems, bodyStatements);
    
    // now that they're the entityScope's children, shouldn't be loop's
    //   children anymore
    this.removeChildren(bodyStatements);
    this.appendChild(annotation);
    adjustAnnotationParents(currProg);
    window.helenaMainpanel.UIObject.updateDisplayedScript();
  }

  public addAnnotation(annotationItems: AnnotationItem[],
    availableAnnotationItems: AnnotationItem[], currProg: HelenaProgram) {
    console.log("annotationItems", annotationItems);
    
    // if have both text and link, may appear multiple times
    let notYetDefinedNodeVars = 
      [...new Set(annotationItems.slice().map((obj) => obj.nodeVar))];
    const definedNodeVars = this.relationNodeVariables();
    notYetDefinedNodeVars = notYetDefinedNodeVars.filter(
      (item) => !definedNodeVars.includes(item));
    if (notYetDefinedNodeVars.length <= 0) {
      this.insertAnnotation(annotationItems, availableAnnotationItems, 0,
        currProg);
      return;
    }

    for (let i = 0; i < this.bodyStatements.length; i++) {
      const bodyStmt = this.bodyStatements[i];
      if (bodyStmt instanceof ScrapeStatement) {
        notYetDefinedNodeVars = notYetDefinedNodeVars.filter(
          (nv) => nv !== bodyStmt.currentNode
        );
      }
      if (notYetDefinedNodeVars.length <= 0) {
        this.insertAnnotation(annotationItems, availableAnnotationItems, i + 1,
          currProg);
        return;
      }
    }
  }

  public relationNodeVariables() {
    return this.relation.nodeVariables();
  }

  public updateRelationNodeVariables(environment: Environment.Frame) {
    HelenaConsole.log("updateRelationNodeVariables");
    this.relation.updateNodeVariables(environment, this.pageVar);
  }

  public parameterizeForRelation(relation: GenericRelation) {
    return _.flatten(this.bodyStatements.map(
      (statement) => statement.parameterizeForRelation(relation)
    ));
  }

  public unParameterizeForRelation(relation: GenericRelation) {
    for (const bodyStmt of this.bodyStatements) {
      bodyStmt.unParameterizeForRelation(relation);
    }
  }

  public endOfLoopCleanup(continuation: Function) {
    if (this.relation instanceof Relation) {
      this.relation.endOfLoopCleanup(this.pageVar, continuation);
    } else {
      continuation();
    }
  }
}

/**
 * go through the whole tree and make sure any nested annotations know all
 *   ancestor annotations note that by default we're making all of them required
 *   for matches, not just available for matches
 * in future, if user has edited, we might want to let those edits stand...
 */
function adjustAnnotationParents(currProg: HelenaProgram) {
  let ancestorAnnotations: SkipBlock[] = [];
  currProg.traverse(
    (stmt: HelenaLangObject) => {
      if (stmt instanceof SkipBlock) {
        const skipBlock = <SkipBlock> stmt;
        skipBlock.ancestorAnnotations = ancestorAnnotations.slice();
        skipBlock.requiredAncestorAnnotations = ancestorAnnotations.slice();
        ancestorAnnotations.push(skipBlock);
      }
    },
    (stmt: HelenaLangObject) => {
      if (stmt instanceof SkipBlock) {
        // back out of this entity scope again, so pop it off
        ancestorAnnotations = ancestorAnnotations.filter(
          (annot) => annot !== stmt
        );
      }
    }
  );
}
