import { HelenaLangObject } from "../helena_lang";
import { MainpanelNode } from "../../../common/mainpanel_node";
export declare class Value extends HelenaLangObject {
    currentVal: MainpanelNode.Interface | boolean | string | number | null;
    getCurrentVal(): string | number | boolean | MainpanelNode.Interface | null;
}
