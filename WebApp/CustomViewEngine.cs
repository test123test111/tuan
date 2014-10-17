using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Tuan
{
    public class CustomViewEngine : RazorViewEngine
    {
        /// <summary>
        /// debug模式搜索Views路径
        /// </summary>
        private string[] debugSearchLocations = new string[]
        {
            "~/Views/{1}/{0}.cshtml",
            "~/Views/Shared/{0}.cshtml"
        };

        /// <summary>
        /// release模式搜索Views路径
        /// </summary>
        private string[] releaseSearchLocations = new string[]
        {
            "~/dest/Views/{1}/{0}.cshtml",
            "~/dest/Views/Shared/{0}.cshtml"
        };

        public override ViewEngineResult FindView(ControllerContext controllerContext, string viewName, string masterName, bool useCache)
        {
            this.ViewLocationFormats = releaseSearchLocations;
            if (controllerContext.HttpContext.Request.QueryString["debug"] == "1")
            {
                this.ViewLocationFormats = debugSearchLocations;
            }
            //this.ViewLocationFormats = debugSearchLocations;
#if DEBUG
            this.ViewLocationFormats = debugSearchLocations;
#endif
            this.PartialViewLocationFormats = this.ViewLocationFormats;
            return base.FindView(controllerContext, viewName, masterName, useCache);
        }
    }
}