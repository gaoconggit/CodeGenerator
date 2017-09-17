using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Formbuilder.Models.Crud
{
    public class CrudModel
    {
        //页面名称、表格名称、需显示字段Code、字段翻译、字段控件类型
        /// <summary>
        /// 页面名称
        /// </summary>
        public string pageName { get; set; }

        /// <summary>
        /// 表名
        /// </summary>
        public string tableName { get; set; }

        /// <summary>
        /// 字段列表
        /// </summary>
        public List<Column> columns { get; set; }
    }
}
