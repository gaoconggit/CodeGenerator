#region 命名空间

using Best.Entities.Tables;
using System.Collections.Generic;
using System.Linq;

#endregion

namespace Best.Entities.Common
{
    /// <summary>
    /// 角色授权帮助类
    /// </summary>
    public class RoleAuthorize : SysBest_Menu
    {
        #region Ctor.

        public RoleAuthorize()
        {

        }

        public RoleAuthorize(SysBest_Menu entity)
        {
            base.Id = entity.Id.ToString().Replace("/", "_");
            base.MenuName = entity.MenuName;
            base.TreeId = entity.TreeId;
            base.Icon = entity.Icon;
            base.IsDeleted = entity.IsDeleted;
            base.IsInnerPage = entity.IsInnerPage;
            base.ParentId = (entity.ParentId != null) ? entity.ParentId.ToString().Replace("/", "_") : "";
            base.Sort = entity.Sort;
            base.Founder = entity.Founder;
            base.CreateTime = entity.CreateTime;
            base.ModifiedBy = entity.ModifiedBy;
            base.ModifiedTime = entity.ModifiedTime;
        }

        #endregion

        /// <summary>
        /// 标识列
        /// </summary>
        public int Key { get; set; }

        /// <summary>
        /// 元素包列表
        /// </summary>
        public List<RoleElePackge> PackgeItems { get; set; }

        public List<OrgAuthorize> OrgItems { get; set; }
    }

    /// <summary>
    /// 元素包类
    /// </summary>
    public class RoleElePackge
    {
        #region Ctor.

        public RoleElePackge()
        {

        }

        public RoleElePackge(int elementId, string elementName, int addressId)
        {
            this.ElementId = elementId;
            this.ElementName = elementName;
            this.AddressId = addressId;
        }

        #endregion

        /// <summary>
        /// 元素包ID
        /// </summary>
        public int ElementId { get; set; }
        /// <summary>
        /// 元素包名
        /// </summary>
        public string ElementName { get; set; }
        /// <summary>
        /// 地址ID
        /// </summary>
        public int AddressId { get; set; }
    }

    /// <summary>
    /// 部门类
    /// </summary>
    public class OrgAuthorize {

        #region Ctor.

        public OrgAuthorize()
        {

        }

        public OrgAuthorize(int orgId, string orgName)
        {
            this.OrgId = orgId;
            this.OrgName = orgName;
        }

        #endregion

        /// <summary>
        /// 部门编号
        /// </summary>
        public int OrgId { get; set; }
        /// <summary>
        /// 部门名称
        /// </summary>
        public string OrgName { get; set; }
    }
}
