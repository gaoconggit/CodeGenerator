using System;
namespace Best.Entities.Tables
{
    public class SysBest_Language
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
         public string LanguageName {get;set;}
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
         public int Sort {get;set;}
        /// <summary>
        /// 说明:例如 地址是默认语言  /a/b/c   suffix值为 en 那么地址就是 /a/b/c_en
        /// 默认:
        /// 可空:True
        ///</summary>
         public string Suffix {get;set;}
    }
} 