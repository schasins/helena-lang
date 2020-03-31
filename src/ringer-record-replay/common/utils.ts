export interface Indexable {
  [key: string]: any;
}

export namespace Utilities {
  export function truncateDictionaryStrings(dict: Indexable,
     stringLengthLimit: number, keysToSkip: string[]) {
    for (const key in dict){
      const val = dict[key];
      if (!keysToSkip.includes(key) && typeof val === 'string' &&
          val.length > stringLengthLimit){
        dict[key] = val.slice(0, stringLengthLimit);
      }
    }
  }
}