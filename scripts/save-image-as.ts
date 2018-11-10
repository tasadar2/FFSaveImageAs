browser.commands.onCommand.addListener((command) => {
    if (command === "advanced-save-image-as") {
        console.log("test");
    }
});

browser.menus.create({
    contexts: ["image"],
    id: "advanced-save-image-as",
    title: "&Advanced Save Image As",
});

browser.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "advanced-save-image-as") {
        console.log(`pageUrl: ${tab.url}`);
        console.log(`imageUrl: ${info.srcUrl}`);
        const filename = parseFilename(info.srcUrl);
        console.log(`filename: ${filename}`);
        const pageUri = new Uri(tab.url);
        const storageKey = parseStorageKey(pageUri);
        console.log(`storageKey: ${storageKey}`);
        const defaultPath = await getDefaultPath(storageKey);
        console.log(`defaultPath: ${defaultPath}`);

        const downloadId = await browser.downloads.download({
            defaultPath,
            filename,
            filters: [{
                predefinedFilter: nsIFilePicker.filterImages,
            }],
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
            const downloadDirectory = Path.directory(download.filename);
            console.log(`downloadDirectory: ${downloadDirectory}`);
            await storePath(storageKey, downloadDirectory);
        }
    }
});

async function storePath(key: string, savePath: string): Promise<void> {
    console.log("saving...");
    await browser.storage.local.set({
        [key]: savePath,
    });
}

async function getDefaultPath(key: string): Promise<string> {
    const pairs = await browser.storage.local.get(key);
    return pairs[key] as string;
}

function parseStorageKey(uri: Uri): string {
    let segmentLength;
    switch (uri.domain) {
        case "hentai-foundry.com":
            segmentLength = 4;
        case "twitter.com":
        case "deviantart.com":
            segmentLength = 2;
        case "tumblr.com":
        default:
            segmentLength = 1;
            break;
    }

    return "site_" + Path.combine(...uri.segments.slice(0, segmentLength));
}

function parseFilename(address: string): string {
    let filename = address;
    if (address) {
        let index = address.lastIndexOf("/") + 1;
        if (index > -1 && address.length > index) {
            filename = address.substring(index);
        }

        index = filename.indexOf("?");
        if (index > -1) {
            filename = filename.substring(0, index);
        }

        if (filename.startsWith("file")) {
            const tempFilename = parseDownloadToken(address);
            if (tempFilename) {
                filename = tempFilename;
            }
        }
    }

    console.log(filename);
    return filename;
}

function parseDownloadToken(address: string): string {
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