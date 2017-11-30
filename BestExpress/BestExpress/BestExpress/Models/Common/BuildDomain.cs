using System.Linq;
using System.Web;
//using Best.Infrastructure.DAL;
using Best.Entities.Tables;
using SyntacticSugar;
//using Best.Site.Models;
using System.Text;
using System.Text.RegularExpressions;
using Best.Entities.UiEngine;
using System.Xml.Linq;
using System;
using RazorEngine;
using System.Collections.Generic;
//using Best.WidgetFactory.Cache;
using SqlSugar;
using EntryRegistration.Models;

namespace Best.Site.Areas.BestPalace.Controllers
{
    /// <summary>
    /// 生成文件页面
    /// </summary>
    public class BuildDomain
    {

        /// <summary>
        /// 当前项目目录
        /// </summary>
        private string _solutionDir = FileSugar.GetMapPath("/");
        /// <summary>
        /// 项目名称
        /// </summary>
        private string _projectName = ConfigSugar.GetAppString("siteName");
        /// <summary>
        /// ui模版地址
        /// </summary>
        private string _uiEngineDir = "";
        private SysBest_MenuAddress _data;
        //private ConvertCshtml _cs;
        private int _languageId;
        //public BuildDomain(SysBest_MenuAddressService ma, SysBest_DataApiService api, SysBest_ElementService ele, ConvertCshtml cs, SysBest_LanguageService lans)
        //{
        //    _.sysBest_MenuAddressService = ma;
        //    _.sysBest_DataApiService = api;
        //    _.sysBest_ElementService = ele;
        //    _cs = cs;
        //    _.sysBest_LanguageService = lans;
        //}
        private SqlSugarClient _db;
        //2017年6月16日 16:30:41
        public BuildDomain(SqlSugarClient db)
        {
            _db = db;
        }

