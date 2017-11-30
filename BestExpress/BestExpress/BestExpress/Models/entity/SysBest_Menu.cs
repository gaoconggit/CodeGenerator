using System;
namespace Best.Entities.Tables
{
    public class SysBest_Menu
    {
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public object Id {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string MenuName {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public Guid TreeId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string Icon {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public bool IsDeleted {get;set;}
        /// <summary>
        /// 说明:是否内嵌
        /// 默认:
        /// 可空:True
        ///</summary>
         public bool IsInnerPage {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public object ParentId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int Sort {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string Founder {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public DateTime CreateTime {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string ModifiedBy {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public DateTime? ModifiedTime {get;set;}
        /// <summary>
        /// 说明:默认地址，用于菜单
        /// 默认:
        /// 可空:True
        ///</summary>
         public string MenuUrl {get;set;}
    }
} 