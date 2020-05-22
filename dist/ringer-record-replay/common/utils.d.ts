export interface Indexable {
    [key: string]: any;
}
export declare namespace Utilities {
    /**
     * Clone an object.
     * @param obj
     */
    function clone(obj: object): any;
    /**
     * Get the Levenshtein distance of two strings.
     * @param a
     * @param b
     */
    function levenshteinDistance(a: string, b: string): number;
    /**
     * Decide whether two urls are the same.
     * @param similarity Threshold between 0 and 1 (most similar) which needs to
     *   be met.
     * @returns true if two urls match
     */
    function matchUrls(origUrl: string, matchedUrl: string, similarity: number): boolean;
    function truncateDictionaryStrings(dict: Indexable, stringLengthLimit: number, keysToSkip: string[]): void;
}
