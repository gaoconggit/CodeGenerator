using System;
namespace Best.Entities.Tables
{
    public class SysBest_ElementEvent
    {
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int LinkId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int ElementId {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string Key {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public string Value {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:True
        ///</summary>
         public string Pars {get;set;}
        /// <summary>
        /// 说明:1、click 2、change 3、blur 4、dbclick 5、callBack 6、preinit
        /// 默认:
        /// 可空:True
        ///</summary>
         public int? EventType {get;set;}
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