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

            interface IOnClickData {
                /** The ID of the menu item that was clicked. */
                menuItemId: number | string;
                /** Will be present for elements with a "src" URL. */
                srcUrl?: string;
            }
        }

        /**
         * Creates a new menu item.
         * @param createProperties Properties for the new menu item.
         * @param callback Called when the item has been created. If there were any problems creating the item, details will be available in runtime.lastError.
         */
        function create(createProperties: IContextMenu, callback?: () => void): number | string;

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

        /** The URL of the document that the tab is displaying. Only present if the extension has the "tabs" permission. */
        url: string;
    }
}
