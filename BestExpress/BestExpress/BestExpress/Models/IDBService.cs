using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EntryRegistration.Models
{
    public interface IDBService<T> : IDisposable
    {
        T GetDBInstance();
    }
}
