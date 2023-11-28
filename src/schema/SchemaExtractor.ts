import { JSONSchema, Options } from "json-schema-to-typescript";
import { jsonSchemeToTypeScript } from ".";
import SchemaNameFactory from "./SchemaNameFactory";

const TYPES = ["array", "object"];

export default class SchemaExtractor {

    #oriSchema: JSONSchema;
    #root: JSONSchema;
    #nameFactory: SchemaNameFactory;

    constructor(private schema: JSONSchema) {
        this.#oriSchema = schema;
        this.#root = schema;
        this.#nameFactory = new SchemaNameFactory()
    }

    private clone(schema: JSONSchema) {
        return JSON.parse(JSON.stringify(schema)) as JSONSchema;
    }

    private recompileObject(
        schema: JSONSchema,
        parentKey: string | undefined
    ) {
        const rootSchema = this.#root;
        if (schema.type !== "object" || !schema.properties) {
            return schema;
        }

        const keyValues: [string, JSONSchema][] = Object.entries(
            schema.properties
        );
        for (let [key, pSchema] of keyValues) {
            const typeStr = pSchema.type as string;
            if (pSchema.default) {
                delete pSchema.default
            }
            if (!TYPES.includes(typeStr)) {
                continue;
            }
            // 对象
            if (pSchema.type === "object" && pSchema.properties) {
                const definitionName = this.#nameFactory.gen({
                    parentKey,
                    key,
                    schema: pSchema
                });
                rootSchema.definitions = rootSchema.definitions || {};
                rootSchema.definitions[definitionName] = this.recompileSchema(
                    pSchema
                );
                delete schema.properties[key].default;
                schema.properties[key] = {
                    $ref: `#/definitions/${definitionName}`,
                };
            } else if (pSchema.type === "array" && pSchema.items) {
                // 数组
                const newSchema = this.recompileArray(pSchema, key);
                delete schema.properties[key].default;
                schema.properties[key] = newSchema;
            }
        }
        return schema;
    }

    private recompileArray(schema: JSONSchema, parentKey: string | undefined) {
        const rootSchema = this.#root;
        if (schema.type !== "array" || !schema.items) {
            return schema;
        }

        if (!Array.isArray(schema.items)) {
            const definitionName = this.#nameFactory.gen({
                parentKey,
                key: "Item",
                schema: schema.items
            });
            rootSchema.definitions = rootSchema.definitions || {};
            rootSchema.definitions[definitionName] = this.recompileSchema(
                schema.items,
            );
            delete schema.default;
            schema.items = {
                $ref: `#/definitions/${definitionName}`,
            };
        } else {
            const items = schema.items.map((item) =>
                this.recompileSchema(item)
            );
            schema.items = items;
        }

        return schema;
    }

    private recompileSchema(
        schema: JSONSchema
    ) {
        // 么有属性 + 么有 items
        if (schema.type != "array" && schema.type !== "object") {
            return schema;
        }

        if (schema.type === "object") {
            return this.recompileObject(schema, undefined);
        }
        return this.recompileArray(schema, undefined);
    }

    async toTypeScript(name: string, options: Partial<Options> | undefined) {
        const schema = this.clone(this.schema);
        this.#root = schema;
        const newSchema = this.recompileSchema(schema);
        console.log("newSchema:", newSchema);
        const types = await jsonSchemeToTypeScript(newSchema, name, options);
        return types;
    }
}
