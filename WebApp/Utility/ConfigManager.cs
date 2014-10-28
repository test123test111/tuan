using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

namespace Tuan
{
    public static class ConfigManager
    {
        /// <summary>
        /// 返回资源文件路径
        /// </summary>
        /// <param name="resourcePath"></param>
        /// <returns></returns>
        public static string IncludeStaticFile(string resourcePath)
        {
            string rootPath = ConfigurationManager.AppSettings["WebresourcePDBaseUrl"];
            string debugRootPath = ConfigurationManager.AppSettings["WebresourcePDDebugUrl"];
            string debugModel = System.Web.HttpContext.Current.Request.QueryString["debug"];
            if (debugModel == "1")
            {
                return String.Format("{0}/{1}", debugRootPath, resourcePath/*, DateTime.Now.Ticks*/);
            }
#if DEBUG
            return String.Format("{0}/{1}", debugRootPath, resourcePath/*, DateTime.Now.Ticks*/);
#else
            return String.Format("{0}/{1}", rootPath, resourcePath/*, DateTime.Now.Ticks*/);
#endif
            //return String.Format("{0}/{1}", debugRootPath, resourcePath/*, DateTime.Now.Ticks*/);
        }
    }
}