import {Md5} from 'ts-md5';
import Taro from '@tarojs/taro';
import debug from "../lib/debug";

const CONFIG: any = {
    INTERFACE_URL : 'http://hn216.api.yesapi.cn/',
    APP_KEY : '6EC14C1A2BD1952E71390CFCB082858F',
    APP_SECRET : 'KMtn96xNYgXQiNQwuVS2bdWcXdXEvydqrOc5lEPJohWU2fE95ORpZO0u2mVCM0yqy3'
};

const API_OBJ: any = {
    APP_KEY: 'app_key='+CONFIG.APP_KEY,
    PREFIX: CONFIG.INTERFACE_URL+'/?s=',
    USER_REGISTER: 'App.User.Register',
    USER_LOGIN: 'App.User.Login',
    USER_CHANGE_PROPS: 'App.User.UpdateExtInfo',
    USER_CHECK_IF_LOGIN: 'App.User.Check',
    USER_EXT_INFO: 'App.User.OtherProfile',
    TABLE_CREATE: 'App.Table.Create',
    TABLE_READ: 'App.Table.FreeFindOne',
    TABLE_UPDATE_WHERE: 'App.Table.FreeUpdate',
    TABLE_READ_PAGE: 'App.Table.FreeQuery',
    TABLE_UNION_QUERY: 'App.Table.FreeLeftJoinQuery',
};

function calcSign(argVals:string[]){
    debug(123);
    argVals.push(CONFIG.APP_SECRET);
    let preAns: string = argVals.join('');
    let ans = Md5.hashStr(preAns);
    ans = ans.toString().toLocaleUpperCase();
    return ans;
}
function hGet(url:string, funcs: retFunc) {
    Taro.request({
        url: url,
        method: "GET",
        success: funcs.success,
        fail: funcs.fail
    });
}

export interface retFunc {
    success: any;
    fail: any;
}

