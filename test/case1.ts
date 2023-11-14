import path from "path";
import { QueryString } from "../src/QueryString";
import * as loader from "../src/loader";
import { EAPIItem } from "../src/types";
import { IConfig } from "../src/types/config";
import { CateItem } from "../src/types/yapi";
import { ensureDir } from "../src/util";
import { genTypeScript } from "../src/code/ts";
import * as saver from "../src/saver";
import { getFullApiDocUrl } from "../src/code/util";
import NamesFactory from "../src/code/NameFactory";
import { genRequest } from "../src/code/api";
import generateApiHeader from "../src/code/templates/api.header";

const configPath = path.join(__dirname, "../demodata/config/demo.json");
const config: IConfig = require(configPath);

async function downloadProjects(
    site: IConfig.SiteItem,
    cacheProjectsPath: string
) {
    // 生成新project数据结构，并本地缓存
    const eApiItems: EAPIItem[] = [];

    for (let i = 0; i < site.projects.length; i++) {
        const project = site.projects[i];
        const cates: CateItem[] = await loader.getProjectData(
            project.remoteUrl!
        );
        cates.forEach((cate) => {
            const eItems = cate.list.map((api) => {
                const eItem: EAPIItem = {
                    api,
                    project,
                    cate,
                    site,
                };
                return eItem;
            });
            eApiItems.push(...eItems);
        });
    }
    return eApiItems;
}


interface ServiceGroup {
    filePath: string;
    services: IConfig.ServiceItem[];
}

function getServiceAPIItems(allEApiItems: EAPIItem[], service: IConfig.ServiceItem) {
    const eItems: EAPIItem[] = [];
    switch (service.type) {
        case "api":
            eItems.push(
                ...allEApiItems.filter((api) =>
                    service.items.includes(api.api._id)
                )
            );
            break;
        case "cate":
            eItems.push(
                ...allEApiItems.filter((api) =>
                    service.items.includes(api.api.catid)
                )
            );
            break;
        case "project":
            eItems.push(
                ...allEApiItems.filter((api) =>
                    service.items.includes(api.project.id!)
                )
            );
            break;
        default:
            break;
    }
    return eItems;
}


(async function () {
    console.log("config:", config);

    const { sites, serviceFolder, typesFolder } = config;

    // 计算出 service和types的目录
    const configDir = path.dirname(configPath);
    const absServiceFolder = path.join(configDir, serviceFolder);
    const absTypeFolder = path.join(configDir, typesFolder);

    console.log("serviceFolder", absServiceFolder);
    console.log("absTypeFolder", absTypeFolder);

    // 解析remoteUrl，设置 projectId 和 server
    // 计算每个service file 和 types file的相对路径
    sites.forEach((site) => {
        for (let i = 0; i < site.projects.length; i++) {
            const project = site.projects[i];
            if (project.remoteUrl && project.remoteUrl.startsWith("http")) {
                const qs = new QueryString(project.remoteUrl);
                project.id = +qs.get("pid");
                project.token = qs.get("token");
                continue;
            } else if (project.id && project.token) {
                project.remoteUrl = `${site.server}/api/open/plugin/export-full?type=json&pid=${project.id}&status=all&token=${project.token}`;
                continue;
            }
            throw new Error("project 必须配置 remoteUrl, 或者 id和token");
        }

        site.services.forEach(service => {
            const typesFileName = (service.fileName || "service") + ".types.ts"
            const sFolder = service.serviceFolder || site.serviceFolder || serviceFolder;
            const tFolder = service.typesFolder || site.serviceFolder || typesFolder;
            const rPath = path.relative(sFolder, tFolder);
            service.relativePath = path.join(
                rPath,
                typesFileName
            )

        })
    });

    const cachePath = path.join(__dirname, "../.cache");
    const cacheProjectsPath = path.join(cachePath, "projects");

    ensureDir(cacheProjectsPath);

    // 全部转为 EAPIItem
    const eApiItems: EAPIItem[] = [];
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const eItems = await downloadProjects(site, cacheProjectsPath);
        eApiItems.push(...eItems);
    }
    console.log("eApiItems:", eApiItems.length);

    // types 按照fileName 分组
    const sFileGroups: Record<
        string,
        ServiceGroup
    > = {};
    sites.forEach((site) => {
        site.services.forEach((service) => {
            const name = (service.fileName || "service") + ".ts";
            const serviceFilPath = path.join(
                configDir,
                service.serviceFolder || site.serviceFolder || serviceFolder,
                name
            );

            if (!sFileGroups[serviceFilPath])
                sFileGroups[serviceFilPath] = {
                    filePath: serviceFilPath,
                    services: [],
                };
            sFileGroups[serviceFilPath].services.push(service);
        });
    });

    // types 按照fileName 分组
    const tFileGroups: Record<
        string,
        ServiceGroup
    > = {};
    sites.forEach((site) => {
        site.services.forEach((service) => {
            const typesFileName = (service.fileName || "service") + ".types.ts"
            const fTypesFile = path.join(
                configDir,
                service.typesFolder || site.typesFolder || typesFolder,
                typesFileName
            );

            if (!tFileGroups[fTypesFile])
                tFileGroups[fTypesFile] = {
                    filePath: fTypesFile,
                    services: [],
                };
            tFileGroups[fTypesFile].services.push(service);
        });
    });

    // console.log("分组后:", sFileGroups, tFileGroups);

    const sGroups = Array.from(Object.values(sFileGroups));
    const tGroups = Array.from(Object.values(tFileGroups));

    // 按照组，找到api，并且生成文件
    tGroups.forEach(async (g) => {
        const eItems: EAPIItem[] = [];
        g.services.forEach((s) => {
            const sEItems = getServiceAPIItems(eApiItems, s);
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
    for (let i = 0; i < sGroups.length; i++) {
        const g = sGroups[i];
        let servicesContent: string[] = [];
        let headersContent: string[] = [];
        headersContent.push(`import axios from "axios"`)
        for (let sIndex = 0; sIndex < g.services.length; sIndex++) {
            const service = g.services[sIndex];
            const sEItems = getServiceAPIItems(eApiItems, service);
            const requestHeaderStr = generateApiHeader(sEItems, service.relativePath!);
            const requestStr = await genRequest(sEItems);

            headersContent.push(requestHeaderStr);
            servicesContent.push(requestStr);
        }
        const content = headersContent.join("\r\n") + "\r\n\r\n" + servicesContent.join("\r\n");

        saver.save(g.filePath, content);
    }



})();
