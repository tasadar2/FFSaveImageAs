function getElement(message: any, sender: browser.runtime.MessageSender, sendResponse: browser.runtime.sendResponse) {
    const element: any = {};
    if (sender.id === "{cc19018e-8d71-4999-9f19-5dfb71ee176a}") {
        const targetElement = browser.menus.getTargetElement(message.elementId);
        for (const attribute of targetElement.attributes) {
            element[attribute.name] = attribute.value;
        }
        sendResponse(element);
    }
}

browser.runtime.onMessage.addListener(getElement);
