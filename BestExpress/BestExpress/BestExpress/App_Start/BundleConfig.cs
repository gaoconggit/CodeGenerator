using System.Web;
using System.Web.Optimization;

namespace BestExpress
{
    public class BundleConfig
    {
        // 有关绑定的详细信息，请访问 http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            //通用JS
            bundles.Add(new ScriptBundle("~/min/js").Include(
                    "~/_theme/tool/jquery-1.11.1.js",
                    "~/_theme/tool/ejq.js",
                    "~/_theme/tool/jquery-form.min.js",
                    "~/_theme/jqwidgets-ver3.8.1/jqwidgets/jqx-all.js",
                    "~/_theme/jqwidgets-ver3.8.1/jqwidgets/globalization/globalize.js",
                    "~/_theme/jqwidgets-ver3.8.1/jqwidgets/globalization/globalize.culture.zh.js",
                    "~/_theme/jqwidgets-ver3.8.1/jqwidgetsExtensions/jqxext.js",
                    "~/_theme/uinew/sweetalert/js/sweet-alert.min.js"

                    ));


            //通用CSS
            bundles.Add(new StyleBundle("~/min/css")
                .Include("~/_theme/jqwidgets-ver3.8.1/jqwidgets/styles/jqx.base.css", new CssRewriteUrlTransform())
                .Include("~/_theme/jqwidgets-ver3.8.1/jqwidgets/styles/jqx.energyblue.css", new CssRewriteUrlTransform())
                .Include("~/_theme/jqwidgets-ver3.8.1/jqwidgetsExtensions/jqxext.css", new CssRewriteUrlTransform())
                .Include("~/_theme/font/css/font-awesome.css", new CssRewriteUrlTransform())
                .Include("~/_theme/font/css/animate.css", new CssRewriteUrlTransform())
                .Include("~/_theme/uinew/sweetalert/css/sweet-alert.css", new CssRewriteUrlTransform())
                );

        }
    }
}
