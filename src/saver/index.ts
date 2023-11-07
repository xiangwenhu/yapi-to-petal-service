import { PathLike } from "fs";
import fsp from "fs/promises";

export function save(dist: PathLike, data: Record<string, any>) {
    const content = JSON.stringify(data, undefined, "\t");
    return fsp.writeFile(dist, content, "utf-8");
}
