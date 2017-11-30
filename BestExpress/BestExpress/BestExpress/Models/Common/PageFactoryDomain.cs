using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SyntacticSugar;
using System.IO;


using System.Text.RegularExpressions;
using Best.Entities.Tables;
using RazorEngine;
using Best.Entities.UiEngine;
using SqlSugar;

namespace Best.Site.Areas.BestPalace.Controllers
{


    /// <summary>
    ///创建业面逻辑
    /// </summary>
    public class PageFactoryDomain
    {
        private SqlSugarClient _db;
        public PageFactoryDomain(SqlSugarClient db)
        {
            _db = db;
        }
     

       

        public int GetElementIdByCategory(string name)
        {
            var reval = name.Switch().Case("form", "1").Case("show", "2").Case("layout", "3").Break();
            return Convert.ToInt32(reval);
        }



        public List<string> GetLayoutPathList
        {
            get
            {
                List<string> reval = new List<string>();
                var mapPath = FileSugar.GetMapPath("~/");
                var dirs = FileSugar.GetDirectories(mapPath, "shared", true);
                foreach (var it in dirs)
                {
                    var filePaths = FileSugar.GetFileNames(it, "_*.cshtml", false);
                    foreach (var filePath in filePaths)
                    {
                        var addItem = "~/{0}".ToFormat(filePath.TryToString().Replace(mapPath, "").Replace("\\", "/"));
                        reval.Add(addItem);
                    }
                }
                return reval;
            }

        }



