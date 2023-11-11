export function getFullApiDocUrl(params: {
    server: string;
    projectId: number;
    apiId: number;
}) {
    return `${params.server}/project/${params.projectId}/interface/api/${params.apiId}`;
}