let {PREFIX, APP_KEY} = API_OBJ;
const yesapi: any = {
    user: {
        /**
         * 用户登录接口
         * @param username string
         * @param password string
         * @param funcs
         */
        login: function (username:string, password:string, funcs:retFunc) {
            //app_key,password,s,username,secret
            let passwordMD5 = Md5.hashStr(password);
            let sign = calcSign([CONFIG.APP_KEY,passwordMD5,API_OBJ.USER_LOGIN,username]);
            let url = PREFIX + API_OBJ.USER_LOGIN + `&username=${username}&password=${passwordMD5}&` + APP_KEY + '&sign='+sign;
            hGet(url, funcs);
        },
        /**
         * 用户注册接口
         * @param username string
         * @param password string
         * @param extData json->{a:123}
         * @param funcs
         * @example yesapi_mobile
         */
        register: function (username:string, password:string, extData: any, funcs: retFunc) {
            //app_key ext_info password s username
            let passwordMD5 = Md5.hashStr(password);
            let dataStr = JSON.stringify(extData);
            let sign = calcSign([CONFIG.APP_KEY,dataStr,passwordMD5,API_OBJ.USER_REGISTER,username]);
            let url = PREFIX + API_OBJ.USER_REGISTER + `&ext_info=${dataStr}&username=${username}&password=${passwordMD5}&` + APP_KEY + '&sign='+sign;
            hGet(url, funcs);
        },
        /**
         * 使用token来更新用户额外信息
         * @param uuid
         * @param extData
         * @param token
         * @param funcs
         */
        change: function (uuid:string, extData: any, token:string, funcs: retFunc) {
            debug(arguments);
            //app_key ext_info s token uuid
            let dataStr = JSON.stringify(extData);
            let sign = calcSign([CONFIG.APP_KEY,dataStr,API_OBJ.USER_REGISTER,token,uuid]);
             let url = PREFIX + API_OBJ.USER_CHANGE_PROPS + `&ext_info=${dataStr}&uuid=${uuid}&token=${token}&` + APP_KEY + '&sign='+sign;
             hGet(url, funcs);
        },
        /**
         * 检查是否登录
         * @param uuid
         * @param token
         * @param funcs
         * @example
         * data.err_code 0已登录1未登录
         */
        checkIfLogin: function (uuid:string, token:string, funcs:retFunc) {
            //app_key s token uuid
            let PORT = API_OBJ.USER_CHECK_IF_LOGIN;
            let sign = calcSign([CONFIG.APP_KEY,PORT,token,uuid]);
            let url = PREFIX + PORT + `&uuid=${uuid}&token=${token}&` + APP_KEY + '&sign='+sign;
            hGet(url, funcs);
        },
        /**
         * 获取一个用户的额外信息
         * @param uuid
         * @param funcs
         */
        getExtInfo: function (uuid:string, funcs:retFunc) {
            //app_key other_uuid s
            let PORT = API_OBJ.USER_EXT_INFO;
            let sign = calcSign([CONFIG.APP_KEY,uuid,PORT]);
            let url = PREFIX + PORT + `&other_uuid=${uuid}&` + APP_KEY + '&sign='+sign;
            hGet(url, funcs);
        },

    },
    table: {
        /**
         * 使用UUID创建一条数据
         * @param table_name string
         * @param data {a:123,b:234}
         * @param uuid string
         * @param funcs
         */
        createWithUUID : function (table_name: string, data: any, uuid: string, funcs: retFunc) {
            //app_key data model_name s uuid
            let PORT, sign, url;
            let dataStr;
            //Define User Data
            dataStr = JSON.stringify(data);
            //Define Post Data
            PORT = API_OBJ.TABLE_CREATE;
            sign = calcSign([CONFIG.APP_KEY, dataStr, table_name, PORT, uuid]);
            url = PREFIX + PORT + `&data=${dataStr}&uuid=${uuid}&model_name=${table_name}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },
        /**
         * 不使用UUID创建一条数据
         * @param table_name string
         * @param data {a:123,b:234}
         * @param funcs
         */
        createWithoutUUID : function (table_name: string, data: any, funcs: retFunc) {
            //app_key data model_name s
            let PORT, sign, url;
            let dataStr;
            //Define User Data
            dataStr = JSON.stringify(data);
            //Define Post Data
            PORT = API_OBJ.TABLE_CREATE;
            sign = calcSign([CONFIG.APP_KEY, dataStr, table_name, PORT]);
            url = PREFIX + PORT + `&data=${dataStr}&model_name=${table_name}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },


        /**
         * 使用UUID查询查询一条数据
         * @param table_name string
         * @param where [["a","=","3142"],[...],...]
         * @param logic "and"/"or"
         * @param uuid string
         * @param funcs
         */
        readOneWithUUID : function (table_name: string, where: any, logic: string, uuid: string, funcs: retFunc) {
            //app_key logic model_name s uuid where
            let PORT, sign, url;
            let dataStr;
            //Define User Data
            dataStr = JSON.stringify(where);
            //Define Post Data
            PORT = API_OBJ.TABLE_READ;
            sign = calcSign([CONFIG.APP_KEY, logic, table_name, PORT, uuid, dataStr]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr}&uuid=${uuid}&model_name=${table_name}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },
        /**
         * 不使用UUID查询一条数据
         * @param table_name string
         * @param where [["a","=","3142"],[...],...]
         * @param logic "and"/"or"
         * @param funcs
         */
        readOneWithoutUUID : function (table_name: string, where: any, logic: string, funcs: retFunc) {
            //app_key logic model_name s uuid where
            let PORT, sign, url;
            let dataStr;
            //Define User Data
            dataStr = JSON.stringify(where);
            //Define Post Data
            PORT = API_OBJ.TABLE_READ;
            sign = calcSign([CONFIG.APP_KEY, logic, table_name, PORT, dataStr]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr}&model_name=${table_name}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },


        /**
         * 使用UUID来以页为单位查询数据
         * @param table_name
         * @param where [["a","=","3142"],[...],...]
         * @param logic "and"/"or"
         * @param page number
         * @param perPage number
         * @param uuid
         * @param funcs
         */
        readPageWithUUID : function (table_name: string, where: any, logic: string, page: number, perPage:number, uuid:string, funcs: retFunc) {
            //app_key logic model_name page perpage s uuid where
            let PORT, sign, url, dataStr;
            //Define User Data
            dataStr = JSON.stringify(where);
            //Define Post Data
            PORT = API_OBJ.TABLE_READ_PAGE;
            sign = calcSign([CONFIG.APP_KEY, logic, table_name, page, perPage, PORT, uuid, dataStr]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr}&page=${page}&perpage=${perPage}&model_name=${table_name}&uuid=${uuid}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },
        /**
         * 不使用UUID来以页为单位查询数据
         * @param table_name string
         * @param where [["a","=","3142"],[...],...]
         * @param logic "and"/"or"
         * @param page number
         * @param perPage number
         * @param funcs
         */
        readPageWithoutUUID : function (table_name: string, where: any, logic: string, page: number, perPage:number, funcs: retFunc) {
            //app_key logic model_name page perpage s where
            let PORT, sign, url, dataStr;
            //Define User Data
            dataStr = JSON.stringify(where);
            //Define Post Data
            PORT = API_OBJ.TABLE_READ_PAGE;
            sign = calcSign([CONFIG.APP_KEY, logic, table_name, page, perPage, PORT, dataStr]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr}&page=${page}&perpage=${perPage}&model_name=${table_name}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },

        /**
         * 使用UUID来进行联合查询
         * @param table_name
         * @param join_table_name
         * @param join_select
         * @param on
         * @param where
         * @param logic
         * @param page
         * @param perPage
         * @param uuid
         * @param funcs
         * @example on：{"cate_id":"id"} cate_id是主表中的字段名，id是副表中的字段名
         * @example where：[ ["TL.view_times",">=",100], ["TR.is_show","=",1]] TL代表主表中的查询，TR代表副表中的查询
         * @example join_select： cate_id,id,views
         */
        readUnionQueryWithUUID : function(table_name: string, join_table_name: string, join_select: string, on:any, where: any, logic: string, page: number, perPage:number, uuid:string, funcs: retFunc) {
            //app_key join_model_name join_select logic model_name on page perpage s uuid where
            let PORT, sign, url, dataStr1, dataStr2;
            //Define User Data
            dataStr1 = JSON.stringify(where);
            dataStr2 = JSON.stringify(on);
            //Define Post Data
            PORT = API_OBJ.TABLE_UNION_QUERY;
            sign = calcSign([CONFIG.APP_KEY, join_table_name, join_select, logic, table_name, dataStr2, page, perPage, PORT, uuid, dataStr1]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr1}&page=${page}&perpage=${perPage}&model_name=${table_name}&uuid=${uuid}&join_model_name=${join_table_name}&join_select=${join_select}&on=${dataStr2}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },
        /**
         * 不使用UUID来进行联合查询
         * @param table_name
         * @param join_table_name
         * @param join_select
         * @param on
         * @param where
         * @param logic
         * @param page
         * @param perPage
         * @param funcs
         * @example on：{"cate_id":"id"} cate_id是主表中的字段名，id是副表中的字段名
         * @example where：[ ["TL.view_times",">=",100], ["TR.is_show","=",1]] TL代表主表中的查询，TR代表副表中的查询
         * @example join_select： cate_id,id,views
         */
        readUnionQueryWithoutUUID : function(table_name: string, join_table_name: string, join_select: string, on:any, where: any, logic: string, page: number, perPage:number, funcs: retFunc) {
            //app_key join_model_name join_select logic model_name on page perpage s where
            let PORT, sign, url, dataStr1, dataStr2;
            //Define User Data
            dataStr1 = JSON.stringify(where);
            dataStr2 = JSON.stringify(on);
            //Define Post Data
            PORT = API_OBJ.TABLE_UNION_QUERY;
            sign = calcSign([CONFIG.APP_KEY, join_table_name, join_select, logic, table_name, dataStr2, page, perPage, PORT, dataStr1]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr1}&page=${page}&perpage=${perPage}&model_name=${table_name}&join_model_name=${join_table_name}&join_select=${join_select}&on=${dataStr2}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },
        /**
         * 使用UUID和Order来进行联合查询
         * @param table_name
         * @param join_table_name
         * @param join_select
         * @param on
         * @param where
         * @param logic
         * @param page
         * @param perPage
         * @param order
         * @param uuid
         * @param funcs
         * @example on：
         * {"cate_id":"id"} cate_id是主表中的字段名，id是副表中的字段名
         * @example where：
         * [ ["TL.view_times",">=",100], ["TR.is_show","=",1]] TL代表主表中的查询，TR代表副表中的查询
         * @example join_select：
         * cate_id,id,views
         * @example order：
         * 每一组排序格式为："字段名 + 空格 + ASC|DESC"，其中：
         * ASC：为指定列按升序排列
         * DESC：为指定列按降序排列。
         */
        readUnionQueryWithUUID_Order : function(table_name: string, join_table_name: string, join_select: string, on:any, where: any, logic: string, page: number, perPage:number, uuid:string, order:string, funcs: retFunc) {
            //app_key join_model_name join_select logic model_name on order page perpage s uuid where
            let PORT, sign, url, dataStr1, dataStr2, dataStr3;
            //Define User Data
            dataStr1 = JSON.stringify(where);
            dataStr2 = JSON.stringify(on);
            dataStr3 = JSON.stringify(order);
            //Define Post Data
            PORT = API_OBJ.TABLE_UNION_QUERY;
            sign = calcSign([CONFIG.APP_KEY, join_table_name, join_select, logic, table_name, dataStr2, dataStr3, page, perPage, PORT, uuid, dataStr1]);
            url = PREFIX + PORT + `&logic=${logic}&where=${dataStr1}&page=${page}&perpage=${perPage}&model_name=${table_name}&uuid=${uuid}&order=${dataStr3}&join_model_name=${join_table_name}&join_select=${join_select}&on=${dataStr2}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        },

        /**
         * 使用条件查询更新一条数据
         * @param table_name string
         * @param data {a:23123, app:"list"}
         * @param where [["a","=","3142"],[...],...]
         * @param logic "and"/"or"
         * @param uuid string
         * @param funcs
         */
        update : function (table_name: string, data:any ,where: any, logic: string, uuid: string, funcs: retFunc) {
            //app_key data logic model_name s uuid where
            let PORT, sign, url;
            let whereStr, dataStr;
            //Define User Data
            whereStr = JSON.stringify(where);
            dataStr = JSON.stringify(data);
            //Define Post Data
            PORT = API_OBJ.TABLE_UPDATE_WHERE;
            sign = calcSign([CONFIG.APP_KEY, dataStr, logic, table_name, PORT, uuid, whereStr]);
            url = PREFIX + PORT + `&data=${dataStr}&logic=${logic}&where=${whereStr}&uuid=${uuid}&model_name=${table_name}&` + APP_KEY + '&sign='+sign;
            //Execute Post
            hGet(url, funcs);
        }
    }
};

export default yesapi;