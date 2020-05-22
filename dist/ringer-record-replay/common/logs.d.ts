export declare enum LogLevel {
    LOG = 1,
    INFO = 2,
    DEBUG = 3,
    WARN = 4,
    ERROR = 5
}
export declare namespace Logs {
    let logRecord: string[];
    /**
     * Check to see if the log is enabled and return a Logger.
     */
    function getLog(...names: string[]): Logger | NoopLogger;
    class Logger {
        private level;
        private tag;
        constructor(tags: string[]);
        debug(...args: any[]): void;
        error(...args: any[]): void;
        info(...args: any[]): void;
        log(...args: any[]): void;
        warn(...args: any[]): void;
        print(f: string, origArgs: any[]): void;
    }
    class NoopLogger {
        debug(): void;
        error(): void;
        info(): void;
        log(): void;
        warn(): void;
    }
}
