using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Best.Entities.Tables;
using SqlSugar;
using System.Linq.Expressions;
using System;
using System.Text.RegularExpressions;
using SyntacticSugar;
namespace Best.Infrastructure.DAL
{
    public partial class SysBest_PageContentService
    {

        private SqlSugarClient _db;
        public SysBest_PageContentService(SqlSugarClient db)
        {
            _db = db;
        }
        /// <summary>
        /// 保存 page Content
        /// </summary>
        /// <param name="sp"></param>
        /// <param name="userName"></param>
        public void SavePageContent(SysBest_PageContent sp, string userName)
        {
            var id = sp.Id;
            try
            {
                _db.BeginTran();
                Expression<Func<SysBest_PageContent, bool>> whereExpress = it => it.AddressId == sp.AddressId && it.LanguageId == sp.LanguageId;
                var isAny = _db.Queryable<SysBest_PageContent>().Any(whereExpress);
                if (isAny)
                {
                    var data = _db.Queryable<SysBest_PageContent>().Single(whereExpress);
                    data.Html = sp.Html;
                    data.layout = sp.layout;
                    data.ModifiedBy = userName;
                    data.ModifiedTime = DateTime.Now;
                    _db.Update(data);
                    id = data.Id;
                }
                else
                {
                    sp.Sort = 0;
                    sp.Founder = userName;
                    sp.CreateTime = DateTime.Now;
                    id = _db.Insert(sp).TryToInt();
                }
                //表单中的所有控件html id
                List<string> formHtmlIdList = GetHtmlIdListByPageContent(sp);


                //数据库中存在的html
                var dbIdList = _db.Queryable<SysBest_Element>().Where(it => it.AddressId == sp.AddressId && it.LanguageId == sp.LanguageId).ToList().Select(it => it.Html_Id).ToList();

                //在数据中，但是不在表单里面的需要删除
                var delHtmlIdList = dbIdList.Where(it => formHtmlIdList.Any(htmlId => htmlId == it).IsFalse()).ToList();//不存在content里面的元素需要删除
                foreach (var it in delHtmlIdList)
                {
                    _db.Delete<SysBest_Element>(m => m.Html_Id == it);
                }
                //插入备份
                InsertElementItemBak(sp.AddressId, sp.LanguageId, _db);

                //处理其它页面控件的HTMLID
                distinctHtmlIdList(sp, formHtmlIdList);

                _db.CommitTran();
            }
            catch (Exception ex)
            {
                _db.RollbackTran();
                throw ex;
            }
        }
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
        private void distinctHtmlIdList(SysBest_PageContent sp, List<string> formHtmlIdList)
        {
            foreach (var htmlId in formHtmlIdList)
            {
                var oldList = _db.Queryable<SysBest_Element>()
                    .Where(it => it.AddressId != sp.AddressId || it.LanguageId != sp.LanguageId)
                    .Where(it => it.Html_Id == htmlId).ToList();
                if (oldList.Any())
                {
                    var oldElement = oldList.Single();
                    var oldAttr = _db.Queryable<SysBest_ElementAttr>().Where(it => it.ElementId == oldElement.Id).ToList();
                    var oldEvent = _db.Queryable<SysBest_ElementEvent>().Where(it => it.ElementId == oldElement.Id).ToList();
                    var newHtmlId = "randId_" + Guid.NewGuid().ToString().Replace("-", "");
                    //替换现成HTML里面的 HTMLID
                    sp.Html = sp.Html.Replace(htmlId, newHtmlId);
                    _db.Update<SysBest_PageContent>(new { Html = sp.Html }, it => it.AddressId == sp.AddressId && it.LanguageId == sp.LanguageId);
                    var newElement = new SysBest_Element()
                    {
                        AddressId = sp.AddressId,
                        LanguageId = sp.LanguageId,
                        Html_Id = newHtmlId,
                        //取原始属性
                        ApiId = oldElement.ApiId,
                        CreateTime = DateTime.Now,
                        Description = oldElement.Description,
                        ElementType = oldElement.ElementType,
                        EleName = oldElement.EleName,
                        Founder = oldElement.Founder,
                        Sort = oldElement.Sort
                    };
                    //插入新元素
                    var id = _db.Insert<SysBest_Element>(newElement).TryToInt();
                    //插入新元素属性
                    foreach (var it in oldAttr)
                    {
                        var attr = new SysBest_ElementAttr()
                        {
                            CreateTime = DateTime.Now,
                            ElementId = id,
                            Founder = it.Founder,
                            Key = it.Key,
                            Value = it.Value,
                            LinkId = newElement.AddressId,
                            Sort = it.Sort
                        };
                        _db.Insert<SysBest_ElementAttr>(attr).TryToInt();
                    };
                    //插入新元素事件
                    foreach (var it in oldEvent)
                    {
                        var even = new SysBest_ElementEvent()
                        {
                            CreateTime = DateTime.Now,
                            ElementId = id,
                            Founder = it.Founder,
                            Key = it.Key,
                            Value = it.Value,
                            LinkId = newElement.AddressId,
                            Sort = it.Sort,
                            EventType = it.EventType,
                            Pars = it.Pars,

                        };
                        _db.Insert<SysBest_ElementEvent>(even).TryToInt();
                    };
                }
            }
        }

        /// <summary>
        /// 获取PageContent里面的 htmlid集合
        /// </summary>
        /// <param name="sp"></param>
        /// <returns></returns>
        public List<string> GetHtmlIdListByPageContent(SysBest_PageContent sp)
        {
            return Regex.Matches(sp.Html.TryToString(), @"data\-id\=""(randId_.+?)""")
                .Cast<Match>()
                .Select(it => it.Groups[1].Value).ToList();
        }
        /// <summary>
        /// 是否保存
        /// </summary>
        /// <param name="menuAddressId"></param>
        /// <param name="languageId">true已保存，false未保存</param>
        /// <returns></returns>
        public bool IsExis(int menuAddressId = 0, int languageId = 0)
        {
            var reval = _db.Queryable<SysBest_PageContent>().Any(it => it.AddressId == menuAddressId && it.LanguageId == languageId);
            return reval;
        }
    }
}