        /// <summary>
        /// 获取控件信息
        /// </summary>
        /// <returns></returns>
        public List<ControlType> GetControlInfoList()
        {
            List<ControlType> reval = new List<ControlType>();
            //获取best平台控件目录
            var typeDirList = FileSugar.GetDirectories(PubUiEngineGet.GetUiEngineControlsDir);
            if (typeDirList.IsValuable())
            {
                foreach (var item in typeDirList)
                {
                    reval.Add(GetControlType(item));
                }
            }
            return reval;
        }
        /// <summary>
        /// 获取UI引擎控件信息
        /// </summary>
        /// <param name="item"></param>
        private ControlType GetControlType(string item)
        {
            ControlType type = new ControlType();
            DirectoryInfo di = new DirectoryInfo(item);
            type.key = di.Name;
            type.icon = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineControlsWebDir, type.key, "icon.png");
            string webTypeDir = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineControlsWebDir, type.key);
            string configPath = FileSugar.MergeUrl(item, "config.json");
            string code = FileSugar.FileToString(configPath);
            var controlConfig = code.JsonToModel<ControlConfig>();
            type.controlConfig = controlConfig;
            string itemsPath = FileSugar.MergeUrl(item, "items");
            type.items = GetControlList(itemsPath, webTypeDir);
            return type;
        }
        private List<ControlItem> GetControlList(string itemsPath, string webTypeDir)
        {
            var reval = new List<ControlItem>();
            var controlsDirList = FileSugar.GetDirectories(itemsPath);
            if (controlsDirList.IsValuable())
            {
                foreach (var item in controlsDirList)
                {
                    ControlItem control = new ControlItem();
                    DirectoryInfo di = new DirectoryInfo(item);
                    control.key = di.Name;
                    control.icon = FileSugar.MergeUrl(webTypeDir, "items", control.key, "icon.png");
                    string configPath = FileSugar.MergeUrl(itemsPath, control.key, "config.json");
                    string code = FileSugar.FileToString(configPath);
                    var controlConfig = code.JsonToModel<ControlConfig>();
                    control.controlConfig = controlConfig;
                    reval.Add(control);
                }
            }
            return reval;
        }

        //public void RestoreLayoutElement(string htmlId, string key, int addressId, int languageId)
        //{
        //    var cshtmlPath = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineControlsDir, "layout", key + ".cshtml");
        //    var content = _.sysBest_PageContentService.GetSingle(it => it.LanguageId == languageId && it.AddressId == addressId);
        //    var elementList = _.sysBest_ElementService.GetElementListByHtmlIdArray(new string[] { htmlId });
        //    content.Html = GetRestoreHtml(content.Html, elementList, htmlId);
        //    _.sysBest_PageContentService.Update(content);
        //}

        /// <summary>
        /// 获取还原后的HTML
        /// </summary>
        /// <param name="html"></param>
        /// <param name="elementList"></param>
        /// <param name="htmlId"></param>
        /// <returns></returns>
        public string GetRestoreHtml(string html, List<SysBest_Element> elementList, string htmlId)
        {
            if (!elementList.Any(el => el.Html_Id == htmlId)) return html;
            //根据htmlID查对应的元素
            var ele = elementList.Single(el => el.Html_Id == htmlId);
            //正则匹配出对应的占位span标签
            var span = Regex.Match(html, @"\<span.{1,30}?data\-id\=""" + htmlId + @""".*?\<\/span\>").Value;
            //正则匹配出控件类型
            var categoryKey = Regex.Match(span, @"\<.*?data\-categorykey\=""(.+?)"".*?", RegexOptions.Singleline).Groups[1].Value;
            //正则匹配控件Key
            var key = Regex.Match(span, @"\<.*?data\-key\=""(.+?)"".*?").Groups[1].Value;
            var buildTemplatePath = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineControlsDir, categoryKey, "items", key, "build.cshtml");
            if (FileSugar.IsExistFile(buildTemplatePath))
            {
                BuildModel buildModel = new BuildModel();
                buildModel.elementId = ele.Id;
                buildModel.addressId = ele.AddressId;

                
                
                var attrs = _db.Queryable<SysBest_ElementAttr>().Where(it => it.ElementId == ele.Id).ToList();
                var events = _db.Queryable<SysBest_ElementEvent>().Where(it => it.ElementId == ele.Id).ToList();
                buildModel.attrList = attrs.Select(attr => new KeyValuePair<string, string>(attr.Key, attr.Value)).ToDictionary(it => it.Key, it => it.Value);
                if (buildModel.attrList == null)
                {
                    buildModel.attrList = new Dictionary<string, string>();
                }
                buildModel.attrList.Add("name", ele.EleName);
                buildModel.eventList = new Dictionary<string, string>();
                foreach (var eve in events)
                {
                    List<EventActionTypeParas> pars = new List<EventActionTypeParas>();
                    if (eve.Pars.IsValuable())
                    {
                        pars = eve.Pars.JsonToModel<List<EventActionTypeParas>>();
                    }
                    string eveValue = GetEventActionHtml(eve.Value, pars, ele.EleName);
                    buildModel.eventList.Add(eve.Key, eveValue);
                }
                var cshtml = FileSugar.FileToString(buildTemplatePath);
                buildModel.api = GetApiUrlByElement(ele);
                string finallyThisIsMyParsedTemplate = "";

                finallyThisIsMyParsedTemplate = RazorEngineExtension.RazorPars(buildTemplatePath, cshtml, buildModel);

                var replaceHtml = finallyThisIsMyParsedTemplate;
                html = html.Replace(span, replaceHtml);
            }

            return html;
        }
        public string GetApiUrlByElement(SysBest_Element ele)
        {
            string reval = string.Empty;
            var apiId = ele.ApiId;
            var api = _db.Queryable<SysBest_DataApi>().Where(it => it.Id == apiId).SingleOrDefault();
            if (api == null) return reval;
            if (api.ApiActionType == 10/*插件*/)
            {
                reval = api.ActionName;
            }
            else
            {

                var address = _db.Queryable<SysBest_MenuAddress>().Where(it => it.Id == ele.AddressId).FirstOrDefault();
                if (address != null)
                {
                    reval = "/{0}/{1}/{2}".ToFormat(address.AreaName, address.ControllerName, api.ActionName);
                }
            }
            return reval;
        }



        /// <summary>
        /// 获取事件HTML
        /// </summary>
        /// <param name="name"></param>
        /// <param name="pars"></param>
        /// <returns></returns>
        public string GetEventActionHtml(string name, List<EventActionTypeParas> pars, string id)
        {
            var path = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineEventActionDir, name + ".cshtml");
            var cshtml = FileSugar.FileToString(path);
            var reval = RazorEngineExtension.RazorPars(path, cshtml, new { Data = pars, id = id });
            return reval;
        }


    }



}