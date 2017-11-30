using EntryRegistration.Models.Entity;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace EntryRegistration.Models
{
    public class JsonHandle
    {
        public static string SerializeObject(object obj)
        {
            IsoDateTimeConverter timeFormat = new IsoDateTimeConverter();
            timeFormat.DateTimeFormat = "yyyy-MM-dd";
            string json = JsonConvert.SerializeObject(obj, Newtonsoft.Json.Formatting.Indented, timeFormat);
            return json;
        }
        /// <summary>
        /// 根据成功状态与对应的状态信息得到json
        /// </summary>
        /// <param name="isSuccess"></param>
        /// <param name="responseInfo"></param>
        /// <returns>ContentResult</returns>
        public static ContentResult GetResult(bool isSuccess, string responseInfo)
        {
            ActionResultModel<string> result = new ActionResultModel<string>();
            result.isSuccess = isSuccess;
            result.responseInfo = responseInfo;
            return new ContentResult()
            {
                Content = JsonHandle.SerializeObject(result),
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8
            };
        }
        /// <summary>
        /// 根据任意类型得到json
        /// </summary>
        /// <param name="obj"></param>
        /// <returns>ContentResult</returns>
        public static ContentResult GetResult(object obj)
        {
            return new ContentResult()
            {
                Content = JsonHandle.SerializeObject(obj),
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8
            };
        }
        /// <summary>
        /// 得到键值列表的json
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="_db"></param>
        /// <returns>ContentResult</returns>
        public static ContentResult GetKVList(string tableName, SqlSugarClient _db)
        {
            List<KeyValuePair<string, string>> json = _db.SqlQuery<KeyValuePair<string, string>>("select ListKey,Description from " + tableName + " where LanguageId=1");
            return JsonHandle.GetResult(json);
        }
        /// <summary>
        /// 得到键值列表的json
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="_db"></param>
        /// <returns></returns>
        public static string GetKVListJson(string tableName, SqlSugarClient _db)
        {
            List<KeyValuePair<string, string>> json = _db.SqlQuery<KeyValuePair<string, string>>("select ListKey,Description from " + tableName + " where LanguageId=1");
            return SerializeObject(json);
        }
    }
}