declare namespace browser {

    /** Add items to the browser's menu system. */
    namespace menus {

        /** Fired when a menu item is clicked. */
        namespace onClicked {

            /**
             * Adds a listener to this event.
             * @param callback Function that will be called when this event occurs.
             */
            function addListener(callback: (info: IOnClickData, tab: ITab) => void): void;

            /** Information passed to the menus.onClicked event listener when a menu item is clicked. */
            interface IOnClickData {

                /** The ID of the menu item that was clicked. */
                menuItemId: number | string;

                /** Will be present for elements with a "src" URL. */
                srcUrl?: string;

                /** An identifier of the element, if any, over which the context menu was created. Use menus.getTargetElement() in the content script to locate the element. Note that this is not the id attribute of the page element. */
                targetElementId?: number;
            }
        }

        /**
         * Creates a new menu item.
         * @param createProperties Properties for the new menu item.
         * @param callback Called when the item has been created. If there were any problems creating the item, details will be available in runtime.lastError.
         */
        function create(createProperties: IContextMenu, callback?: () => void): number | string;

        /**
         * Returns the element for a given info.targetElementId.
         * @param targetElementId The property of the menus.OnClickData object passed to the menus.onClicked handler or menus.onShown event.
         * @returns The element referred to by the targetElementId parameter. If the targetElementId parameter is not valid, the method returns null.
         */
        function getTargetElement(targetElementId: number): any;

        interface IContextMenu {

            /** The unique ID to assign to this item. Mandatory for event pages. Cannot be the same as another ID for this extension. */
            id: string;

            /**
             * The text to be displayed in the item. Mandatory unless type is "separator".
             *
             * You can use "%s" in the string. If you do this in a menu item, and some text is selected in the page when the menu is shown, then the selected text will be interpolated into the title. For example, if title is "Translate '%s' to Pig Latin" and the user selects the word "cool", then activates the menu, then the menu item's title will be: "Translate 'cool' to Pig Latin".
             *
             * If the title contains an ampersand "&" then the next character will be used as an access key for the item, and the ampersand will not be displayed. Exceptions to this are:
             *
             *     If the next character is also an ampersand: then a single ampersand will be displayed and no access key will be set. In effect, "&&" is used to display a single ampersand.
             *     If the next characters are the interpolation directive "%s": then the ampersand will not be displayed and no access key will be set.
             *     If the ampersand is the last character in the title: then the ampersand will not be displayed and no access key will be set.
             *
             * Only the first ampersand will be used to set an access key: subsequent ampersands will not be displayed but will not set keys. So "&A and &B" will be shown as "A and B" and set "A" as the access key.
             */
            title: string;

            /**
             * Array of menus.ContextType. Array of contexts in which this menu item will appear. If this option is omitted:
             *
             *     if the item's parent has contexts set, then this item will inherit its parent's contexts
             *     otherwise, the item is given a context array of ["page"].
             */
            contexts: string[];
        }
    }

    /** Listen for the user executing commands that you have registered using the commands manifest.json key. */
    namespace commands {

        /** Fired when a command is executed using its associated keyboard shortcut. */
        namespace onCommand {

            /**
             * Adds a listener to this event.
             * @param callback Function that will be called when a user enters the command's shortcut.
             */
            function addListener(callback: (name: string) => void): void;
        }
    }

    /** Enables extensions to interact with the browser's download manager. You can use this API module to download files, cancel, pause, resume downloads, and show downloaded files in the file manager. */
    namespace downloads {

        /**
         * Downloads a file, given its URL and other optional preferences.
         * @param options An object specifying what file you wish to download, and any other preferences you wish to set concerning the download.
         * @returns A Promise. If the download started successfully, the promise will be fulfilled with the id of the new downloads.DownloadItem. Otherwise the promise will be rejected with an error message.
         */
        function download(options: IDownloadOptions): Promise<number>;

        /**
         * The search() function of the downloads API queries the DownloadItems available in the browser's downloads manager, and returns those that match the specified search criteria.
         * @param query A downloads.DownloadQuery object.
         * @returns A Promise. The promise is fulfilled with an array of downloads.DownloadItem objects that match the given criteria.
         */
        function search(query: IDownloadQuery): Promise<IDownloadItem[]>;

        // function addListener(callback: (download: IDownloadItem) => void);

        interface IDownloadQuery {

            /** An integer representing the ID of the downloads.DownloadItem you want to query. */
            id?: number;
        }

        interface IDownloadOptions {

            /** A string representing a file path relative to the default downloads directory — this provides the location where you want the file to be saved, and what filename you want to use. Absolute paths, empty paths, and paths containing back-references (../) will cause an error. If omitted, this value will default to the filename already given to the download file, and a location immediately inside the downloads directory. */
            filename?: string;

