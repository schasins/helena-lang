import { HelenaLangObject } from "../helena_lang";
/**
 * A Helena language object that contains a body of statements.
 */
export declare class StatementContainer extends HelenaLangObject {
    bodyStatements: HelenaLangObject[];
    removeChild(stmt: HelenaLangObject): void;
    removeChildren(stmts: HelenaLangObject[]): void;
    appendChild(stmt: HelenaLangObject): void;
    insertChild(stmt: HelenaLangObject, index: number): void;
    updateChildStatements(stmts: HelenaLangObject[]): void;
}
