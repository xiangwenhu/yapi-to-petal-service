export class QueryString {
    #qsObject: Record<string, string> = {};

    constructor(private url: string) {
        const qsStr = url.trim().split("?");
        if (qsStr.length > 1) {
            this.#qsObject = qsStr[1]
                .split("&")
                .reduce((obj: Record<string, string>, kv: string) => {
                    const kvArr = kv.split("=");
                    obj[decodeURIComponent(kvArr[0])] = decodeURIComponent(
                        kvArr[1]
                    );
                    return obj;
                }, {});
        }
    }

    get(key: string) {
        return this.#qsObject[key]
    }

    getJSON() {
        return JSON.parse(JSON.stringify(this.#qsObject));
    }
}
