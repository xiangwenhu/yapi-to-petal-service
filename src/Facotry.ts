import path from "path";
import ConfigPuppet from "./config";
import { EAPIItem, ServiceGroup } from "./types";
import * as loader from "./loader";
import * as saver from "./saver";
import NamesFactory from "./code/NameFactory";
import { getFullApiDocUrl } from "./code/util";
import { genTypeScript } from "./code/ts";
import generateApiHeader from "./code/templates/api.header";
import { genRequest } from "./code/api";

export default class Factory {
    private configManager: ConfigPuppet;
    private eApiItems: EAPIItem[];

    private configDir: string;

    constructor(configPath: string) {
        this.configDir = path.dirname(configPath);
        this.configManager = new ConfigPuppet(configPath);
        this.eApiItems = [];
    }

    private async downloadProjects() {
        const { sites } = this.configManager.config;
        // 全部转为 EAPIItem
        const eApiItems: EAPIItem[] = [];
        for (let i = 0; i < sites.length; i++) {
            const site = sites[i];
            // TODO:: cache
            const eItems = await loader.downloadProjects(site, "");
            eApiItems.push(...eItems);
        }
        this.eApiItems = eApiItems;
    }

    async build() {
        await this.downloadProjects();
        const { types, services } = this.configManager.groupServices();
        await this.buildTypes(types);
        await this.buildServices(services);
    }

    private buildTypes(typesGroup: ServiceGroup[]) {
        const { configManager, eApiItems } = this;
        // 按照组，找到api，并且生成文件
        typesGroup.forEach(async (g) => {
            const eItems: EAPIItem[] = [];
            g.services.forEach((s) => {
                const sEItems = configManager.getServiceAPIItems(eApiItems, s);
                eItems.push(...sEItems);
            });
            console.log("eItems", eItems.length);

            const nameFactory = new NamesFactory(eItems);
            nameFactory.gen();

            eItems.forEach((item) => {
                const names = nameFactory.getName(item);
                item.type = {
                    ...names,
                    docUrl: getFullApiDocUrl({
                        server: item.site.server,
                        projectId: item.project.id!,
                        apiId: item.api._id,
                    }),
                };
            });

            const tsStr = await genTypeScript(eItems);
            console.log("tsStr:", tsStr);
            saver.save(g.filePath, tsStr);
        });
    }

    private async buildServices(servicesGroup: ServiceGroup[]) {
        const { configManager, eApiItems } = this;
        // 生成文件
        for (let i = 0; i < servicesGroup.length; i++) {
            const g = servicesGroup[i];
            let servicesContent: string[] = [];
            let headersContent: string[] = [];
            headersContent.push(`import axios from "axios"`);
            headersContent.push(`import { compile } from "path-to-regexp";`);
            for (let sIndex = 0; sIndex < g.services.length; sIndex++) {
                const service = g.services[sIndex];
                const sEItems = configManager.getServiceAPIItems(
                    eApiItems,
                    service
                );
                const requestHeaderStr = generateApiHeader(
                    sEItems,
                    service.relativePath!
                );
                const requestStr = await genRequest(sEItems);

                headersContent.push(requestHeaderStr);
                servicesContent.push(requestStr);
            }
            headersContent.push("\r\n");
            headersContent.push(
                `
function pathToUrl(path: string, pathParams: Object | undefined) {
    const toPath = compile(path, { encode: encodeURIComponent });
    const rPath = toPath(pathParams);
    return rPath;
}`.trim()
            );
            const content =
                headersContent.join("\r\n") +
                "\r\n\r\n" +
                servicesContent.join("\r\n");

            saver.save(g.filePath, content);
        }
    }
}
