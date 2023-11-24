import schema from "../../demodata/schema/pc";

import SchemaSplit from "../schema/SchemaSplit";



; (async function () {
    const sSplit = new SchemaSplit(schema);

    const typeStr = await sSplit.toTypeScript("name", {});

    console.log("results:", typeStr);

})()



/**
 * 职务列表
 */
export type UserPosition = {
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
    [k: string]: unknown;
  }[];
  
  /**
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
    UserPosition?: UserPosition;
    [k: string]: unknown;
  }
  
  