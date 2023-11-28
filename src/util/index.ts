import fs, { PathLike } from "fs";

export function ensureDir(pathLike: PathLike) {
    if (fs.existsSync(pathLike)) {
        return;
    }
    fs.mkdirSync(pathLike, {
        recursive: true
    })
}

export function firstToUpper(str: string) {
    if (typeof str !== "string" || str.length === 0) {
        return "";
    }
    return str[0].toUpperCase() + str.slice(1)
}

export function serverToCommonStr(server: string) {
    return server.replace(/http:\/\/|https:\/\//, '').replace(/\.|:/igm, "_")
}