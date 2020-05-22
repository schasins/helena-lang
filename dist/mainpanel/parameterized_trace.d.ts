import { Trace } from "../common/utils/trace";
export interface ParameterizedTraceConfig {
    tabMapping: {
        [key: number]: number;
    };
    targetWindowId?: number;
}
interface Property {
    property: string;
    value: string;
}
export declare class ParameterizedTrace {
    private tabs;
    private trace;
    constructor(trace: Trace);
    /**
     * Get parameterized trace config.
     */
    getConfig(): ParameterizedTraceConfig;
    /**
     * TODO
     */
    getStandardTrace(): any;
    /**
     * TODO
     * @param paramName
     * @param origValue
     */
    /**
     * Property parameterization
     * @param paramName
     * @param origValue
     */
    parameterizeProperty(paramName: string, origValue: Property): void;
    /**
     * Tab parameterization if we want to say which page to go to but leave fram
     *   mapping to lower level r+r code
     * @param paramName
     * @param origValue
     */
    parameterizeTab(paramName: string, origValue: number): void;
    /**
     * TODO
     * @param paramName
     * @param origString
     */
    parameterizeTypedString(paramName: string, origString: string): void;
    /**
     * URL load parameterization
     *   TODO: also change the completed event now that we allow that to cause
     *   loads if forceReplay is set
     * @param paramName
     * @param origValue
     */
    parameterizeUrl(paramName: string, origValue: string): void;
    /**
     * Parameterize XPath
     * @param paramName
     * @param origValue
     */
    parameterizeXpath(paramName: string, origValue: string): void;
    /**
     * TODO
     * @param parameter_name
     * @param value
     */
    /**
     * TODO
     * @param paramName
     * @param value
     */
    useProperty(paramName: string, value: Property): void;
    /**
     * TODO
     * @param paramName
     * @param value
     */
    useTab(paramName: string, value: number): void;
    /**
     *
     * @param paramName
     * @param str
     */
    useTypedString(paramName: string, str: string): void;
    /**
     * TODO
     * @param paramName
     * @param value
     */
    useUrl(paramName: string, value: string): void;
    /**
     * TODO
     * @param paramName
     * @param value
     */
    useXpath(paramName: string, value: any): void;
}
export {};
