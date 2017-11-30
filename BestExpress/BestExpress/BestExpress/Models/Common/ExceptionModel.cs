using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Best.Entities.Common
{

    public class ExceptionModel
    {
        public string Message { get; set; }
        public int Code { get; set; }
        public string InnerMessager { get; set; }
        public string StackTrace { get; set; }
        public string Source { get; set; }
        public string Time { get; set; }
        public bool IsDebugger { get; set; }
        public string AssemblyName { get; set; }
    }

    public class WebExceptionModel : ExceptionModel
    {

        public object UserName { get; set; }
        public object UserId { get; set; }
        public string Url { get; set; }
        public string Area { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public bool IsAjax { get; set; }
    }
}
