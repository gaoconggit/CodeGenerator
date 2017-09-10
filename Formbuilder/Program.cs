using Formbuilder.CommonMethod;
using Formbuilder.Ex;
using Formbuilder.Models;
using Newtonsoft.Json;
using RazorHelp;
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Formbuilder
{
    class Program
    {

        static void Main(string[] args)
        {

            //1.解析配置
            string configPath = FileSugar.MergeUrl(System.Environment.CurrentDirectory, "generateConfig.json");
            string code = FileSugar.FileToString(configPath);
            List<generateConfig_Model> config = JsonConvert.DeserializeObject<List<generateConfig_Model>>(code);
            foreach (var item in config)
            {
                generate(item);
            }
        }

        public static void generate(generateConfig_Model config)
        {
            //2.获取html
            //2.1根据配置拆分
            var list_afterChunk = config.columns.Chunk(config.columnsInRowNumber);
            //2.2声明行数据容器
            List<List<FormElement>> list = new List<List<FormElement>>();
            foreach (var info in list_afterChunk)
            {
                List<FormElement> row_temp = new List<FormElement>();
                //遍历当前行
                foreach (var item_info in info)
                {
                    row_temp.Add(new generateHelp().generateHtmlByType(item_info));//取列
                }
                //生成行html
                list.Add(row_temp);
            }
            //3.渲染razor模板
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "form.cshtml");
            var tempCode = RazorEngineExtension.RazorPars(templatePath, FileSugar.FileToString(templatePath), new { FormElementTable = list });
            //4.将生成的form字符串写入html文件
            FileSugar.WriteFile($"../../html/{config.tableName}.html", tempCode);
        }
    }
}
