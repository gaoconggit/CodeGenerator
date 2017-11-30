using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Best.Entities.Common
{
    public class GoChartModel
    {
        /// <summary>
        /// 键
        /// </summary>
        public string key { get; set; }
        /// <summary>
        /// 父节点ID
        /// </summary>
        public string parent { get; set; }
        /// <summary>
        /// 名称
        /// </summary>
        public string name { get; set; }
        /// <summary>
        /// 图片路径
        /// </summary>
        public string imgPath { get; set; }
        /// <summary>
        /// 预算
        /// </summary>
        public string ActualAccount { get; set; }
        /// <summary>
        /// 实际
        /// </summary>
        public string BudgetAccount { get; set; }
        /// <summary>
        /// 文本保留字段
        /// </summary>
        
        public Guid VGUID { get; set; }

        public int TreeID { get; set; }
    }
}
