import { HelenaBackground } from "./background/helena_background";
import { HelenaContent } from "./content/helena_content";
import { RingerContent } from "./ringer-record-replay/content/ringer_content";
import { HelenaMainpanel } from "./mainpanel/helena_mainpanel";
import { RecorderUI } from "./mainpanel/ui/recorder_ui";
import { RingerMainpanel } from "./ringer-record-replay/mainpanel/ringer_mainpanel";
declare global {
    interface Window {
        theModule: any;
        helenaMainpanel: HelenaMainpanel;
        ringerMainpanel: RingerMainpanel;
        helenaContent: HelenaContent;
        ringerContent: RingerContent;
        scrapingRunsCompleted: number;
        datasetsScraped: (number | undefined)[];
        JSOG: any;
    }
    interface JQueryStatic {
        format: {
            date: Function;
        };
        csv: {
            toArrays: Function;
        };
    }
}
declare const helenaIsReady: Promise<unknown>;
export { helenaIsReady, HelenaBackground, HelenaContent, RingerContent, HelenaMainpanel, RingerMainpanel, RecorderUI, };
