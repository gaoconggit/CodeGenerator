using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using SyntacticSugar;
using Best.Infrastructure.DAL;
using Best.Entities.Tables;
using SqlSugar;
using Best.Entities.Common;
namespace BestExpress.Areas.First.Controllers
{
    public partial class HomeController : Controller
    {


    public ActionResult Index()
    {
    return View();
    }
  }
}