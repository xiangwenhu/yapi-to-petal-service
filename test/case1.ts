import { QueryString } from "../src/QueryString";
import { IConfig } from "../src/types/config";
import * as loader from "../src/loader";
import * as saver from "../src/saver";
import { ProjectInfo } from "../src/types";
import path from "path";
import { ensureDir } from "../src/util";
import { genTypeScript } from "../src/code/ts";

const config: IConfig = require("../demodata/config/demo.json");


async function downloadProjects(cProjects: IConfig.YPIProject[], cacheProjectsPath: string) {
    // 生成新project数据结构，并本地缓存
    const projects: ProjectInfo[] = [];
    for (let i = 0; i < cProjects.length; i++) {
        const p = cProjects[i];
        const data = await loader.getProjectData(p.remoteUrl);
        const pData: ProjectInfo = {
            apiList: [],
            ...p,
            cates: data
        };
        projects.push(pData);
    }

    return projects;
}


(async function () {
    console.log("config:", config);

    // 解析remoteUrl，设置 projectId 和 server
    const { projects: cProjects, targetFolder, defaultExport, items } = config;
    cProjects.forEach((p) => {
        const qs = new QueryString(p.remoteUrl);
        p.projectId = +qs.get("pid");
        p.server = new URL(p.remoteUrl).origin
    });

    const cachePath = path.join(__dirname, "../.cache");
    const cacheProjectsPath = path.join(cachePath, "projects");

    ensureDir(cacheProjectsPath)

    // 下载projects信息
    const projects = await downloadProjects(cProjects, cacheProjectsPath);

    // 缓存
    projects.forEach(p => {
        const dist = path.join(
            cacheProjectsPath,
            `${p.server.replace(/[(:\/\)|:]/img, "_")}-${p.projectId}.json`
        );
        saver.save(dist, p)
    });

    // 展开 cate的api
    projects.forEach(p => {
        p.apiList = [];
        p.cates.forEach(c => {
            p.apiList.push(...c.list)
        })
    })

    const tsStr = await genTypeScript(projects[0].apiList);

    console.log("tsStr:", tsStr);


})();
