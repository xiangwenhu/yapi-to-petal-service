import { compile } from "path-to-regexp";

function pathToUrl(path: string, pathParams: Record<string, string>) {
    const toPath = compile(path, { encode: encodeURIComponent });
    const rPath = toPath(pathParams);
    return rPath;
}
