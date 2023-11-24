import { Schema } from "inspector";
import { JSONSchema, Options } from "json-schema-to-typescript";
import { jsonSchemeToTypeScript } from ".";


const TYPES = ["array", "object"];

export default class SchemaSplit {
    constructor(private schema: JSONSchema,) {
    }

    private clone(schema: JSONSchema) {
        return JSON.parse(JSON.stringify(schema)) as JSONSchema
    }

    private compileSchema(schema: JSONSchema, rootSchema: JSONSchema = schema) {
        if (schema.properties == undefined) {
            return schema;
        }

        for (let [key, pSchema] of Object.entries(schema.properties)) {
            //TODO:: 仅仅适用 yapi,
            const typeStr = pSchema.type as string;
            if (!TYPES.includes(typeStr)) {
                continue;
            }
            // 对象
            if (pSchema.type === "object") {
                rootSchema.definitions = rootSchema.definitions || {};
                rootSchema.definitions[key] = this.compileSchema(pSchema, rootSchema);
                schema.properties[key] = { $ref: `#/definitions/${key}` };
            }
            // 数组
            //TODO:: 仅仅适用 yapi,
            const itemsSchema = pSchema.items as JSONSchema;
            rootSchema.definitions = rootSchema.definitions || {};
            rootSchema.definitions[key] = this.compileSchema(pSchema, rootSchema);
            schema.properties[key] = { $ref: `#/definitions/${key}`, type: "array" };
        }

        return schema
    }


    async toTypeScript(name: string, options: Partial<Options> | undefined) {
        const schema = this.clone(this.schema);
        const newSchema = this.compileSchema(schema);
        console.log("newSchema:", newSchema);
        const types = await jsonSchemeToTypeScript(newSchema, name, options);
        return types
    }


}