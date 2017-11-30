#region 命名空间

using Best.Entities.Tables;

using SqlSugar;
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;

#endregion

namespace Best.Site.Areas.BestPalace.Controllers
{
    public class MenuDomain
    {
        #region Ctor.
        private SqlSugarClient _db;
        public MenuDomain(SqlSugarClient db)
        {
            _db = db;
        }

        #endregion

        /// <summary>
        /// 获取树形菜单
        /// </summary>
        /// <returns></returns>
        public List<TreeViewModel> GetTreeMenus()
        {
            var menuList = new List<TreeViewModel>();
            var data = _db.Queryable<SysBest_Menu>().ToList().OrderBy(i => i.Sort).ThenByDescending(i => i.CreateTime).ToList();
            foreach (var it in data)
            {
                menuList.Add(new TreeViewModel(it.Id.TryToString(), it.ParentId.TryToString(), it.TreeId, it.MenuName));
            }
            return menuList;
        }

        /// <summary>
        /// 新增树形菜单
        /// </summary>
        /// <param name="parentTreeId"></param>
        /// <param name="menuName"></param>
        /// <param name="sort"></param>
        /// <returns></returns>
        public TreeViewModel InsertTreeMenu(string parentTreeId, string menuName, string icon, bool isInnerPage, int sort)
        {
            var parentTree = (parentTreeId.IsNullOrEmpty()) ? Guid.NewGuid() : Guid.Parse(parentTreeId);
            return InsertMenu(parentTree, Guid.NewGuid(), menuName, icon.TryToString(), isInnerPage, sort, "哈哈");

        }
        /// <summary>
        /// 新增菜单
        /// </summary>
        /// <param name="parentTreeId"></param>
        /// <param name="treeId"></param>
        /// <param name="menuName"></param>
        /// <param name="sort"></param>
        /// <param name="founder"></param>
        /// <returns></returns>
        public TreeViewModel InsertMenu(Guid parentTreeId, Guid treeId, string menuName, string icon, bool isInnerPage, int sort, string founder)
        {
            _db.ExecuteCommand("exec SP_SysBest_AddMenuTree @parentTreeId, @treeId,@menuName,@icon,@isDeleted,@isInnerPage,@sort,@founder,@createTime,@MenuUrl", new
            {
                parentTreeId = parentTreeId,
                treeId = treeId,
                menuName = menuName,
                icon = icon,
                isDeleted = false,
                isInnerPage = isInnerPage,
                sort = sort,

                founder = founder,
                createTime = DateTime.Now,
                MenuUrl = RequestInfo.QueryString("MenuUrl")
            });
            var reval = _db.Queryable<SysBest_Menu>().Where(it => it.TreeId == treeId).ToList().Select(it => new TreeViewModel()
            {
                id = it.Id.TryToString().Replace("/", "_"),
                parentid = it.ParentId.TryToString().Replace("/", "_"),
                value = it.TreeId,
                text = it.MenuName,
                expanded = true,
                label = $"{it.Id.TryToString()} {it.MenuName}"
            }).Single();
            return reval;
        }
        ///// <summary>
        ///// 编辑树形菜单
        ///// </summary>
        ///// <param name="parentTreeId"></param>
        ///// <param name="menuName"></param>
        ///// <param name="sort"></param>
        ///// <returns></returns>
        //public TreeViewModel UpdateTreeMenu(string parentTreeId, string menuName, string icon, bool isInnerPage, int sort)
        //{
        //    var parentTree = (parentTreeId.IsNullOrEmpty()) ? Guid.NewGuid() : Guid.Parse(parentTreeId);

        //    return _.sysBest_MenuService.UpdateMenu(parentTree, menuName, icon.TryToString(), isInnerPage, sort, this.CurrentUserName());
        //}

        ///// <summary>
        ///// 移动树形菜单
        ///// </summary>
        ///// <param name="oldTreeId"></param>
        ///// <param name="newId"></param>
        ///// <returns></returns>
        //public bool MoveTreeMenu(string oldTreeId, string newId)
        //{
        //    var oldTree = (oldTreeId.IsNullOrEmpty()) ? Guid.NewGuid() : Guid.Parse(oldTreeId);
        //    var newTree = _.sysBest_MenuService.GetMenuByTreeId(newId.TryToString()).TreeId;

        //    return _.sysBest_MenuService.MoveMenu(oldTree, newTree, this.CurrentUserName());
        //}

        ///// <summary>
        ///// //获取当前登录用户的用户名
        ///// </summary>
        ///// <returns></returns>
        //private string CurrentUserName()
        //{
        //    return _.sysBest_UserInfoService.GetCurrentUser.Founder.TryToString();
        //}
    }
}