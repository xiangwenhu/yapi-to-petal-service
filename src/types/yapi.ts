
export interface CateItem {
    /**
     * 索引
     */
    index: number;
    /**
     * 分类名称
     */
    name: string;
    /**
     * 描述
     */
    desc: string | null;
    /**
     * 添加时间
     */
    add_time: number;
    /**
     * 更新时间
     */
    up_time: number;

    /**
     * api列表
     */
    list: APIItem[]
}


export interface APIItem {
    query_path: {
        path: string;
        params: APIItem.QueryPathParamItem[];
    },
    edit_uid: number;
    status: APIItem.APIStatus;
    type: APIItem.APIType;
    req_body_is_json_schema: boolean;
    res_body_is_json_schema: boolean;
    api_opened: boolean;
    index: number;
    tag: string[]
    _id: number;
    method: APIItem.APIMethod;
    catid: number;
    title: string;
    path: string;
    project_id: number;
    req_params: any[];
    res_body_type: APIItem.ResBodyType;
    req_query: APIItem.ReqQueryItem[];
    req_headers: APIItem.ReqHeadersItem[];
    req_body_form: APIItem.ReqBodyFormItem[];
    desc: string;
    markdown: string;
    req_body_type: APIItem.RequestBodyType
    res_body: string;
    req_body_other: string;
    uid: number;
    add_time: number;
    up_time: number;
    __v: number;
}


export namespace APIItem {
    interface BaseFiledItem {
        _id: string;
        name: string;
    }

    interface RequireFiledItem extends BaseFiledItem {
        required: '1' | '0',
    }

    interface CommonFieldItem extends RequireFiledItem {
        type: string;
        example: string;
        desc: string;
    }


    /**
     * JSON值类型
     */
    export type JonValueType = 'string' | 'number' | 'array' | 'object' | 'boolean' | 'integer';
    /**
     * 请求Body的类型
     */
    export type RequestBodyType = 'form' | 'json' | 'file' | 'raw';

    /**
     * 返回的Body的类型
     */
    export type ResBodyType = 'json' | 'raw';

    /**
     * 表单值类型
     */
    export type FormParamType = 'text' | 'file';


    /**
     * 请求表单项
     */
    export interface ReqBodyFormItem extends CommonFieldItem { }


    /**
     * 请求queryPath参数
     */
    export interface QueryPathParamItem {
        _id: string;
        name: string;
        value: string;
    }


    /**
     * 请求Header项
     */
    export interface ReqHeadersItem extends BaseFiledItem {
        value: string;
    }


    /**
     * 请求Query Item
     */
    export interface ReqQueryItem extends CommonFieldItem { }

    export type APIStatus = 'undone' | 'done';

    export type APIType = 'static';

    export type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
}
