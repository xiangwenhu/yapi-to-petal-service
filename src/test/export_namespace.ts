import { generateNamespace } from "../code/util";

const content = `export type YDataItem = string
export type XDataItem = string

/**
 * 获取绩效信息响应结果
 * path: /api/personnel/userManager/userPerformanceInfo
 * doc url: https://mis.jjmatch.cn:4000/project/395/interface/api/5870
 */
export interface ResUserPerformanceInfoBody {
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
  data?: Data;
}

export interface Data {
  yData?: YDataItem[];
  xData?: XDataItem[];
  data?: DataItem[];
}
`


const result = generateNamespace(content, "ResUserPerformanceInfoBody");

console.log("results:", result);