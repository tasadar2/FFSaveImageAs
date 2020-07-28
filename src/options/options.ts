const optionsKey = "options";
let domainOptions: IDomainOptions[];

async function loadOptions() {
    const options = await browser.storage.local.get(optionsKey);
    if (options && options.options && options.options.domains) {
        domainOptions = options.options.domains as IDomainOptions[];
        addDomainOptionsUI();
    } else {
        domainOptions = [];
    }
}

function addDomainOptionsUI() {
    $("#domains").html("");
    for (let index = 0; index < domainOptions.length; index++) {
        const element = addDomainOptionUI(index);
        viewDomainOptionUI(element, domainOptions[index]);
    }
}

function addDomainOption() {
    const domainOption = {
        domain: "example.com",
        fileFormat: "",
        storageKeySegmentLength: 2,
    };
    const index = domainOptions.push(domainOption) - 1;
    const element = addDomainOptionUI(index);
    editDomainOptionUI(element, domainOption);
}

function addDomainOptionUI(index: number): JQuery {
    const newItem = $(`<tr class="domain-option" domain-id="${index}"></tr>`);
    $("#domains").append(newItem);
    return newItem;
}

function viewDomainOptionUI(element: JQuery, domainOption: IDomainOptions) {
    element.html(
        `<td class="domain">${domainOption.domain}</td>` +
        `<td class="key">${domainOption.storageKeySegmentLength}</td>` +
        `<td class="file">${nullableView(domainOption.fileFormat)}</td>` +
        `<td class="action pull-right"><button class="edit-domain">Edit</button></td>`,
    );
}

function editDomainOption(element: JQuery) {
    const domainOption = getDomainOption(element);
    if (domainOption) {
        editDomainOptionUI(element, domainOption);
    }
}

function editDomainOptionUI(element: JQuery, domainOption: IDomainOptions) {
    element.html(
        `<td class="domain"><div><input class="w-100" type="text" value="${domainOption.domain}" /></div></td>` +
        `<td class="key"><div><input class="w-100" type="text" value="${domainOption.storageKeySegmentLength}" /></div></td>` +
        `<td class="file"><div><input class="w-100" type="text" value="${nullableView(domainOption.fileFormat)}" /></div></td>` +
        `<td class="action pull-right"><button class="remove-domain">Remove</button><button class="save-domain">Save</button></td>`,
    );
}

async function saveDomainOption(element: JQuery) {
    const domainOption = getDomainOption(element);
    if (domainOption) {
        await browser.storage.local.remove(getDomainKey(domainOption.domain));
        domainOption.domain = element.find(".domain > div > input").val() as string;
        domainOption.storageKeySegmentLength = element.find(".key > div > input").val() as number;
        domainOption.fileFormat = nullableValue(element.find(".file > div > input").val() as string);
        viewDomainOptionUI(element, domainOption);
        await saveOptions();
    }
}

function nullableValue(value: string): string | undefined {
    return value || undefined;
}

function nullableView(value: string | undefined): string {
    if (value) {
        return value.toString();
    }
    return "";
}

async function saveOptions() {
    const pairs: { [key: string]: any } = {
        [optionsKey]: {
            domains: domainOptions,
        },
    };
    for (const domainOption of domainOptions) {
        pairs[getDomainKey(domainOption.domain)] = domainOption;
    }
    await browser.storage.local.set(pairs);
}

async function removeDomainOption(element: JQuery) {
    const domainId = element.attr("domain-id");
    if (domainId) {
        const index = Number.parseInt(domainId, 10);
        const domainOption = domainOptions[index];
        await browser.storage.local.remove(getDomainKey(domainOption.domain));
        domainOptions.splice(index);
        await saveOptions();
        addDomainOptionsUI();
    }
}

function getDomainOption(element: JQuery): IDomainOptions | undefined {
    const domainId = element.attr("domain-id");
    if (domainId) {
        const index = Number.parseInt(domainId, 10);
        return domainOptions[index];
    }
}

async function exportDomainKeys() {
    const all = await browser.storage.local.get();
    const keys: { [key: string]: string } = {};
    for (const key in all) {
        if (all.hasOwnProperty(key)) {
            if (key.startsWith("site_")) {
                keys[key] = all[key];
            }
        }
    }

    const keysExport = JSON.stringify(keys);
    const pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(keysExport));
    pom.setAttribute("download", "ImageLocationExport.json");

    if (document.createEvent) {
        const event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

function importDomainKeysOpen() {
    $("#import-keys-input").trigger("click");
}

async function importDomainKeys(input: HTMLInputElement) {
    let file!: File;
    if (input && input.files != null) {
        file = input.files[0];
    }
    if (file) {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
            reader.onload = () => {
                resolve();
            };
            reader.onerror = (e) => {
                reject(e);
            };
            reader.readAsText(file);
        });
        const content = reader.result as string;
        const keys = JSON.parse(content);
        await browser.storage.local.set(keys);
    }
}

$(async () => {
    $(document).on("click", ".add-domain", () => {
        addDomainOption();
    });

    $(document).on("click", ".edit-domain", (element) => {
        const domainOptionElement = $(element.target).closest(".domain-option");
        editDomainOption(domainOptionElement);
    });

    $(document).on("click", ".save-domain", async (element) => {
        const domainOptionElement = $(element.target).closest(".domain-option");
        await saveDomainOption(domainOptionElement);
    });

    $(document).on("click", ".remove-domain", async (element) => {
        const domainOptionElement = $(element.target).closest(".domain-option");
        await removeDomainOption(domainOptionElement);
    });

    $("#import-keys").on("click", () => {
        importDomainKeysOpen();
    });

    $("#import-keys-input").on("change", async (e) => {
        await importDomainKeys(e.target as HTMLInputElement);
    });

    $("#export-keys").on("click", async () => {
        await exportDomainKeys();
    });

    await loadOptions();
});
