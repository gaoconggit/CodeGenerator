using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EntryRegistration.Models
{
    public class SqlServerService : IDBService<SqlSugarClient>
    {
        public SqlSugarClient _db;
        public SqlServerService()
        {
            string ConnectionString = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["ConnectionString"].ToString();
            _db = new SqlSugarClient(ConnectionString);//获SqlSugarClient对象
        }
        public SqlSugarClient GetDBInstance()
        {
            return _db;
        }
        public void Dispose()
        {
            if (_db != null)
            {
                _db.Dispose();
            }
        }


    }
}