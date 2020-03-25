import { HelenaLangObject, StatementParameter } from "../../helena_lang";
import { EventMessage } from "../../../../common/messages";
import { NodeVariable } from "../../../variables/node_variable";
import { PageVariable } from "../../../variables/page_variable";
import { TraceContributions, RunObject } from "../../program";

export class PageActionStatement extends HelenaLangObject {
  public cleanTrace: EventMessage[];
  public contributesTrace?: TraceContributions;
  public currentNode: NodeVariable;
  public node?: string;
  public origNode?: string;
  public pageVar?: PageVariable;
  public trace: EventMessage[];

  public args(environment: EnvironmentPlaceholder): StatementParameter[] {
    return [];
  }
  
  public postReplayProcessing(runObject: RunObject, trace: EventMessage[],
      temporaryStatementIdentifier: number) {
    return;
  }
  
  /**
   * Returns whether this Helena statement is Ringer based.
   */
  public isRingerBased() {
    return true;
  }

  /**
   * Parameterize by value. TODO: What does it mean?
   */
  public pbvs(): StatementParameter[] {
    return [];
  }
}