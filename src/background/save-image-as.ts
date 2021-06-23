const lastDirectoryKey = "lastDirectory";

browser.commands.onCommand.addListener((command) => {
    if (command === "advanced-save-image-as") {
        console.log("test");
    }
});

browser.menus.create({
    contexts: ["image"],
    id: "advanced-save-image-as",
    title: "Advanced Save I&mage As",
});

browser.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "advanced-save-image-as" && info.srcUrl) {
        console.log(`pageUrl: ${tab.url}`);
        console.log(`imageUrl: ${info.srcUrl}`);
        let filename = parseFilename(info.srcUrl);
        console.log(`filename: ${filename}`);
        const pageUri = cleanUri(new Uri(tab.url));
        const domainOption = await getDomainOption(getDomainKey(pageUri.domain));
        const storageKey = parseStorageKey(pageUri, domainOption);
        console.log(`storageKey: ${storageKey}`);
        const defaultPath = await getDefaultPath(storageKey);
        console.log(`defaultPath: ${defaultPath}`);
        let element: any;
        if (info.targetElementId) {
            element = await getElement(tab, info.targetElementId);
        }
        if (domainOption) {
            const replacements: { [key: string]: string } = {
                filename,
            };
            if (element) {
                for (const key of Object.keys(element)) {
                    replacements[`element.${key}`] = element[key];
                }
            }
            filename = formatFileName(domainOption, replacements);
            console.log(`formatted filename: ${filename}`);
        }
        filename = sanitizeFilename(filename);
        console.log(`sanitized filename: ${filename}`);

        const downloadId = await browser.downloads.download({
            // overwrite results in the prompt behavior
            // prompt is not used because it is documented, but not implemented...
            conflictAction: FilenameConflictAction.overwrite,
            defaultPath,
            filename,
            saveAs: true,
            url: info.srcUrl,
        });
        console.log(`downloadId: ${downloadId}`);

        const downloads = await browser.downloads.search({
            id: downloadId,
        });
        console.log(`downloads.length: ${downloads.length}`);

        if (downloads && downloads.length > 0) {
            const download = downloads[0];
            console.log(`download.filename: ${download.filename}`);
            if (download.filename) {
                const downloadDirectory = Path.directory(download.filename);
                console.log(`downloadDirectory: ${downloadDirectory}`);
                await storePath(storageKey, downloadDirectory);
            }
        }
    }
});

async function getDomainOption(domainKey: string): Promise<IDomainOptions | undefined> {
    const pairs = await browser.storage.local.get(domainKey);
    const domainOption = pairs[domainKey] as IDomainOptions;
    if (domainOption) {
        return domainOption;
    }
}

function formatFileName(domainOption: IDomainOptions, replacements: { [key: string]: string }): string {
    let filename = replacements.filename;
    if (domainOption.fileFormat) {
        filename = domainOption.fileFormat;
        for (const key of Object.keys(replacements)) {
            filename = filename.replace(`{${key}}`, replacements[key]);
        }

        if (!Path.extension(filename)) {
            filename += Path.extension(replacements.filename);
        }
    }
    return filename;
}

async function getElement(tab: browser.ITab, elementId: number): Promise<any> {
    if (tab.id) {
        return await browser.tabs.sendMessage(tab.id, {
            elementId,
        });
    }
}

function cleanUri(uri: Uri): Uri {
    if (uri.protocol === "wyciwyg") {
        let index = uri.url.lastIndexOf("://");
        index = uri.url.lastIndexOf("/", index);
        uri = new Uri(uri.url.substr(index + 1));
    }

    return uri;
}

function sanitizeFilename(filename: string): string {
    filename = filename.replace(/[\\/:*?"<>|]/g, "-");
    const illegalBeginning = /^[ .]/;
    while (illegalBeginning.test(filename)) {
        filename = filename.replace(illegalBeginning, "");
    }
    return filename;
}

async function storePath(key: string, savePath: string): Promise<void> {
    console.log("saving...");
    await browser.storage.local.set({
        [key]: savePath,
        [lastDirectoryKey]: savePath,
    });
}

async function getDefaultPath(key: string): Promise<string> {
    const pairs = await browser.storage.local.get([key, lastDirectoryKey]);
    let path = pairs[key];
    if (!path) {
        path = pairs[lastDirectoryKey];
    }

    return path as string;
}

function parseStorageKey(uri: Uri, domainOption?: IDomainOptions): string {
    let segmentLength = 1;
    if (domainOption) {
        segmentLength = domainOption.storageKeySegmentLength;
    }

    return "site_" + Path.combine(...uri.segments.slice(0, segmentLength));
}

function parseFilename(address: string): string {
    let filename = address;
    if (address) {
        const index = address.lastIndexOf("/") + 1;
        if (index > -1 && address.length > index) {
            filename = address.substring(index);
        }

        const parts = filename.split(/[?:]/);
        filename = parts[0];

        if (filename.startsWith("file")) {
            const tempFilename = parseDownloadToken(address);
            if (tempFilename) {
                filename = tempFilename;
            }
        }
    }

    filename = decodeURI(filename);
    console.log(filename);
    return filename;
}

function parseDownloadToken(address: string): string | undefined {
    let filename;
    if (address) {
        let index = address.indexOf("downloadToken=") + 14;
        if (index > -1 && address.length > index) {
            let downloadToken = address.substring(index);

            index = downloadToken.indexOf("&");
            if (index > -1) {
                downloadToken = downloadToken.substring(0, index);
            }

            const rawTokens = downloadToken.split(".");
            for (const rawToken of rawTokens) {
                try {
                    const token = JSON.parse(atob(rawToken));
                    console.log(token);
                    console.log(token.payload);
                    console.log(token.payload.path);
                    if (token.payload.path) {
                        const tempFilename = parseFilename(token.payload.path);
                        if (tempFilename) {
                            filename = tempFilename;
                        }
                    }
                } catch (error) {
                    // not a valid token
                }
            }
        }
    }

    return filename;
}
