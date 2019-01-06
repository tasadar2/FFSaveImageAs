String.prototype.trimStart = function (this: string, value: string) {
    let result = this;
    value = value || " ";
    while (result.startsWith(value)) {
        result = result.substr(1);
    }
    return result;
};

String.prototype.trimEnd = function (this: string, value: string) {
    let result = this;
    value = value || " ";
    while (result.endsWith(value)) {
        result = result.substr(0, result.length - 1);
    }
    return result;
};
