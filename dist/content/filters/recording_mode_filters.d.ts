/**
 * DOM events to filter (i.e. ignore) during recording.
 */
export declare namespace RecordingModeFilters {
    /**
     * Because Windows has this habit of producing multiple keypress, keydown
     *   events for a continued key press, we want to throw out events that are
     *   repeats of events we've already seen. This change fixes a major issue
     *   with running Helena on Windows, in that the top-level tool chooses to
     *   ignore events that can be accomplished without running Ringer (e.g.
     *   scraping relation items), but keydown events can only be accomplished by
     *   Ringer.  So replay gets slow because of having to replay all the Ringer
     *   events for each row of the relation.
     * Note: if we run into issues where holding a key down in a recording
     *   produces a bad replay, look here first.
     */
    function ignoreExtraKeydowns(event: KeyboardEvent): boolean;
}
