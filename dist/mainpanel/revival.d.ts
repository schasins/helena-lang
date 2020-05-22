/**
 * A very important set of utilities for reviving objects that have been
 *   stringified (as for sending to the server) but have returned to us, and
 *   need to be used as proper objects again.
 * We always store all the fields; it's the methods we lose. So we basically,
 *   when it comes time to revive it, want to union the attributes of the now
 *   unstringified dict and the prototype, grabbing the methods back from the
 *   prototype.
 */
export declare namespace Revival {
    interface Revivable {
        ___revivalLabel___: string;
        setAttributes?: (attrs: object) => void;
    }
    type Prototype = {
        new (...args: any[]): Revivable;
        createDummy: () => Revivable;
    };
    const revivalLabels: {
        [key: string]: Prototype;
    };
    function introduceRevivalLabel(label: string, prototype: Prototype): void;
    function addRevivalLabel(object: Revivable): void;
    function revive(attrs: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
}
