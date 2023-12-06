import * as prettier from "prettier";

export function format(source: string, options?: prettier.Options) {
    return prettier.format(source, { semi: true, parser: "typescript", ...(options || {}) })
}