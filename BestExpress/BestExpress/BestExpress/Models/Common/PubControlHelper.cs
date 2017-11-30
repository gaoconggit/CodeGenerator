#region 命名空间

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Best.Entities.Tables;
using SqlSugar;
using SyntacticSugar;
using Best.Entities.UiEngine;
using System.Web.Mvc;

#endregion

namespace Best.Site.Areas.BestPalace.Controllers
{
    /// <summary>
    /// 公共控件帮助类
    /// </summary>
    public class PubControlHelper
    {
        /// <summary>
        /// 获取控件属性(用于arribute.cshtml)
        /// </summary>
        /// <param name="model"></param>
        /// <param name="keyVal"></param>
        /// <returns></returns>
        public static string GetControlAttribute(List<SysBest_ElementAttr> data, string keyVal,string defaultValue="")
        {
            if (data == null || data.Count() < 1)
                return defaultValue;

            string str= data.Any(it => it.Key == keyVal) ? data.Single(it => it.Key == keyVal).Value : defaultValue;
            return str;
        }

        /// <summary>
        /// 获取控件属性(用于build.cshtml)
        /// </summary>
        /// <param name="data"></param>
        /// <param name="keyVal"></param>
        /// <param name="defaultVal"></param>
        /// <returns></returns>
        public static string GetControlAttributeByBuild(Dictionary<string, string> data, string keyVal, string defaultVal = "")
        {
            if (data == null || data.Count() < 1)
                return defaultVal;

            if (keyVal.IsValuable() && keyVal.ToLower() == "name")
                return data[keyVal];

            string str= data.ContainsKey(keyVal) ? data[keyVal] : defaultVal;
            return str;
        }


        public static string GetControlAttributeByProperties(List<SysBest_JqxTreeParas> data ,string name ,string val)
        {
            foreach (var item in data)
            {
               var rel= item.Name.Equals(name) && item.DefaultValue != val;
                if (rel)
                {
                    return val;
                }
            }
            return "";
        }

        public static List<PubGetJs> PubGet()
        {
           
            var times= ElementManager.GetInstance.GetPubGet;
       
            return times;
        }
    }
}