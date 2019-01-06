enum FilenameConflictAction {
    /** The browser will modify the filename to make it unique. */
    uniquify = "uniquify",
    /** The browser will overwrite the old file with the newly-downloaded file. */
    overwrite = "overwrite",
    /** The browser will prompt the user, asking them to choose whether to uniquify or overwrite. */
    prompt = "prompt",
}
