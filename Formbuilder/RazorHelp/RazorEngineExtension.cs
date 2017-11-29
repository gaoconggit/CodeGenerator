using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SyntacticSugar;
using RazorEngine;
using RazorEngine.Templating;
namespace RazorHelp
{
    public static class RazorEngineExtension
    {
        public static string RazorPars(string buildTemplatePath, string content, object model)
        {
            string finallyThisIsMyParsedTemplate;
            PreCompile(buildTemplatePath, content);
            finallyThisIsMyParsedTemplate = Engine.Razor.Run(buildTemplatePath, null, model);
            return HttpUtility.HtmlDecode(finallyThisIsMyParsedTemplate);
        
        }

        /// <summary>
        /// 预编译cshtml文件
        /// </summary>
        /// <param name="buildTemplatePath"></param>
        /// <param name="content"></param>
        public static void PreCompile(string buildTemplatePath, string content)
        {
            var isCache = Engine.Razor.IsTemplateCached(buildTemplatePath, null);
            if (isCache.IsFalse())
            {
                Engine.Razor.AddTemplate(buildTemplatePath, content);
                Engine.Razor.Compile(buildTemplatePath, null);
            }
        }


    }
}