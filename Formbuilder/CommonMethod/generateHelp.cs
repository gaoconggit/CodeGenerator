using Formbuilder.enums;
using Formbuilder.Models;
using RazorHelp;
using SyntacticSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Formbuilder.CommonMethod
{
    public class generateHelp
    {

        public static string getParseString(string templatePath, object obj)
        {
            var tempCode = RazorEngineExtension.RazorPars(templatePath, FileSugar.FileToString(templatePath), obj);
            return tempCode;
        }
        #region 控件Element生成方法

        public FormElement generateText(Column col)
        {
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "text", "template.cshtml");
            return new FormElement()
            {
                elementHtml = generateHelp.getParseString(templatePath, col),
                col = col
            };
        }
        public FormElement generateTextArea(Column col)
        {
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "textarea", "template.cshtml");
            return new FormElement()
            {
                elementHtml = generateHelp.getParseString(templatePath, col),
                col = col
            };
        }
        public FormElement generateDate(Column col)
        {
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "date", "template.cshtml");
            return new FormElement()
            {
                elementHtml = generateHelp.getParseString(templatePath, col),
                col = col
            };
        }
        public FormElement generateCheckbox(Column col)
        {
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "checkbox", "template.cshtml");
            return new FormElement()
            {
                elementHtml = generateHelp.getParseString(templatePath, col),
                col = col
            };
        }
        public FormElement generateSelect(Column col)
        {
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "select", "template.cshtml");
            return new FormElement()
            {
                elementHtml = generateHelp.getParseString(templatePath, col),
                col = col
            };
        }
        public FormElement generateImg(Column col)
        {
            string templatePath = FileSugar.MergeUrl(globalProperty.templateDic, "formElement", "img", "template.cshtml");
            return new FormElement()
            {
                elementHtml = generateHelp.getParseString(templatePath, col),
                col = col
            };
        }

        #endregion

        public FormElement generate(Column col, Func<Column, FormElement> run)
        {
            return run(col);
        }
        public FormElement generateHtmlByType(Column col)
        {
            if (col.controlType == "文本框")
            {
                return generate(col, generateText);
            }
            if (col.controlType == "文本域")
            {
                return generate(col, generateTextArea);
            }
            if (col.controlType == "下拉框")
            {
                return generate(col, generateSelect);
            }
            if (col.controlType == "日期框")
            {
                return generate(col, generateDate);
            }
            if (col.controlType == "复选框")
            {
                return generate(col, generateCheckbox);
            }
            if (col.controlType == "图片控件")
            {
                return generate(col, generateImg);
            }
            return null;
        }
    }
}
