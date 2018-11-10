String.prototype.trimStart = function (value) {
    let result = this;
    value = value || " ";
    while (result.startsWith(value)) {
        result = result.substr(1);
    }
    return result;
};

String.prototype.trimEnd = function (value) {
    let result = this;
    value = value || " ";
    while (result.endsWith(value)) {
        result = result.substr(0, result.length - 1);
    }
    return result;
};
