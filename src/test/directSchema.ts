
import schema from "../../demodata/schema/pc";
import { compile } from "json-schema-to-typescript";


; (async function () {

    const results = await compile(schema, "HAHA", {
        additionalProperties: false
    })
  
    console.log("results:", results);

  })()
  
  
export interface HAHA {
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
    /**
     * 返回数据
     */
    data?: {
      /**
       * 数据总条数
       */
      total?: number & string;
      /**
       * 列表数据
       * <p>
       * key=biz#fieldName
       * value=值
       */
      data?:
        | (string & [])
        | [
            {
              key?: {};
            }
          ]
        | [
            {
              key?: {};
            },
            number
          ]
        | [
            {
              key?: {};
            },
            number,
            {
              key?: {
                type?: "number";
              };
            }
          ];
      /**
       * 列表字段
       */
      attrs?: string &
        {
          /**
           * 分组id
           */
          modelId?: number;
          /**
           * 分组名称
           */
          modelName?: string;
          /**
           * 所属业务
           */
          bizKey?: string;
          /**
           * 字段
           */
          fieldName?: string;
          /**
           * 字段名称
           */
          fieldLabel?: string;
          /**
           * 字段类型
           */
          fieldType?:
            | "(byte) 1"
            | "(byte) 2"
            | "(byte) 3"
            | "(byte) 4"
            | "(byte) 5"
            | "(byte) 6"
            | "(byte) 7"
            | "(byte) 8"
            | "(byte) 9"
            | "(byte) 10"
            | "(byte) 11"
            | "(byte) 12"
            | "(byte) 13"
            | "(byte) 14"
            | "(byte) 15"
            | "(byte) 16";
          /**
           * 是否必填（1.必填， 0.非必填）
           */
          isRequire?: boolean;
          /**
           * 是否可以排序（1.可以， 0.不可以）
           */
          isSort?: boolean;
          /**
           * 是否可以筛选（1.可以， 0.不可以）
           */
          isFilter?: boolean;
          /**
           * 字段展示宽度
           */
          fieldWidth?: number;
          /**
           * 字段提示语
           */
          tips?: string;
          /**
           * 是否固定在左侧(true固定)
           */
          isFixedLeft?: boolean;
        }[];
    };
  }