            /**
             * A boolean that specifies whether to provide a file chooser dialog to allow the user to select a filename (true), or not (false).
             *
             * If this option is omitted, the browser will show the file chooser or not based on the general user preference for this behavior (in Firefox this preference is labeled "Always ask you where to save files" in about:preferences, or browser.download.useDownloadDir in about:config).
             */
            saveAs?: boolean;

            /** A string representing the URL to download. */
            url: string;

            /** Default path to use in file picker. If the path does not exist, the default downloads directory will be used. */
            defaultPath?: string;

            /** Filters to show in the file picker. */
            filters?: IAppendFilter[];

            /** A string representing the action you want taken if there is a filename conflict, as defined in the downloads.FilenameConflictAction type (defaults to "uniquify" when it is not specified). */
            conflictAction?: FilenameConflictAction;
        }

        interface IAppendFilter {

            /** The title of the filter. */
            title?: string;

            /** The filter string. Multiple extensions may be included, separated by a semicolon and a space. */
            filter?: string;

            /** nsIFilePicker value. */
            predefinedFilter?: number;
        }

        interface IDownloadItem {

            /** A string indicating why a download was interrupted. Possible values are defined in the downloads.InterruptReason type. This is undefined if an error has not occurred. */
            error?: string;

            /** A string representing the file's absolute local path. */
            filename?: string;

            /** An integer representing a unique identifier for the downloaded file that is persistent across browser sessions. */
            id: number;

            /** A string representing the absolute URL from which the file was downloaded. */
            url: string;
        }
    }

    /** Enables extensions to store and retrieve data, and listen for changes to stored items. */
    namespace storage {

        /** Represents the local storage area. Items in local storage are local to the machine the extension was installed on. */
        namespace local {

            /**
             * Retrieves one or more items from the storage area.
             * @param keys A key (string) or keys (an array of strings or an object specifying default values) to identify the item(s) to be retrieved from storage. If you pass an empty string, object or array here, an empty object will be retrieved. If you pass null, or an undefined value, the entire storage contents will be retrieved.
             * @returns A Promise that will be fulfilled with a results object containing every object in keys that was found in the storage area. If the operation failed, the promise will be rejected with an error message.
             */
            function get(keys: null | string | string[] | { [key: string]: string | {} }): Promise<{ [key: string]: string | {} }>;

            /**
             * Gets the amount of storage space (in bytes) used one or more items being stored in the storage area.
             * @param keys A key (string) or keys (an array of strings) to identify the item(s) whose storage space you want to retrieve. If an empty string or array is passed in, 0 will be returned. If you pass null here, the function will return the space used by the entire storage area.
             * @returns A Promise that will be fulfilled with an integer, bytesUsed, representing the storage space used by the objects that were specified in keys. If the operation failed, the promise will be rejected with an error message.
             */
            function getBytesInUse(keys: null | string | string[]): Promise<number>;

            /**
             * Stores one or more items in the storage area. If the item already exists, its value will be updated. When you set a value, the storage.onChanged event will fire.
             * @param keys An object containing one or more key/value pairs to be stored in storage. If an item already exists, its value will be updated.
             *
             * Values may be primitive types (such as numbers, booleans, and strings) or Array types.
             *
             * It's generally not possible to store other types, such as Function, Date, RegExp, Set, Map, ArrayBuffer and so on. Some of these unsupported types will restore as an empty object, and some cause set() to throw an error. The exact behavior here is browser-specific.
             * @returns A Promise that will be fulfilled with no arguments if the operation succeeded. If the operation failed, the promise will be rejected with an error message.
             */
            function set(keys: { [key: string]: string | {} }): Promise<void>;

            /**
             * Removes one or more items from the storage area.
             * @param keys A string, or array of strings, representing the key(s) of the item(s) to be removed.
             * @returns A Promise that will be fulfilled with no arguments if the operation succeeded. If the operation failed, the promise will be rejected with an error message.
             */
            function remove(keys: string | string[]): Promise<void>;

            /**
             * Removes all items from the storage area.
             * @returns A Promise that will be fulfilled with no arguments if the operation succeeded. If the operation failed, the promise will be rejected with an error message.
             */
            function clear(): Promise<void>;
        }
    }

    interface ITab {

        /** The tab's ID. Tab IDs are unique within a browser session. The tab ID may also be set to tabs.TAB_ID_NONE for browser windows that don't host content tabs (for example, devtools windows). */
        id?: number;

        /** The URL of the document that the tab is displaying. Only present if the extension has the "tabs" permission. */
        url: string;
    }

