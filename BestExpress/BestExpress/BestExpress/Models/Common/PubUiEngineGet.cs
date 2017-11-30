
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Best.Entities.Tables;
using Best.Entities.Common;
using Best.Entities.UiEngine;

namespace Best.Site.Areas.BestPalace.Controllers
{
    /// <summary>
    /// UI引擎所有地址
    /// </summary>
    public class PubUiEngineGet
    {



        /// <summary>
        /// 获取UI引擎Controls目录
        /// </summary>
        public static string GetUiEngineControlsDir
        {
            get
            {
                return FileSugar.GetMapPath(GetUiEngineControlsWebDir);
            }
        }
        /// <summary>
        /// 获取UI引擎Controls web目录
        /// </summary>
        public static string GetUiEngineControlsWebDir
        {
            get
            {
                return FileSugar.MergeUrl(ConfigSugar.GetAppString("uiEngineDir"), "controls");
            }
        }




        /// <summary>
        /// 获取UI引擎目录
        /// </summary>
        public static string GetUiEngineDir
        {
            get
            {
                return FileSugar.GetMapPath(GetUiEngineWebDir);
            }
        }

        /// <summary>
        /// 获取UI引擎 web目录
        /// </summary>
        public static string GetUiEngineWebDir
        {
            get
            {
                return FileSugar.MergeUrl(ConfigSugar.GetAppString("uiEngineDir"));
            }
        }





        /// <summary>
        /// 获取UI引擎buildCode目录
        /// </summary>
        public static string GetUiEngineBuildCodeDir
        {
            get
            {
                return FileSugar.GetMapPath(GetUiEngineBuildCodeWebDir);
            }
        }
        /// <summary>
        /// 获取UI引擎buildCode event目录
        /// </summary>
        public static string GetUiEngineBuildCodePvControlEventDir
        {
            get
            {
                return FileSugar.MergeUrl(GetUiEngineBuildCodeDir, "pv_control_event.cshtml");
            }
        }
        /// <summary>
        /// 获取UI引擎buildCode attr 目录
        /// </summary>
        public static string GetUiEngineBuildCodePvControlAttrDir
        {
            get
            {
                return FileSugar.MergeUrl(GetUiEngineBuildCodeDir, "pv_control_attr.cshtml");
            }
        }
        /// <summary>
        /// 获取UI引擎buildCode web目录
        /// </summary>
        public static string GetUiEngineBuildCodeWebDir
        {
            get
            {
                return FileSugar.MergeUrl(ConfigSugar.GetAppString("uiEngineDir"), "buildCode");
            }
        }



        /// <summary>
        /// 获取UI引擎editor目录
        /// </summary>
        public static string GetUiEngineEditorDir
        {
            get
            {
                return FileSugar.GetMapPath(GetUiEngineEditorWebDir);
            }
        }
        /// <summary>
        /// 获取UI引擎editor web目录
        /// </summary>
        public static string GetUiEngineEditorWebDir
        {
            get
            {
                return FileSugar.MergeUrl(ConfigSugar.GetAppString("uiEngineDir"), "editor");
            }
        }



        /// <summary>
        /// 获取UI引擎eventAction目录
        /// </summary>
        public static string GetUiEngineEventActionDir
        {
            get
            {
                return FileSugar.GetMapPath(GetUiEngineEventActionWebDir);
            }
        }


        /// <summary>
        /// 获取UI引擎eventAction web目录
        /// </summary>
        public static string GetUiEngineEventActionWebDir
        {
            get
            {
                return FileSugar.MergeUrl(ConfigSugar.GetAppString("uiEngineDir"), "eventAction");
            }
        }

        /// <summary>
        /// 获取事件动作集合根据配置文件
        /// </summary>
        public static List<EventActionType> GetEventActionConfigList
        {
            get
            {
                var cshtml = FileSugar.MergeUrl(PubUiEngineGet.GetUiEngineEventActionDir, "config.json");
                var reval = FileSugar.FileToString(cshtml).JsonToModel<List<EventActionType>>();
                return reval;
            }
        }

        ///// <summary>
        ///// 获取元素选择状态
        ///// </summary>
        ///// <param name="elementId"></param>
        ///// <param name="addressId"></param>
        ///// <returns></returns>
        public static PubElementStatusType GetElementStatusType(int elementId, int addressId)
        {
            //var isDebugger = ConfigSugar.GetAppString(ConfigKeys.IsDebugger, string.Empty) == "true";
            //if (isDebugger) return PubElementStatusType.显示;
            //var rm = PubGet.GetCurrentRegularMember;
            //if (rm == null || rm.RoleId == null) return PubElementStatusType.隐藏;
            //using (SugarDao dao = new SugarDao())
            //{
            //    //SysBest_ElementPackageService sp = new SysBest_ElementPackageService(dao);
            //    //SysBest_V_ElementStatusService vss = new SysBest_V_ElementStatusService(dao);
            //    //var packList = sp.GetAllPackage();
            //    //var eleStatusList = vss.GetElementStatusByRoleId();
            //    //var isPack = packList.Any(it => it.AddressId == addressId);
            //    //if (isPack.IsFalse()) return PubElementStatusType.显示; //如果该页面没有元素包则不作控制
            //    //var myElementList = eleStatusList.Where(it => it.AddressId == addressId && it.RoleId == rm.RoleId && it.ElementId == elementId).ToList();
            //    //if (myElementList.IsValuable().IsFalse()) return PubElementStatusType.显示; //如果没有元素并且有包则表示没有该权限
            //    //var statusType = myElementList.OrderBy(
            //    //    it =>
            //    //    Convert.ToInt32(it.StatusType.ToString().Switch()
            //    //    //1、隐藏  2、显示 3、只读 
            //    //    .Case("3", "2") //如果同一元素存在多个元素记录 优先显示 状态为显示的
            //    //    .Case("2", "1")//隐藏优先级最低
            //    //    .Case("1", "3").Break())
            //    //    ).First(it => it.ElementId == elementId).StatusType;
            //    //vss = null;
            //    //sp = null;

            //}
            return PubElementStatusType.显示;
        }

        /// <summary>
        /// 获取元素信息
        /// </summary>
        /// <returns></returns>
        public static string GetElementStatusNetObj(string num,int addressId,int elementId) {
            string html = @"
<div class=""hide"">
 @{{
                      //元素过滤器
                      Best.Entities.Common.PubElementStatusType eleStatusType{0} = Best.Site.Areas.BestPalace.Controllers.PubUiEngineGet.GetElementStatusType({1},{2});
                      var isReadOnly{0} = eleStatusType{0} == Best.Entities.Common.PubElementStatusType.只读;
                      var isHide{0} = eleStatusType{0} == Best.Entities.Common.PubElementStatusType.隐藏;
                      var isShow{0}=isReadOnly{0}==false&&isHide{0}==false;
 }}
</div>
".ToFormat(num,elementId,addressId);
            return html;
        }
        /// <summary>
        /// 获取元素信息
        /// </summary>
        /// <returns></returns>
        public static string IIF(string name,string success,string error)
        {
            string html = @"@({0}?""{1}"":""{2}"")".ToFormat(name, success,error);
            return html;
        }
    }
}