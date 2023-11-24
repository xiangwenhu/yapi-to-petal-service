import { JSONSchema4 } from "json-schema";
import { compile, Options } from "json-schema-to-typescript";

export function jsonSchemeToTypeScript(schema: JSONSchema4, name: string, options: Partial<Options> | undefined) {
    return compile(schema, name, options);
}

; (async function (){


    
})();