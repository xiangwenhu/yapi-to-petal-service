import path from "path";
import NamesFactory from "../src/code/NameFactory";
import { genRequest } from "../src/code/api";
import generateApiHeader from "../src/code/templates/api.header";
import { genTypeScript } from "../src/code/ts";
import { getFullApiDocUrl } from "../src/code/util";
import ConfigPuppet from "../src/config";
import * as loader from "../src/loader";
import * as saver from "../src/saver";
import { EAPIItem } from "../src/types";
import { ensureDir } from "../src/util";

const configPath = path.join(__dirname, "../demodata/config/demo.json");

(async function () {
    const configManager = new ConfigPuppet(configPath)
    console.log("config:", configManager.config);

    const { sites, serviceFolder, typesFolder } = configManager.config;

    // 计算出 service和types的目录
    const configDir = path.dirname(configPath);
    const absServiceFolder = path.join(configDir, serviceFolder);
    const absTypeFolder = path.join(configDir, typesFolder);

    console.log("serviceFolder", absServiceFolder);
    console.log("absTypeFolder", absTypeFolder);


    const cachePath = path.join(__dirname, "../.cache");
    const cacheProjectsPath = path.join(cachePath, "projects");
    ensureDir(cacheProjectsPath);

    // 全部转为 EAPIItem
    const eApiItems: EAPIItem[] = [];
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const eItems = await loader.downloadProjects(site, cacheProjectsPath);
        eApiItems.push(...eItems);
    }


    const { services: servicesGroup, types: typesGroup } = configManager.groupServices();

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

        eItems.forEach(item => {
            const names = nameFactory.getName(item);
            item.type = {
                ...names,
                docUrl: getFullApiDocUrl({
                    server: item.site.server,
                    projectId: item.project.id!,
                    apiId: item.api._id
                })
            }
        })

        const tsStr = await genTypeScript(eItems);
        console.log("tsStr:", tsStr);
        saver.save(g.filePath, tsStr);
    });


    // 生成文件
    for (let i = 0; i < servicesGroup.length; i++) {
        const g = servicesGroup[i];
        let servicesContent: string[] = [];
        let headersContent: string[] = [];
        headersContent.push(`import axios from "axios"`)
        for (let sIndex = 0; sIndex < g.services.length; sIndex++) {
            const service = g.services[sIndex];
            const sEItems = configManager.getServiceAPIItems(eApiItems, service);
            const requestHeaderStr = generateApiHeader(sEItems, service.relativePath!);
            const requestStr = await genRequest(sEItems);

            headersContent.push(requestHeaderStr);
            servicesContent.push(requestStr);
        }
        const content = headersContent.join("\r\n") + "\r\n\r\n" + servicesContent.join("\r\n");

        saver.save(g.filePath, content);
    }


})();
