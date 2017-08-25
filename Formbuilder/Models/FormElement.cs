using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Formbuilder.Models
{
    public class FormElement
    {
        public string elementHtml { get; set; }

        public string labelForElementHtml { get; set; }

        public Column col { get; set; }
    }
}
