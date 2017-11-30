using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Best.Entities.UiEngine
{
    public class ElementManager
    {

        public static ElementManager GetInstance = new ElementManager();
        public ElementManager()
        { }


        public List<ElementStateModel> GetElementTType
        {

            get
            {
                return new List<ElementStateModel>()
                {
                    new ElementStateModel () { id = 0,name= "请选择" },
                    new ElementStateModel () { id = 1,name= "隐藏" },
                    new ElementStateModel () { id = 2,name= "显示" },
                    new ElementStateModel () { id = 3,name= "只读" }
                };
            }
        }

        public List<PubGetJs> GetPubGet
        {
            get
            {
                return new List<PubGetJs>()
                {
                    new PubGetJs() { id=0, fileurl="/_theme/tool/angular.min.js" },
                    new PubGetJs() { id=1, fileurl="/_theme/free-wall/freewall.js" }
                };
            }
        }
        public class GetElementRegTip
        {


        }

        public string GetJqxAttrTipRegString(string category)
        {
            string reval = "";
            if (GetJqxAttrValidateRegDictionary.ContainsKey(category))
            {
                reval += (" reg=" + GetJqxAttrValidateRegDictionary[category] + " ");
            }
            if (GetJqxAttrValidateTipDictionary.ContainsKey(category))
            {
                reval += (" tip=" + GetJqxAttrValidateTipDictionary[category] + " ");
            }
            return reval;
        }

        public Dictionary<string, string> GetJqxAttrValidateRegDictionary
        {
            get
            {
                Dictionary<string, string> reval = new Dictionary<string, string>();
                reval.Add("Boolean", @"^true$|^false$|^.{0}$");
                reval.Add("Number", @"^\d*$|^-\d+$");
                reval.Add("Object", @"^\{.*?\}$|^.{0}$|^null$");
                reval.Add("Number/String", @"^\d*$|^\d+px$|^\d+\%$");
                return reval;
            }
        }
        public Dictionary<string, string> GetJqxAttrValidateTipDictionary
        {
            get
            {
                Dictionary<string, string> reval = new Dictionary<string, string>();
                reval.Add("Boolean", "只能输入true和false");
                reval.Add("Number", @"只输能入数字");
                reval.Add("Object", "格式: {id:1,name:\"张三\"}");
                reval.Add("Number/String", @"请填写数字,或者数字加px或%");
                return reval;
            }
        }
    }


}