    /** Interact with the browser's tab system. */
    namespace tabs {

        /**
         * Injects JavaScript code into a page.
         * @param tabId The ID of the tab in which to run the script. Defaults to the active tab of the current window.
         * @param details An object describing the script to run.
         * @returns A Promise that will be fulfilled with an array of objects, representing the result of the script in every injected frame.
         */
        function executeScript(tabId: number, details: IExecuteScriptDetails): Promise<any[]>;

        /**
         * Sends a single message from the extension's background scripts (or other privileged scripts, such as popup scripts or options page scripts) to any content scripts that belong to the extension and are running in the specified tab.
         *
         * The message will be received in the content scripts by any listeners to the runtime.onMessage event. Listeners may then optionally send a response back to the background script using the sendResponse argument.
         *
         * This is an asynchronous function that returns a Promise.
         * @param tabId ID of the tab whose content scripts we want to send a message to.
         * @param message An object that can be serialized to JSON.
         * @param options
         */
        function sendMessage(tabId: number, message: any, options?: ISendMessageOptions): Promise<any>;

        /** An object describing the script to run.  */
        interface IExecuteScriptDetails {
            /** If true, the code will be injected into all frames of the current page. If true and frameId is set, then it will raise an error,  frameId and allFrames are mutually exclusive. If it is false, code is only injected into the top frame. Defaults to false. */
            allFrames?: boolean;

            /** Code to inject, as a text string. Warning: Don’t use this property to interpolate untrusted data into JavaScript, as this could lead to a security issue. */
            code?: string;

            /** Path to a file containing the code to inject. In Firefox, relative URLs not starting at the extension root are resolved relative to the current page URL. In Chrome, these URLs are resolved relative to the extension's base URL. To work cross-browser, you can specify the path as a relative URL, starting at the extension's root, like this: "/path/to/script.js". */
            file?: string;

            /** The frame where the code should be injected. Defaults to 0 (the top-level frame). */
            frameId?: number;

            /** If true, the code will be injected into embedded "about:blank" and "about:srcdoc" frames if your extension has access to their parent document. The code cannot be inserted in top-level about: frames. Defaults to false. */
            matchAboutBlank?: boolean;

            /** The soonest that the code will be injected into the tab. Defaults to "document_idle". */
            runAt?: extensionTypes.RunAt;
        }

        interface ISendMessageOptions {

            /** Sends the message to a specific frame identified by frameId instead of all frames in the tab. Whether the content script is executed in all frames depends on the all_frames setting in the content_scripts section of manifest.json. */
            frameId?: number;
        }
    }

    namespace extensionTypes {

        enum RunAt {
            /** Corresponds to loading. The DOM is still loading. */
            "document_start" = "document_start",

            /** Corresponds to interactive. The DOM has finished loading, but resources such as scripts and images may still be loading. */
            "document_end" = "document_end",

            /** Corresponds to complete. The document and all its resources have finished loading. */
            "document_idle" = "document_idle",
        }

    }

    /** This module provides information about your extension and the environment it's running in. */
    namespace runtime {

        namespace onMessage {

            /**
             * Adds a listener to this event.
             * @param callback A listener function that will be called when this event occurs.
             */
            function addListener(callback: onMessage);
        }

        interface onMessage {
            /**
             * @param message The message itself. This is a JSON-ifiable object.
             * @param sender A runtime.MessageSender object representing the sender of the message.
             * @param sendResponse A function to call, at most once, to send a response to the message. The function takes a single argument, which may be any JSON-ifiable object. This argument is passed back to the message sender.
             *
             * If you have more than one onMessage listener in the same document, then only one may send a response.
             *
             * To send a response synchronously, call sendResponse before the listener function returns. To send a response asynchronously:
             * * either keep a reference to the sendResponse argument and return true from the listener function. You will then be able to call sendResponse after the listener function has returned.
             * * or return a Promise from the listener function and resolve the promise when the response is ready. This is a preferred way.
             * @returns The listener function can return either a Boolean or a Promise.
             */
            (message: any, sender: MessageSender, sendResponse: sendResponse): boolean | Promise<void> | any;
        }

        /** An object containing information about the sender of a message or connection request; this is passed to the runtime.onMessage() listener. */
        interface MessageSender {

            /** The ID of the extension that sent the message, if the message was sent by an extension. If the sender set an ID explicitly using the applications key in manifest.json, then id will have this value. Otherwise it will have the ID that was generated for the sender. */
            id?: string;
        }

        interface sendResponse {
            /**
             * @param response JSON-ifiable object to send back to the message sender.
             */
            (response: any): void
        }
    }
}
