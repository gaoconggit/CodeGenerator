using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Best.Entities.Tables;

namespace Best.Entities.UiEngine
{
    #region 公共实体
    /// <summary>
    /// 事件MODEL
    /// </summary>
    public class EventModel
    {
        /// <summary>
        /// 事件类型ID,SysBest_ElementEvent里面的EventType
        /// </summary>
        public int Id { get; set; }
        /// <summary>
        /// 事件类型名称对应SysBest_ElementEvent表里面的ElementType表里面的Key
        /// </summary>
        public string Name { get; set; }

        public List<EventActionType> ActionTypeList { get; set; }

    }
    /// <summary>
    /// 事件动作
    /// </summary>
    public class EventActionType
    {
        /// <summary>
        /// 事件名称,对应SysBest_ElementEvent里面的Value
        /// </summary>
        public string key { get; set; }

        public int category { get; set; }

        /// <summary>
        /// 事件存储的值
        /// </summary>
        public string value { get; set; }

        public List<EventActionTypeParas> paras { get; set; }
    }
    /// <summary>
    /// 事件动作参数
    /// </summary>
    public class EventActionTypeParas
    {
        public string key { get; set; }

        public string value { get; set; }

        public bool required { get; set; }

        public string description { get; set; }

        public string category { get; set; }

        public string tip { get; set; }

        public string reg { get; set; }

        public string eventCode{ get;set; }
    }

    /// <summary>
    /// 数据接口下拉框类型
    /// </summary>
    public class DataApiTypeModel
    {
        public int tid { get; set; }
        public string key { get; set; }
        public string value { get; set; }
    }
    /// <summary>
    /// 元素包下拉框选项
    /// </summary>
    public class ElementStateModel
    {

        public int id { get; set; }
        public string name { get; set; }

        public bool selected { get; set; }
    }

    public class PubGetJs
    {
        public int id { get; set; }
        public string fileurl { get; set; }
    }
    #endregion

    #region 表单提交映射类
    /// <summary>
    /// 事件属性
    /// </summary>
    public class ElementAttr
    {
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
        public string Key { get; set; }
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
        public string Value { get; set; }
    }


    public class ElementEvent
    {
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
        public string Key { get; set; }
        /// <summary>
        /// 说明:
        /// 默认:
        /// 可空:False
        ///</summary>
        public string Value { get; set; }
        /// <summary>
        /// 说明:1、click 2、change 3、blur 4、dbclick 5、callBack 6、preinit
        /// 默认:
        /// 可空:True
        ///</summary>
        public string EventType { get; set; }

        public string Pars { get; set; }
    }


    #endregion

 
   

}
