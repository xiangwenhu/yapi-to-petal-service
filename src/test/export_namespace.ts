import { generateNamespace } from "../code/util";

const content = `export type YDataItem = string
export type XDataItem = string
/**
 *  */
export interface ResUserInfoBody {
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


const result = generateNamespace(content, "ResUserInfoBody");

console.log("results:", result);