import * as Blockly from "blockly";
import { HelenaLangObject } from "../lang/helena_lang";
export declare namespace HelenaBlocks {
    function attachInputToOutput(left: Blockly.Block, right: Blockly.Block): void;
    /**
     * For things like loops that have bodies, attach the nested blocks
     * @param wrapper
     * @param firstBlock
     */
    function attachNestedBlocksToWrapper(wrapper: Blockly.Block | null, firstBlock: Blockly.Block | null): void;
    function attachToInput(left: Blockly.Block, right: Blockly.Block, name: string): void;
    /**
     * Attach the current block to the previous block.
     * @param cur the current block
     * @param prev the previous block.
     */
    function attachToPrevBlock(cur: Blockly.Block, prev: Blockly.Block): void;
    function helenaSeqToBlocklySeq(stmts: HelenaLangObject[], workspace: Blockly.WorkspaceSvg): Blockly.Block;
}
