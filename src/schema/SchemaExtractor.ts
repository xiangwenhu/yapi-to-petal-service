import { Schema } from "inspector";
import { JSONSchema, Options } from "json-schema-to-typescript";
import { jsonSchemeToTypeScript } from ".";
import { firstToUpper } from "../util";
import _ from "lodash";

const TYPES = ["array", "object"];

export default class SchemaExtractor {
    constructor(private schema: JSONSchema) {}

    private clone(schema: JSONSchema) {
        return JSON.parse(JSON.stringify(schema)) as JSONSchema;
    }

    private recompileObject(
        schema: JSONSchema,
        rootSchema: JSONSchema = schema
    ) {
        if (schema.type !== "object" || !schema.properties) {
            return schema;
        }

        const keyValues: [string, JSONSchema][] = Object.entries(
            schema.properties
        );
        for (let [key, pSchema] of keyValues) {
            const typeStr = pSchema.type as string;
            if (!TYPES.includes(typeStr)) {
                continue;
            }
            // 对象
            if (pSchema.type === "object" && pSchema.properties) {
                const definitionName = firstToUpper(key);
                rootSchema.definitions = rootSchema.definitions || {};
                rootSchema.definitions[definitionName] = this.recompileSchema(
                    pSchema,
                    rootSchema
                );
                schema.properties[key] = {
                    $ref: `#/definitions/${definitionName}`,
                };
            } else if (pSchema.type === "array" && pSchema.items) {
                // 数组               
                const newSchema = this.recompileArray(pSchema, rootSchema);
                schema.properties[key] = newSchema;
            }
        }
        return schema;
    }

    private recompileArray(schema: JSONSchema, rootSchema: JSONSchema) {
        if (schema.type !== "array" || !schema.items) {
            return schema;
        }

        if (!Array.isArray(schema.items)) {
            const definitionName = firstToUpper(`${schema.title || ""}Items`);
            rootSchema.definitions = rootSchema.definitions || {};
            rootSchema.definitions[definitionName] = this.recompileSchema(
                schema.items,
                rootSchema
            );
            delete schema.default;
            schema.items = {
                $ref: `#/definitions/${definitionName}`,
            };
        } else {
            const items = schema.items.map((item) =>
                this.recompileSchema(item, rootSchema)
            );
            schema.items = items;
        }

        return schema;
    }

    private recompileSchema(
        schema: JSONSchema,
        rootSchema: JSONSchema = schema
    ) {
        // 么有属性 + 么有 items
        if (schema.type != "array" && schema.type !== "object") {
            return schema;
        }

        if (schema.type === "object") {
            return this.recompileObject(schema, rootSchema);
        }
        return this.recompileArray(schema, rootSchema);
    }

    async toTypeScript(name: string, options: Partial<Options> | undefined) {
        const schema = this.clone(this.schema);
        const newSchema = this.recompileSchema(schema);
        console.log("newSchema:", newSchema);
        const types = await jsonSchemeToTypeScript(newSchema, name, options);
        return types;
    }
}
