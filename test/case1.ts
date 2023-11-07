import { QueryString } from "../src/QueryString";
import { IConfig } from "../src/types/config";
import * as loader from "../src/loader";
import * as saver from "../src/saver";
import { ProjectInfo } from "../src/types";
import path from "path";

const config: IConfig = require("../demodata/config/demo.json");

(async function () {
    console.log("config:", config);

    // 设置 projectId
    const cProjects = config.projects;
    cProjects.forEach((p) => {
        const qs = new QueryString(p.remoteUrl);
        p.projectId = +qs.get("pid");
        p.server = new URL(p.remoteUrl).host
    });
    console.log("projects:", cProjects);

    const cachePath = path.join(__dirname, "../.cache");
    const cacheProjectsPath = path.join(cachePath, "projects");
    const projects: ProjectInfo[] = [];
    for (let i = 0; i < cProjects.length; i++) {
        const p = cProjects[i];
        const data = await loader.getProjectData(p.remoteUrl);

        const dist = path.join(
            cacheProjectsPath,
            `${p.server.replace(":", "-")}-${p.projectId}.json`
        );
        saver.save(dist, data);

        projects.push({
            ...p,
            cates: data,
        });
    }
})();
