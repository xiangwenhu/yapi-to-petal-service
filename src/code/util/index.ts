
export function getFullApiDocUrl(params: {
    server: string;
    projectId: number;
    apiId: number;
}) {
    return `${params.server}/project/${params.projectId}/interface/api/${params.apiId}`;
}



export function fixTypesFilePath(relativePath: string) {
    let fp = relativePath;
    if (fp.endsWith(".ts")) {
        fp = fp.slice(0, -3);
    }
    fp = fp.replace(/\\/img, "/");
    if (!fp.startsWith(".") && !fp.startsWith("/")) {
        return `./${fp}`
    }
    return fp;
}
