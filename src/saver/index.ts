import fsp from "fs/promises";
import _ from "lodash";
import { ensureDir } from "../util";
import path from "path";

export function save(
    dist: string,
    data: Record<string, any> | any[] | string
) {
    const content = _.isString(data)
        ? data
        : JSON.stringify(data, undefined, "\t");
    ensureDir(path.dirname(dist));
    return fsp.writeFile(dist, content, "utf-8");
}
