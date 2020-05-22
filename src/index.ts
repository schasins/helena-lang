import { HelenaBackground } from "./background/helena_background";
import { HelenaContent } from "./content/helena_content";
import { RingerContent } from "./ringer-record-replay/content/ringer_content";
import { HelenaMainpanel } from "./mainpanel/helena_mainpanel";
import { RecorderUI } from "./mainpanel/ui/recorder_ui";
import { RingerMainpanel } from "./ringer-record-replay/mainpanel/ringer_mainpanel";

// TODO: cjbaik: a lot of classes depend on these global variables, which is bad
declare global {
  interface Window {
    theModule: any;

    helenaMainpanel: HelenaMainpanel;
    ringerMainpanel: RingerMainpanel;
    helenaContent: HelenaContent;
    ringerContent: RingerContent;

    // Used in test scripts, e.g. `runHelenaScript.py`
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

// TODO: cjbaik: all the global imports we couldn't get rid of, packaged in a
//   bizarre Promise
const helenaIsReady = Promise.all([
  import("!!raw-loader!./lib/jquery.js"),
  import("!!raw-loader!./lib/jquery-ui.js"),
  import("!!raw-loader!./lib/jquery-dateFormat.min.js"),
  import("!!raw-loader!./lib/jquery_csv.js"),
  import("!!raw-loader!./lib/JSOG.js"),
]).then((rawModules) => {
  return new Promise((resolve) => {
    for (const rawModule of rawModules) {
      eval.call(null, rawModule.default);
    }
    resolve();
  });
});

export {
  helenaIsReady,
  HelenaBackground,
  HelenaContent,
  RingerContent,
  HelenaMainpanel,
  RingerMainpanel,
  RecorderUI,
};
