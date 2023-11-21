import { FactoryOptions } from "../types/factory";

const builtInOptions: FactoryOptions = {
    apis: {
        header(sg) {
            let headers: string[] = [];
            const useCustomRequest = sg.services.some(s => s.useCustomRequest);
            if (!useCustomRequest) {
                headers.push(`import axios from "axios"`);
            }
            headers.push(`import { compile } from "path-to-regexp";`);
            return headers;
        },
        content() {
            let contents: string[] = [];

            contents.push("\r\n");
            contents.push(
                `
function pathToUrl(path: string, pathParams: Object | undefined) {
    path = path.replace(/\\/\\{/img, "/:").replace(/\\}/img, "");
    const toPath = compile(path, { encode: encodeURIComponent });
    const rPath = toPath(pathParams);
    return rPath;
}`.trim())

            return contents;
        }
    }
};


export default builtInOptions;