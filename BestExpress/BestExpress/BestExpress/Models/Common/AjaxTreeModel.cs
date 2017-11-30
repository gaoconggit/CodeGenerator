using Best.Entities.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Best.Entities.Common
{


    public class AjaxTreeModel : TreeViewModel
    {

        public AjaxTreeModel()
        {

        }

        public List<AjaxTreeModel> items { get; set; }
    }
}
