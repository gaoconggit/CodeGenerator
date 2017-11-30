using System;

namespace Best.Entities.Tables
{
    /// <summary>
    /// 自定义扩展树形菜单实体
    /// </summary>
    public class TreeViewModel
    {
        #region 构造函数

        public TreeViewModel()
        {

        }

        public TreeViewModel(string id, string parentId, Guid treeId, string menuName)
        {
            this.text = $"{id}\t{menuName}";//运用C#6.0特性
            this.value = treeId;
            this.id = id.Replace("/", "_");
            this.parentid = parentId.Replace("/", "_");
        }

        #endregion

        /// <summary>
        /// 级别ID
        ///</summary>
        public object id { get; set; }
        /// <summary>
        /// 菜单名
        ///</summary>
        public string text { get; set; }
        /// <summary>
        /// 父级编号
        ///</summary>
        public dynamic value { get; set; }
        /// <summary>
        /// 父级ID
        ///</summary>
        public object parentid { get; set; }

        public int level { get; set; }

        public string label { get; set; }

        public bool expanded { get; set; }

        public int treesort { get; set; }

        public string icon { get; set; }
    }
}
