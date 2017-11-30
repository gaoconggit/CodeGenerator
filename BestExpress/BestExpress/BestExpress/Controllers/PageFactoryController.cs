
using Best.Entities.Tables;
using Best.Entities.UiEngine;
using Best.Infrastructure.DAL;
using Best.Site.Areas.BestPalace.Controllers;
using EntryRegistration.Models;
using EntryRegistration.Models.Entity;
using RazorEngine;
using SqlSugar;
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;

namespace BestExpress.Controllers
{
    public class PageFactoryController : Controller
    {

        private SqlSugarClient _db;
        private IDBService<SqlSugarClient> _IDb;
        //2017年6月16日 16:30:41
        public PageFactoryController(IDBService<SqlSugarClient> db)
        {
            _db = db.GetDBInstance();
            _IDb = db;
        }

        public ActionResult Index(int menuAddressId, int languageId)
        {
            PageFactoryDomain _pfd = new PageFactoryDomain(_db);
            ////获取控件信息
            ViewBag.ControlList = _pfd.GetControlInfoList();
            //获取所有的布局文件路径
            ViewBag.LayoutPathList = _pfd.GetLayoutPathList;
            //当前菜单地址ID
            ViewBag.menuAddressId = menuAddressId;
            //当前语言ID
            ViewBag.languageId = languageId;
            //当前菜单名称和当前语言
            var mNameAndLName = GetMenuNameAndLanguageNameById(menuAddressId, languageId);
            //菜单名称
            ViewBag.menuName = mNameAndLName.Key;
            //当前语言
            ViewBag.languageName = mNameAndLName.Value;
            //X6数据API
            ViewBag.apiTypeList = _db.Queryable<SysBest_DataApiType>().ToList();
            Expression<Func<SysBest_PageContent, bool>> whereExpress = it => it.AddressId == menuAddressId && it.LanguageId == languageId;
            var isEdit = _db.Queryable<SysBest_PageContent>().Any(whereExpress);
            if (isEdit)
            {
                var data = _db.Queryable<SysBest_PageContent>().FirstOrDefault(whereExpress);
                return View(data);
            }
            else
                return View();
        }
        /// <summary>
        /// 获取菜单名和语言 Key为菜单名 Value为语言后缀
        /// </summary>
        /// <param name="mid"></param>
        /// <param name="lid"></param>
        /// <returns></returns>
        public KeyValue GetMenuNameAndLanguageNameById(int mid, int lid)
        {

            KeyValue kv = new KeyValue();
            kv.Key = _db.GetScalar(@"select  MenuName from SysBest_Menu m inner join SysBest_MenuAddress a on m.TreeId=a.MenuId and a.id=@id", new { id = mid }).ToString();
            kv.Value = _db.Queryable<SysBest_Language>().Single(it => it.Id == lid).Suffix;
            return kv;
        }
        /// <summary>
        /// 保存页面内容
        /// </summary>
        [ValidateInput(false)]
        public JsonResult SavePageContent(SysBest_PageContent sp)
        {
            SysBest_PageContentService service = new SysBest_PageContentService(_db);
            service.SavePageContent(sp, "聪哥");
            ActionResultModel<string> model = new ActionResultModel<string>();
            model.isSuccess = true;
            return Json(model, JsonRequestBehavior.AllowGet);
        }
        //获取插入ueditor里面的HTML
        /// <summary>
        /// 获取插入ueditor里面的HTML
        /// </summary>
        /// <param name="key">控件的Key</param>
        /// <param name="categoryKey">控件类型的Key</param>
        /// <param name="hasSource"></param>
        /// <returns></returns>
        public string GetEditor(string key, string categoryKey, bool? hasSource)
        {
            //控件模板地址
            var cshtmlPath = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineEditorDir, "template.cshtml");
            //控件图标地址
            var icon = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineControlsWebDir, categoryKey, "items", key, "icon.png");
            //传给raozr的Model
            var model = new { categoryKey = categoryKey, key = key, icon = icon, hasSource = hasSource };
            //razor模板对应的文本
            var html = FileSugar.FileToString(cshtmlPath);
            //解析razor生成最终的文本
            var reval = RazorEngineExtension.RazorPars(cshtmlPath, html, model);
            return reval;
        }
        /// <summary>
        /// 根据HTMLID获取元素
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public JsonResult GetElementByHtmlId(string id)
        {



            var isAny = _db.Queryable<SysBest_Element>().Any(it => it.Html_Id == id);
            var model = new ActionResultModel<SysBest_V_ElementDataApi>();
            if (isAny)
            {
                model.isSuccess = true;
                model.responseInfo = _db.Queryable<SysBest_V_ElementDataApi>().FirstOrDefault(it => it.Html_Id == id);
            }
            else
            {
                model.responseInfo = null;
            }
            return Json(model, JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// 获取控件属性
        /// </summary>
        /// <returns></returns>
        [OutputCache(Duration = 0)]
        public string GetControlAttribute(string key, string categoryKey, int elementId = 0)
        {
            var cshtmlPath = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineControlsDir, categoryKey, "items", key, "attribute.cshtml");
            var html = FileSugar.FileToString(cshtmlPath);
            if (elementId > 0)
            {
                var attrs = _db.Queryable<SysBest_ElementAttr>().Where(it => it.ElementId == elementId).ToList();
                var reval = RazorEngineExtension.RazorPars(cshtmlPath, html, attrs);
                return reval;
            }
            else
            {
                var reval = RazorEngineExtension.RazorPars(cshtmlPath, html, new List<SysBest_ElementAttr>());
                return reval;
            }
        }

        //获取事件
        [OutputCache(Duration = 0)]
        public string GetControlEvent(int elementId = 0, bool isSingle = false)
        {
            //获取件动作
            var eventActionTypeList = PubUiEngineGet.GetEventActionConfigList;
            var model = EventManager.GetInstance.GetEeventList.FindAll(it => it.Name.IsIn("getValue", "setValue").IsFalse());
            foreach (var it in model)
            {
                it.ActionTypeList = eventActionTypeList;
            }
            var cshtmlPath = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineEditorDir, "event.cshtml");
            if (isSingle == true)
            {
                cshtmlPath = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineEditorDir, "eventSingle.cshtml");
            }
            var html = FileSugar.FileToString(cshtmlPath);
            if (elementId > 0)
            {
                var events = _db.Queryable<SysBest_ElementEvent>().Where(it => it.ElementId == elementId).ToList();
                var reval = RazorEngineExtension.RazorPars(cshtmlPath, html, new { Key = model, Value = events });
                return reval;
            }
            else
            {
                var reval = RazorEngineExtension.RazorPars(cshtmlPath, html, new { Key = model, Value = new List<SysBest_ElementEvent>() });
                return reval;
            }
        }
        /// <summary>
        /// 保存事件和属性
        /// </summary>
        [ValidateInput(false)]
        public JsonResult SaveAttrsAndEvents(string htmlId, int addressId, int languageId, string category, string eleName, int? ApiId, string Description)
        {
            PageFactoryDomain _pfd = new PageFactoryDomain(_db);
            //允许Form有特殊字符 如 < ,等
            RequestToModel.SetIsUnvalidatedFrom = key =>
            {
                var val = Request.Unvalidated.Form.GetValues(key);
                if (val.IsNullOrEmpty()) return null;
                var formArray = val.Select(it => it == null ? it : it.Replace(",", RequestToModel.COMMAS)).ToArray();
                return string.Join(",", formArray);
            };

            //锁住静态对象
            lock (RequestToModel.SetIsUnvalidatedFrom)
            {
                var elementType = _pfd.GetElementIdByCategory(category);
                SysBest_Element insObj = new SysBest_Element()
                {
                    AddressId = addressId,
                    CreateTime = DateTime.Now,
                    ElementType = elementType,
                    LanguageId = languageId,
                    EleName = eleName,
                    Html_Id = htmlId,
                    ApiId = ApiId,
                    Description = Description,
                    Founder="聪哥"
                };
                //允许特殊字符
                var formEvents = RequestToModel.GetListByForm<ElementEvent>("event.");
                var formAttrs = RequestToModel.GetListByForm<ElementAttr>("attr.");
                //用完清空
                RequestToModel.SetIsUnvalidatedFrom = null;
                var reval = SaveAttrsAndEvents_temp(elementType, insObj, addressId, formAttrs, formEvents);
                ActionResultModel<string> model = new ActionResultModel<string>();
                model.isSuccess = reval;
                return Json(model);
            }
        }

        /// <summary>
        /// 保存事件和属性
        /// </summary>
        /// <param name="elementType"></param>
        /// <param name="insObj"></param>
        /// <returns></returns>

        public bool SaveAttrsAndEvents_temp(int elementType, SysBest_Element insObj, int addressId, List<ElementAttr> formAttrs, List<ElementEvent> formEvents)
        {
            try
            {
                _db.BeginTran();



                //保存元素
                int elementId = 0;
                var isAdd = _db.Queryable<SysBest_Element>().Any(it => it.Html_Id == insObj.Html_Id).IsFalse();
                if (isAdd)
                {
                    //添加
                    
                    elementId = _db.Insert<SysBest_Element>(insObj).TryToInt();
                }
                else
                {

                    //编辑
                    var data = _db.Queryable<SysBest_Element>().Single(it => it.Html_Id == insObj.Html_Id);
                    data.EleName = insObj.EleName;
                    data.ModifiedTime = DateTime.Now;
                    data.ModifiedBy = insObj.Founder;
                    data.ApiId = insObj.ApiId;
                    data.Description = insObj.Description;
                    _db.Update(data);
                    elementId = data.Id;
                }

                InsertAttrs(addressId, formAttrs, elementId, insObj.Founder);

                //插入事件
                InsertEvents(insObj, addressId, formEvents, elementId, insObj.Founder);

                //插入备份
                this.InsertElementItemBak(addressId, insObj.LanguageId, _db);

                _db.CommitTran();
                return true;
            }
            catch (Exception ex)
            {
                _db.RollbackTran();
                throw ex;
            }
        }


        /// <summary>
        /// 删除元素,使用该方法需要用到事务
        /// </summary>
        /// <param name="htmlId"></param>
        /// <returns></returns>
        internal bool DeleteElement(string htmlId, SqlSugarClient db)
        {

            var data = db.Queryable<SysBest_Element>().Where(it => it.Html_Id == htmlId).SingleOrDefault();
            if (data != null)
            {
                var id = data.Id;
                db.Delete<SysBest_Element, int>(id);
                db.Delete<SysBest_ElementAttr>(it => it.ElementId == id);
                db.Delete<SysBest_ElementEvent>(it => it.ElementId == id);
                db.Delete<SysBest_ElementPackageDetail>(it => it.ElementId == id);

            }
            return true;
        }

        private void InsertAttrs(int addressId, List<ElementAttr> formAttrs, int elementId, string founder)
        {
            if (formAttrs.IsValuable())
            {
                _db.Delete<SysBest_ElementAttr>(it => it.ElementId == elementId);
                //插入属性
                List<SysBest_ElementAttr> insertAttrList = new List<SysBest_ElementAttr>();
                foreach (var it in formAttrs)
                {
                    if (it.Value.IsNullOrEmpty())
                        continue;
                    SysBest_ElementAttr data = new SysBest_ElementAttr()
                    {
                        ElementId = elementId,
                        Key = it.Key,
                        Value = it.Value,
                        LinkId = addressId,
                        Sort = 0,
                        CreateTime = DateTime.Now,
                        Founder = "admin"
                    };
                    insertAttrList.Add(data);
                }
                _db.InsertRange(insertAttrList, false);
            }
        }

        private void InsertEvents(SysBest_Element insObj, int addressId, List<ElementEvent> formEvents, int elementId, string founder)
        {
            if (formEvents.IsValuable())
            {
                _db.Delete<SysBest_ElementEvent>(it => it.ElementId == elementId);
                List<SysBest_ElementEvent> insertEventList = new List<SysBest_ElementEvent>();
                foreach (var it in formEvents)
                {
                    if (it.Value.IsNullOrEmpty())
                        continue;
                    SysBest_ElementEvent data = new SysBest_ElementEvent()
                    {
                        ElementId = elementId,
                        Key = it.Key,
                        Value = it.Value,
                        LinkId = addressId,
                        EventType = it.EventType.TryToInt(),
                        Pars = (it.Pars.TryToString()).ToUrlDecode().Replace("$^douhao^$", ","),
                        CreateTime = DateTime.Now,
                        Founder = insObj.Founder,
                        Sort = 0
                    };
                    insertEventList.Add(data);
                }
                _db.InsertRange(insertEventList, false);
            }
        }

        //public List<SysBest_Element> GetElementListByHtmlIdArray(string[] htmlIdArray)
        //{
        //    var reval = _db.Queryable<SysBest_Element>().In("html_id", htmlIdArray).ToList();
        //    return reval;
        //}

        //public List<SysBest_DataApi> GetDataApiWithEleEventByEleId(List<SysBest_Element> eleList)
        //{
        //    List<SysBest_DataApi> reval = new List<SysBest_DataApi>();
        //    if (eleList.IsValuable())
        //    {
        //        eleList.ForEach(it =>
        //        {
        //            reval.AddRange(GetDataApiWithEleEventByEleId(it.Id));

        //        });
        //    }
        //    return reval;
        //}


        /// <summary>
        /// 获取元素属性里面所引用的api
        /// </summary>
        /// <param name="eleId"></param>
        /// <returns></returns>
        //public List<SysBest_DataApi> GetDataApiWithEleEventByEleId(int eleId)
        //{

        //    var eventList = _db.Queryable<SysBest_ElementEvent>().Where(it => it.ElementId == eleId).ToList();
        //    var apiIds = eventList.SelectMany(it => it.Pars.JsonToModel<List<EventActionTypeParas>>()).Where(it => it.key == "apiId").Select(it => it.value.TryToInt()).ToList();
        //    return _db.Queryable<SysBest_DataApi>().In("Id", apiIds).ToList();
        //}

        /// <summary>
        /// 插入备份信息
        /// </summary>
        /// <param name="addressId">地址编号</param>
        /// <param name="lanId">语言编号</param>
        public void InsertElementItemBak(int addressId, int lanId, SqlSugarClient _db)
        {
            int pageContentId = 0; //PageContent表编号

            #region 插入Insert PageContentBak

            var oldPageContent = _db.Queryable<SysBest_PageContent>().Where(it => it.LanguageId == lanId && it.AddressId == addressId).ToList();
            if (oldPageContent.IsValuable().IsFalse()) return;
            var oldPageContentSingle = oldPageContent.Single();

            pageContentId = _db.Insert(new SysBest_PageContentBak()
            {
                Id = 0,
                AddressId = oldPageContentSingle.AddressId,
                LanguageId = oldPageContentSingle.LanguageId,
                Html = oldPageContentSingle.Html,
                layout = oldPageContentSingle.layout,
                Sort = 0,
                Founder = oldPageContentSingle.Founder,
                CreateTime = DateTime.Now
            }).TryToInt();

            #endregion

            var eleList = _db.Queryable<SysBest_Element>().Where(it => it.AddressId == addressId && it.LanguageId == lanId).ToList();
            if (eleList.IsValuable())
            {
                foreach (var ele in eleList)
                {
                    #region Insert ElementBak

                    _db.Insert(new SysBest_ElementBak()
                    {
                        Id = ele.Id,
                        AddressId = ele.AddressId,
                        LanguageId = ele.LanguageId,
                        PageId = pageContentId,
                        ApiId = ele.ApiId,
                        Description = ele.Description,
                        Html_Id = ele.Html_Id,
                        EleName = ele.EleName,
                        ElementType = ele.ElementType,
                        Sort = ele.Sort,
                        Founder = ele.Founder,
                        CreateTime = ele.CreateTime,
                        ModifiedBy = ele.ModifiedBy,
                        ModifiedTime = ele.ModifiedTime
                    });

                    #endregion

                    #region Insert ElementAttr

                    var attrList = _db.Queryable<SysBest_ElementAttr>().Where(attr => ele.Id == attr.ElementId).ToList();
                    if (attrList.IsValuable())
                    {
                        foreach (var at in attrList)
                        {
                            var data = new SysBest_ElementAttrBak()
                            {
                                ElementId = at.ElementId,
                                PageId = pageContentId,
                                Key = at.Key,
                                Value = at.Value,
                                LinkId = at.LinkId,
                                Sort = at.Sort,
                                CreateTime = at.CreateTime,
                                Founder = at.Founder,
                            };
                            _db.Insert(data);
                        }
                    }

                    #endregion

                    #region Insert ElementEvent

                    var eventList = _db.Queryable<SysBest_ElementEvent>().Where(eve => ele.Id == eve.ElementId).ToList();
                    if (eventList.IsValuable())
                    {
                        foreach (var at in eventList)
                        {
                            var data = new SysBest_ElementEventBak()
                            {
                                ElementId = at.ElementId,
                                PageId = pageContentId,
                                Key = at.Key,
                                Value = at.Value,
                                LinkId = at.LinkId,
                                EventType = at.EventType,
                                Pars = at.Pars,
                                Sort = at.Sort,
                                Founder = at.Founder,
                                CreateTime = at.CreateTime
                            };
                            _db.Insert(data);
                        }
                    }

                    #endregion

                    #region  Insert ElementPackageDetail

                    var packList = _db.Queryable<SysBest_ElementPackageDetail>().Where(eve => ele.Id == eve.ElementId).ToList();
                    if (packList.IsValuable())
                    {
                        foreach (var at in packList)
                        {
                            var sbepdBak = new SysBest_ElementPackageDetailBak
                            {
                                PackId = at.PackId,
                                MenuId = at.MenuId,
                                AddressId = at.AddressId,
                                ElementId = at.ElementId,
                                PageId = pageContentId
                            };
                            _db.Insert(sbepdBak, false);
                        }
                    }

                    #endregion
                }
            }
        }
        /// <summary>
        /// 根据地址ID生成
        /// </summary>
        /// <param name="menuAddressId"></param>
        /// <param name="languageId"></param>
        /// <returns></returns>
        public JsonResult Build(int menuAddressId, int languageId)
        {
            BuildDomain _bd = new BuildDomain(_db);
            ActionResultModel<string> model = new ActionResultModel<string>();
            _bd.Excute(menuAddressId, languageId, PubUiEngineGet.GetUiEngineDir);
            model.isSuccess = true;
            return Json(model, JsonRequestBehavior.AllowGet);
        }
    }
}