import { PathLike } from "fs";
import fsp from "fs/promises";
import _ from "lodash";

export function save(
    dist: PathLike,
    data: Record<string, any> | any[] | string
) {
    const content = _.isString(data)
        ? data
        : JSON.stringify(data, undefined, "\t");
    return fsp.writeFile(dist, content, "utf-8");
}
