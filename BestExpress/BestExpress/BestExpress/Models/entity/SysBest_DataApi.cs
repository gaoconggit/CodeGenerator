using System;
namespace Best.Entities.Tables
{
    public class SysBest_DataApi
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
         public string Title {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string ActionName {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string T {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string TPars {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string Code {get;set;}
        /// <summary>
        /// 说明:多个参数名以逗号隔开
        /// 默认:
        /// 可空:False
        ///</summary>
         public string Parameters {get;set;}
        /// <summary>
        /// 说明:1是需要过滤 2是不需要过滤
        /// 默认:
        /// 可空:False
        ///</summary>
         public bool NeedFilter {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int ApiType {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int ApiActionType {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public DateTime? ModifiedTime {get;set;}
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
        /// 可空:False
        ///</summary>
         public bool IsDeleted {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public bool AllowHtml {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string FilterKey {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public int? PevApi {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public int? NextApi {get;set;}
    }
} 