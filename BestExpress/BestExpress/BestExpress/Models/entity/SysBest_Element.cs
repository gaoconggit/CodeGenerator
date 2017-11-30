using System;
namespace Best.Entities.Tables
{
    public class SysBest_Element
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
         public int AddressId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int LanguageId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public int? ApiId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string Description {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string Html_Id {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string EleName {get;set;}
        /// <summary>
        /// 说明:1、表单控件 2、显示控件 3、布局控件
        /// 默认:
        /// 可空:False
        ///</summary>
         public int ElementType {get;set;}
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