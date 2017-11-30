using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EntryRegistration.Models.Entity
{
    public class ActionResultModel<T>
    {
        

        public bool isSuccess { get; set; }
        public T responseInfo { get; set; }
        public int totalRows { get; set; }
    }
}