        public void Excute(int menuAddressId, int languageId, string uiEngineDir)
        {
            _uiEngineDir = uiEngineDir;
            var data = _db.Queryable<SysBest_MenuAddress>().FirstOrDefault(it => it.Id == menuAddressId);
            _data = data;
            _languageId = languageId;
            string areaBoxDir = FileSugar.MergeUrl(_solutionDir, "Areas", data.AreaName);
            string areaDir = FileSugar.MergeUrl(_solutionDir, "Areas", data.AreaName);
            string viewsDir = FileSugar.MergeUrl(areaDir, "Views");
            string areaRegistrationPath = FileSugar.MergeUrl(areaDir, "{0}AreaRegistration.cs".ToFormat(data.AreaName));
            string controllerDir = FileSugar.MergeUrl(areaDir, "Controllers", data.ControllerName + "App");
            string controllerDomainDir = FileSugar.MergeUrl(areaDir, "Controllers", data.ControllerName + "App", "Domain");
            string controllerDomainPath = FileSugar.MergeUrl(areaDir, "Controllers", data.ControllerName + "App", "Domain", data.ControllerName + "Domain.cs");
            string configPath = FileSugar.MergeUrl(viewsDir, "Web.config");
            string viewPath = FileSugar.MergeUrl(viewsDir, _data.ControllerName, _data.ActionName + ".cshtml");

            var lan = _db.Queryable<SysBest_Language>().FirstOrDefault(it => it.Id == languageId).Suffix;
            if (lan.IsValuable() && lan != "zh")
            {
                viewPath = FileSugar.MergeUrl(viewsDir, _data.ControllerName, _data.ActionName + $"_{lan}.cshtml");
            }
            string controllerPath = FileSugar.MergeUrl(controllerDir, data.ControllerName + "Controller.cs");
            string path = _solutionDir + @"\" + _projectName + ".csproj";

            try
            {
                XDocument doc = XDocument.Load(path);
                BuildArea(areaDir, viewsDir, controllerDomainDir, areaRegistrationPath, configPath, doc);
                BuildController(controllerDir, controllerPath, controllerDomainPath, doc);
                BuildView(viewPath, doc);
                BuildDatabaseTableTable();
                doc.Save(path);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        private void BuildView(string viewPath, XDocument doc)
        {
            ConvertCshtml _cs = new ConvertCshtml(_db);
            int addressId = _data.Id;
            int languageId = _languageId;
            var review = _cs.ReviewModel(addressId, languageId);
            review.JsSrc = @"/Areas/{0}/Views/_js/{1}-{2}.js".ToFormat(_data.AreaName, _data.ControllerName.ToLower(), _data.ActionName.ToLower());
            review.CssHref = @"/Areas/{0}/Views/_css/{1}-{2}.css".ToFormat(_data.AreaName, _data.ControllerName.ToLower(), _data.ActionName.ToLower());
            ContainConfigToCsproj(@"Areas\{0}\Views\_css\{1}-{2}.css".ToFormat(_data.AreaName, _data.ControllerName.ToLower(), _data.ActionName.ToLower()), _solutionDir, _projectName, doc);
            ContainConfigToCsproj(@"Areas\{0}\Views\_js\{1}-{2}.js".ToFormat(_data.AreaName, _data.ControllerName.ToLower(), _data.ActionName.ToLower()), _solutionDir, _projectName, doc);
            string jsPath = FileSugar.GetMapPath(review.JsSrc);
            string cssPath = FileSugar.GetMapPath(review.CssHref);
            if (FileSugar.IsExistFile(jsPath).IsFalse())
            {
                FileSugar.CreateFile(jsPath);
                FileSugar.WriteFile(jsPath, "///<reference path=\"/_theme/tool/_reference.js\" />", "utf-8");
            }
            if (FileSugar.IsExistFile(cssPath).IsFalse())
            {
                FileSugar.CreateFile(cssPath);
            }
            var viewCode = GetTemplateCodeByName("view.cshtml", review);
            var languageSuffix = string.Empty;
            if (languageId != 1)
            {
                languageSuffix = $"_{GetLanguageList.Single(it => it.Id == languageId).Suffix}";
            }
            FileSugar.WriteFile(viewPath, viewCode);
            ContainConfigToCsproj(@"Areas\{0}\Views\{1}\{2}{3}.cshtml".ToFormat(_data.AreaName, _data.ControllerName, _data.ActionName, languageSuffix), _solutionDir, _projectName, doc);
        }

        /// <summary>
        /// 生成area
        /// </summary>
        private void BuildArea(string areaDir, string viewsDir, string controllerDomainDir, string areaRegistrationPath, string configPath, XDocument doc)
        {
            //创建area
            if (!FileSugar.IsExistDirectory(areaDir))
            {

                //创建目录
                FileSugar.CreateDirectory(areaDir); //创建area
                FileSugar.CreateDirectory(viewsDir);//创建views
                FileSugar.CreateDirectory(controllerDomainDir);

                //创建文件


                //创建文件
                var areaRegistrationCode = GetTemplateCodeByName("area_gobal.cshtml", new { projectName = System.Reflection.Assembly.GetExecutingAssembly().GetName().Name, area = _data.AreaName });
                FileSugar.WriteFile(areaRegistrationPath, areaRegistrationCode);
                ContainFileToCsproj(@"Areas\{0}\{0}AreaRegistration.cs".ToFormat(_data.AreaName), _solutionDir, _projectName, doc);
                ContainConfigToCsproj(@"Areas\{0}\Views\Web.config".ToFormat(_data.AreaName), _solutionDir, _projectName, doc);
            }
            var webConfigCode = GetTemplateCodeByName("area_webConfig.cshtml", new { });
            FileSugar.WriteFile(configPath, webConfigCode);
        }
        /// <summary>
        /// 生成controller
        /// </summary>
        private void BuildController(string controllerDir, string controllerPath, string controllerDomainPath, XDocument doc)
        {
            //写入控制器
            if (!FileSugar.IsExistFile(controllerPath))
            {
                FileSugar.CreateDirectory(controllerDir);
                ContainFileToCsproj(@"Areas\{0}\Controllers\{1}App\{1}Controller.cs".ToFormat(_data.AreaName, _data.ControllerName), _solutionDir, _projectName, doc);

            }

            //获取controller.cshtml的Model
            BuildControllerModel controllerModel = new BuildControllerModel()
            {
                areaName = _data.AreaName,
                controllerName = _data.ControllerName,
                actionName = _data.ActionName,
                siteName= ConfigSugar.GetAppString("siteName")

            };

            var apiList = _db.Queryable<SysBest_DataApi>().ToList();//获取所有api
            int addressId = _data.Id;
            int languageId = _languageId;
            var eleList = _db.Queryable<SysBest_Element>().Where(it => it.AddressId == addressId && it.LanguageId == languageId).ToList();

            var eleApidList = eleList.Where(it => it.ApiId != null && it.ApiId > 0).Select(it => it.ApiId).Distinct().ToList();//获取所有元素
            //获取元素表里面的数据接口
            controllerModel.apiList = apiList.Join(eleApidList, api => api.Id, ele => ele, (api, ele) => api).ToList();
            //获取属性表里面的数据接口
            controllerModel.apiList.AddRange(GetDataApiWithEleEventByEleId(eleList));
            controllerModel.apiList = controllerModel.apiList.Distinct().ToList();

            string controllerCode = GetTemplateCodeByName("controller.cshtml", controllerModel);
            FileSugar.WriteFile(controllerPath, controllerCode);

            //写入Domain
            if (!FileSugar.IsExistFile(controllerDomainPath))
            {
                var domainCode = GetTemplateCodeByName("controller_domain.cshtml", new { controllerName = _data.ControllerName, areaName = _data.AreaName });
                FileSugar.WriteFile(controllerDomainPath, domainCode);
                ContainFileToCsproj(@"Areas\{0}\Controllers\{1}App\Domain\{1}Domain.cs".ToFormat(_data.AreaName, _data.ControllerName), _solutionDir, _projectName, doc);
            }
        }

        /// <summary>
        /// 生成数据库表
        /// </summary>
        private void BuildDatabaseTableTable()
        {

        }

        public List<SysBest_DataApi> GetDataApiWithEleEventByEleId(List<SysBest_Element> eleList)
        {
            List<SysBest_DataApi> reval = new List<SysBest_DataApi>();
            if (eleList.IsValuable())
            {
                eleList.ForEach(it =>
                {
                    reval.AddRange(GetDataApiWithEleEventByEleId(it.Id));

                });
            }
            return reval;
        }
        /// <summary>
        /// 获取元素属性里面所引用的api
        /// </summary>
        /// <param name="eleId"></param>
        /// <returns></returns>
        public List<SysBest_DataApi> GetDataApiWithEleEventByEleId(int eleId)
        {

            var eventList = _db.Queryable<SysBest_ElementEvent>().Where(it => it.ElementId == eleId).ToList();
            var apiIds = eventList.SelectMany(it => it.Pars.JsonToModel<List<EventActionTypeParas>>()).Where(it => it.key == "apiId").Select(it => it.value.TryToInt()).ToList();
            return _db.Queryable<SysBest_DataApi>().In("Id", apiIds).ToList();
        }
        public string GetTemplateCodeByName(string tempName, object model)
        {
            string dir = FileSugar.MergeUrl(_uiEngineDir, "buildCode");
            string filePath = FileSugar.MergeUrl(dir, tempName);
            var tempCode = RazorEngineExtension.RazorPars(filePath, FileSugar.FileToString(filePath), model);
            return tempCode;
        }

        // 包含到项目文件中
        public static void ContainFileToCsproj(string fileName, string solutionDir, string csprojName, XDocument doc)
        {
            string path = solutionDir + @"\" + csprojName + ".csproj";


            XElement root = doc.Root;
            string xmlns = "{" + root.Attribute("xmlns").Value + "}";
            IEnumerable<XElement> compileList = root.Elements(xmlns + "ItemGroup").Elements(xmlns + "Compile");
            XElement itemGroup = compileList.FirstOrDefault().Parent;
            if (compileList.Where(u => u.Attribute("Include").Value == fileName).Count() > 0)
            {
                compileList.Where(u => u.Attribute("Include").Value == fileName).Remove();
            }

            XElement compile = new XElement(xmlns + "Compile");
            compile.SetAttributeValue("Include", fileName);
            itemGroup.AddFirst(compile);

        }
        // 包含到项目文件中
        public static void ContainConfigToCsproj(string fileName, string solutionDir, string csprojName, XDocument doc)
        {
            string path = solutionDir + @"\" + csprojName + ".csproj";


            XElement root = doc.Root;
            string xmlns = "{" + root.Attribute("xmlns").Value + "}";
            IEnumerable<XElement> compileList = root.Elements(xmlns + "ItemGroup").Elements(xmlns + "Content");
            XElement itemGroup = compileList.FirstOrDefault().Parent;
            if (compileList.Where(u => u.Attribute("Include").Value == fileName).Count() > 0)
            {
                compileList.Where(u => u.Attribute("Include").Value == fileName).Remove();
            }

            XElement compile = new XElement(xmlns + "Content");
            compile.SetAttributeValue("Include", fileName);
            itemGroup.AddFirst(compile);

        }

        private List<SysBest_Language> GetLanguageList
        {
            get
            {
                return _db.Queryable<SysBest_Language>().ToList();
            }
        }
    }
}