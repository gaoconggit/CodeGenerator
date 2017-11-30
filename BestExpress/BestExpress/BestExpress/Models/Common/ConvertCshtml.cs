using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Best.Entities.Tables;
using SyntacticSugar;

using System.Text;
using System.Text.RegularExpressions;
using Best.Entities.UiEngine;
using SqlSugar;
using EntryRegistration.Models;

namespace Best.Site.Areas.BestPalace.Controllers
{
    /// <summary>
    /// 数据转换成cshtml内容,Review和build所需逻辑
    /// </summary>
    public class ConvertCshtml
    {
        private SqlSugarClient _db;
    
        //2017年6月16日 16:30:41
        public ConvertCshtml(SqlSugarClient db)
        {
            _db = db;
        }
        /// <summary>
        /// 获取预览ViewModel
        /// </summary>
        /// <param name="menuAddressId"></param>
        /// <param name="languageId"></param>
        /// <returns></returns>
        public PreviewModel ReviewModel(int menuAddressId, int languageId)
        {
            PreviewModel reval = new PreviewModel();
            PageFactoryDomain _pfd = new PageFactoryDomain(_db);
            reval.AddressId = menuAddressId;
            reval.LanguageId = languageId;
            var pageContent = _db.Queryable<SysBest_PageContent>().FirstOrDefault(it => it.AddressId == menuAddressId && it.LanguageId == languageId);
            var html = pageContent.Html;
            //获取Content里面的所有 htmlId
            var htmlIdList = GetHtmlIdListByPageContent(pageContent);
            //根据 htmlid查找出所有的元素
            var elementList = GetElementListByHtmlIdArray(htmlIdList.ToArray());
            //将content里面的占位标签进行替生成所需的html
            foreach (var htmlId in htmlIdList)
            {
                try
                {
                    html = _pfd.GetRestoreHtml(html, elementList, htmlId);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            reval.Html = html;
            reval.Layout = pageContent.layout;
            return reval;
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
        public List<SysBest_Element> GetElementListByHtmlIdArray(string[] htmlIdArray)
        {
            var reval = _db.Queryable<SysBest_Element>().In("html_id", htmlIdArray).ToList();
            return reval;
        }
    }
}