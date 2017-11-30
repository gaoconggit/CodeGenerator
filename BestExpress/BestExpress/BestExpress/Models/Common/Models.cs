using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Best.Entities.Tables;


namespace Best.Site.Areas.BestPalace.Controllers
{
    #region ui引擎配置文件映射类
    /// <summary>
    /// HTML控件配置类
    /// </summary>
    public class ControlConfig
    {
        public string name { get; set; }
        public int? sort { get; set; }
        public bool? hasSource { get; set; }
    }
    /// <summary>
    /// 控件分类
    /// </summary>
    public class ControlType
    {
        public string key { get; set; }
        public string icon { get; set; }
        public ControlConfig controlConfig { get; set; }
        public List<ControlItem> items { get; set; }
    }
    /// <summary>
    /// 控件
    /// </summary>
    public class ControlItem
    {
        public string key { get; set; }
        public string icon { get; set; }
        public ControlConfig controlConfig { get; set; }
    }

    #endregion

    /// <summary>
    /// 预览页面viewModel
    /// </summary>
    public class PreviewModel
    {
        /// <summary>
        /// 母版页地址
        /// </summary>
        public string Layout { get; set; }
        /// <summary>
        /// body里的HTML
        /// </summary>
        public string Html { get; set; }

        public int AddressId { get; set; }

        public int LanguageId { get; set; }

        public string JsSrc { get; set; }
        public string CssHref { get; set; }
    }

    /// <summary>
    /// 生成控件的viewModel
    /// </summary>
    public class BuildModel
    {
        public Dictionary<string, string> attrList { get; set; }
        public Dictionary<string, string> eventList { get; set; }
        public string api { get; set; }
        public int addressId { get; set; }
        public int elementId { get; set; }
    }
    /// <summary>
    /// controller.cshtml所需要的viewModel
    /// </summary>
    public class BuildControllerModel
    {
        public string actionName { get; set; }
        public List<SysBest_DataApi> apiList { get; set; }
        public string areaName { get; set; }
        public string controllerName { get; set; }
        public string siteName { get; set; }
    }
    /// <summary>
    /// 事件表单ViewModel
    /// </summary>
    //public class EventViewModelResult
    //{
    //    public List<EventModel> Key { get; set; }
    //    public List<SysBest_ElementEvent> Value { get; set; }
    //}

    public class GridColumnsModel
    {
        /// <summary>
        /// 列名
        /// </summary>
        public string columnName { get; set; }
        /// <summary>
        /// 属性key
        /// </summary>
        public string attrKey { get; set; }
        /// <summary>
        /// 属性value
        /// </summary>
        public string attrValue { get; set; }
        /// <summary>
        /// 值的类型
        /// </summary>
        public string valueType { get; set; }
    }
}