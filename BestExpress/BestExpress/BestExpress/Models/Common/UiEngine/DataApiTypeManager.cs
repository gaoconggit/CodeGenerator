using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Best.Entities.UiEngine
{
    public class DataApiTypeManager
    {

        public static DataApiTypeManager GetInstance = new DataApiTypeManager();

        public DataApiTypeManager() { }


        /// <summary>
        /// API操作类型
        /// </summary>
        public List<DataApiTypeModel> GetDataActionApiType
        {
            get
            {
                return new List<DataApiTypeModel>
                {
                   new DataApiTypeModel { tid=0, key="Get",value="查询" },//不能改动顺序
                   new DataApiTypeModel { tid=1, key="Insert",value="添加" },
                   new DataApiTypeModel { tid=2, key="Edit",value="编辑" },
                   new DataApiTypeModel { tid=3, key="Delete",value="删除" },
                   new DataApiTypeModel { tid=4, key="FalseDelete",value="假删除" },
                   new DataApiTypeModel { tid=5, key="Dynamic",value="动态方法" },
                   new DataApiTypeModel { tid=6, key="EditStatus",value="编辑状态" },
                   new DataApiTypeModel { tid=10, key="Plugin",value="插件" }
                };
            }
        }

        public enum DataActionApiType
        {
            查询 = 0,
            添加 = 1,
            编辑 = 2,
            删除 = 3,
            假删除 = 4,
            动态方法 = 5,
            编辑状态=6,
            插件 = 10
        }
    }

}
