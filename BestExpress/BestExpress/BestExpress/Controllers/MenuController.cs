using Best.Entities.Tables;
using Best.Site.Areas.BestPalace.Controllers;
using EntryRegistration.Models;
using EntryRegistration.Models.Entity;
using SqlSugar;
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BestExpress.Controllers
{
    public class MenuController : Controller
    {
        private SqlSugarClient _db;
        private IDBService<SqlSugarClient> _IDb;
        //2017年6月16日 16:30:41
        public MenuController(IDBService<SqlSugarClient> db)
        {
            _db = db.GetDBInstance();
            _IDb = db;
        }
        /// <summary>
        /// 树形菜单主页
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            #region 绑定内嵌字段下拉框数据源

            var item = new Dictionary<String, Boolean>();
            item.Add("否", false);
            item.Add("是", true);

            ViewBag.IsInnerPageDataSource = new SelectList(item, "Value", "Key");

            #endregion

            return View();
        }
        /// <summary>
        /// 加载树形菜单数据集
        /// </summary>
        /// <returns></returns>
        public JsonResult LoadTreeMenu()
        {
            MenuDomain menu = new MenuDomain(_db);
            var treeMenu = menu.GetTreeMenus();
            return Json(treeMenu, JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// 新增树形菜单
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult AddTreeMenu(string parentTreeId, string menuName, string icon, bool isInnerPage, int sort)
        {

            MenuDomain menu = new MenuDomain(_db);
            var model = new ActionResultModel<TreeViewModel>();
            model.isSuccess = true;
            model.responseInfo = menu.InsertTreeMenu(parentTreeId, menuName, icon, isInnerPage, sort);
            return Json(model);
        }

        /// <summary>
        /// 删除树形菜单
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult DeleteTreeMenu(string parentTreeId)
        {
            var model = new ActionResultModel<string>();
            Guid temp = Guid.Parse(parentTreeId);
            model.isSuccess = _db.Delete<SysBest_Menu>(i => i.TreeId == temp);
            model.responseInfo = model.isSuccess.IIF("删除菜单成功!", "删除菜单失败!");
            return Json(model);
        }

    }
}