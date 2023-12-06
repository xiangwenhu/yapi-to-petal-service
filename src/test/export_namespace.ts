const content = `/**
 * 员工职务变更请求参数
 * path: /api/personnel/userManager/userPositionChange
 * doc url: https://mis.jjmatch.cn:4000/project/395/interface/api/5793
 */
export interface ReqUserPositionChangeBody {
  /**
   * 职务级别
   */
  DutyLevel?: number;
  /**
   * 用户ID
   */
  UserID?: number;
  /**
   * 职务列表
   */
  UserPosition?: UserPositionItem[];
}
export interface UserPositionItem {
  /**
   * 职务编码
   */
  PositionCode?: string;
  /**
   * 职务名称
   */
  PositionName?: string;
  /**
   * 组织ID
   */
  OrgID?: number;
  /**
   * 组织名称
   */
  OrgName?: string;
  /**
   * 是否主职务
   */
  IsMain?: boolean;
  /**
   * 任职开始时间
   */
  TermBegin?: string;
  /**
   * 任职结束时间
   */
  TermEnd?: string;
}
`

const SPLIT_STR = `export interface`;
function generateNamespace(typesStr: string, namespaceName: string): string {

  const arr = typesStr.split(SPLIT_STR);
  if (arr.length == 2) {
    return typesStr;
  }

  const basePart = arr.slice(0, 2).join(SPLIT_STR);
  const namespacePart = `${SPLIT_STR}` + arr.slice(2).join(SPLIT_STR);

  const rBasePart = basePart + namespacePart

  return `
${basePart}

export namespace ${namespaceName}{
${namespacePart}
}
  `
}

// const result = generateNamespace(content, 'ReqUserPositionChangeBody');

// console.log("result:", result);

const rContent = `export interface ResUserCompoundInfoBody {
  /**
   * 返回标记：成功=200，失败=-1
   */
  code?: number;
  /**
   * 返回信息
   */
  message?: string;
  /**
   * 返回是否成功
   */
  success?: boolean;
  data?: Data[];
}`

const REGEX_TS_KV = /(\w+\?{0,1}): (\w+(\[\]){0,1});/g;
function replaceTypeName(content: string, replacer: (typeName: string) => string) {

  let match;
  while ((match = REGEX_TS_KV.exec(content)) !== null) {
    const modifiedType = replacer(match[2]); // 假设你有一个名为 modifyType 的函数来修改类型
    const replacement = `${match[1]}: ${modifiedType};`;
    content = content.replace(match[0], replacement);
  }
  return content
}

const BUILT_IN_TYPES = ['number', 'string', 'boolean', 'object', 'null'];

const result = replaceTypeName(rContent, typeName => {
  if (BUILT_IN_TYPES.includes(typeName)) {
    return typeName
  }
  return `ReqUserPositionChangeBody.${typeName}`
});

console.log("result:", result);

