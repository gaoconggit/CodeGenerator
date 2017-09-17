using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Formbuilder.Models
{
    public class GenerateFormConfig_Model
    {
        public int columnsInRowNumber { get; set; }
        public string tableName { get; set; }
        public Column[] columns { get; set; }
    }

    public class Column
    {
        /// <summary>
        /// 字段名 数据库对应列名
        /// </summary>
        public string columnName { get; set; }
        /// <summary>
        /// 字段显示的名称 如：字段名对应的中文
        /// </summary>
        public string columnText { get; set; }
        /// <summary>
        /// 控件类型
        /// </summary>
        public string controlType { get; set; }
    }
}
