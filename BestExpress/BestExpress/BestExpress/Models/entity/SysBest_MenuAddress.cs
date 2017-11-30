using System;
namespace Best.Entities.Tables
{
    public class SysBest_MenuAddress
    {
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int Id {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public Guid MenuId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string AreaName {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string ControllerName {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string ActionName {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string Parameters {get;set;}
        /// <summary>
        /// 说明:能把元素生成代码吗？ true表示能 默入插入请插入true
        /// 默认:
        /// 可空:True
        ///</summary>
         public bool CanGenerate {get;set;}
        /// <summary>
        /// 说明:是否生成过或者是否有元素
        /// 默认:
        /// 可空:False
        ///</summary>
         public bool HasElement {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public bool IsDeleted {get;set;}
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
    }
} 