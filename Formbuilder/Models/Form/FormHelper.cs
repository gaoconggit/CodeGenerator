using Formbuilder.CommonMethod;
using Formbuilder.Ex;
using Newtonsoft.Json;
using RazorHelp;
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Formbuilder.Models.Form
{
    public class FormHelper
    {
        /// <summary>
        /// 开始生成表单
        /// </summary>
        public static void StartGenerateForm()
        {
            //1.解析配置
            string configPath = FileSugar.MergeUrl(System.Environment.CurrentDirectory, "generateFormConfig.json");
            //得到配置的json字符串
            string json = FileSugar.FileToString(configPath);
            List<GenerateFormConfig_Model> config = JsonConvert.DeserializeObject<List<GenerateFormConfig_Model>>(json);
            foreach (var item in config)
            {
                //根据配置生成表单
                generateForm(item);
            }
        }
        /// <summary>
        /// 根据配置生成对应的文件 表单生成
        /// </summary>
        /// <param name="config"></param>
        public static void generateForm(GenerateFormConfig_Model config)
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
