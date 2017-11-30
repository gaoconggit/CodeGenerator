using Best.Entities.Tables;
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
    public class MenuAddressController : Controller
    {
        private SqlSugarClient _db;
        private IDBService<SqlSugarClient> _IDb;
        //2017年6月16日 16:30:41
        public MenuAddressController(IDBService<SqlSugarClient> db)
        {
            _db = db.GetDBInstance();
            _IDb = db;
        }

        // GET: MenuAddress
        public ActionResult Index()
        {
            if (Request.RawUrl == "/")
            {
                return Redirect("/MenuAddress/Index");
            }
            else
            {
                return View();
            }

        }
        public ActionResult loadTreeMenu()
        {
            var menuList = new List<TreeViewModel>();
            //查出SysBest_Menu表的所有数据按创建时间倒序
            var data = _db.SqlQuery<SysBest_Menu>("select * from SysBest_Menu order by Sort asc,CreateTime desc;").ToList();
            foreach (SysBest_Menu it in data)
            {
                var model = new TreeViewModel();
                model.id = it.Id.TryToString().Replace("/", "_");
                model.parentid = it.ParentId.TryToString().Replace("/", "_");
                model.text = $"{it.Id.TryToString()}\t{it.MenuName.TryToString()}";
                model.value = it.TreeId;
                menuList.Add(model);
            }
            return JsonHandle.GetResult(menuList);
        }



        public ActionResult loadTreeMenuDetail(Guid menuId)
        {
            return JsonHandle.GetResult(_db.Queryable<SysBest_MenuAddress>()
                .Where(it => it.MenuId == menuId)
                .Where("IsDeleted = @IsDeleted",
                new { IsDeleted = 0 }).ToList());
        }


        public ActionResult LoadLanguages()
        {
            return JsonHandle.GetResult(_db.Queryable<SysBest_Language>().OrderBy(m => m.Sort).ToList());
        }

        public JsonResult EditTreeMenuDetail(SysBest_MenuAddress entity)
        {


            var model = new ActionResultModel<string>();
            model.isSuccess = _db.Update<SysBest_MenuAddress>(entity);
            model.responseInfo = model.isSuccess.IIF("编辑菜单详情成功!", "编辑菜单详情失败!");
            return Json(model);
        }
        #region 新增菜单详情

        [HttpPost]
        public JsonResult AddTreeMenuDetail(SysBest_MenuAddress entity)
        {

            entity.CreateTime = DateTime.Now;
            entity.Founder = "聪哥";
            var model = new ActionResultModel<string>();
            _db.Insert(entity);
            model.isSuccess = true;
            model.responseInfo = model.isSuccess.IIF("新增菜单详情成功!", "新增菜单详情失败!");
            return Json(model);
        }

        #endregion


        /// <summary>
        /// 删除树形菜单详情
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult DeleteTreeMenuDetail(int id)
        {
            var model = new ActionResultModel<string>();
            model.isSuccess = _db.Delete<SysBest_MenuAddress>(m => m.Id == id);
            model.responseInfo = model.isSuccess.IIF("删除菜单详情成功!", "删除菜单详情失败!");
            return Json(model);
        }
    }
}