using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BestExpress.Controllers
{
    public class CodemirrorController : Controller
    {
        // GET: Codemirror
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult HtmlHintPage()
        {
            return View();
        }
    }
}