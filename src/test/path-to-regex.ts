import { compile } from "path-to-regexp";

function pathToUrl(path: string, pathParams: Object | undefined) {
    path = path.replace(/\/\{/img, "/:").replace(/\}/, "");
    const toPath = compile(path, { encode: encodeURIComponent });
    const rPath = toPath(pathParams);
    return rPath;
}

const url = pathToUrl("/api/personnel/config/deleteRoleFieldConfig/{id}",{id:100});

console.log("url:", url)