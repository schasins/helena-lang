import { RecorderUI } from "./ui/recorder_ui";
export declare namespace Environment {
    function setUIObject(obj: RecorderUI): void;
    class Frame {
        parent: Frame | null;
        map: {
            [key: string]: any;
        };
        constructor(parent: Frame | null);
        envExtend(): Frame;
        /**
         * Binds a new value to the top frame.
         */
        envBind(name: string, value: any): void;
        /**
         * Looks up the value of a variable.
         */
        envLookup(name: string): any;
    }
    function envRoot(): Frame;
}
