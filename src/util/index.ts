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
    return str[0].toUpperCase() + str.slice(1)
}

export function strArrayToBeaut(strArr: string[]) {
    return strArr.map((str, index) => {
        return index === 0 ? str : firstToUpper(str)
    }).join("");
}


export function serverToCommonStr(server: string) {
    return server.replace(/http:\/\/|https:\/\//, '').replace(/\.|:/igm, "_")
}