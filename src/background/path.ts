class Path {

    public static combine(...values: string[]): string {
        let combined = "";
        for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
            let value = this.sanitize(values[valueIndex]);
            if (valueIndex !== 0) {
                combined += "/";
                value = value.trimStart("/");
            }

            if (valueIndex < values.length - 1) {
                value = value.trimEnd("/");
            }

            combined += value;
        }

        return combined;
    }

    public static directory(path: string): string {
        const pathReference = this.sanitize(path);
        const index = pathReference.lastIndexOf("/");
        if (index > -1) {
            return path.substr(0, index);
        }
        return "";
    }

    public static sanitize(path: string): string {
        path = path.replace(/\\/g, "/");
        return path.replace(/\/\//g, "/");
    }

    public static extension(path: string): string {
        let pathReference = this.sanitize(path);
        let index = pathReference.lastIndexOf("/");
        if (index > -1) {
            pathReference = pathReference.slice(index);
            index = pathReference.lastIndexOf(".");
            if (index > -1) {
                return pathReference.slice(index);
            }
        }
        return "";
    }
}
