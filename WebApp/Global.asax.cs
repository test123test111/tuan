using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Tuan
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode,
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "GroupListNew2",
                "{param1}/{param2}/{param3}",
                new { controller = "Tuan", action = "List", param3 = UrlParameter.Optional },
                new { param1 = @"([a-z]+_[a-z]*[0-9]*)$", param2 = @"([a-z]+_[0-9]*)$" }
            );
            //http://localhost:3000/html5/tuan/city_shanghai/inprice_400%7C600/item_1/
            /*
            routes.MapRoute(
                "GroupListNew3",
                "{param1}/{param2}/{param3}",
                new { controller = "Tuan", action = "List", param3 = UrlParameter.Optional },
                new { param1 = @"([a-z]+_[a-z]*[0-9]*)$", param2 = @"[a-z]+_[0-9]*\|[0-9]*" }
            );
            routes.MapRoute(
                "GroupListNew4",
                "{param1}/{param2}/{param3}/{param4}",
                new { controller = "Tuan", action = "List", param4 = UrlParameter.Optional },
                new { param1 = @"([a-z]+_[a-z]*[0-9]*)$", param2 = @"[a-z]+_[0-9]*\|[0-9]*", param3 = @"([a-z]+_[a-z]*[0-9]*)$" }
            );
            */
            routes.MapRoute(
                "GroupListNew4",
                "{param1}/{param2}/{param3}/{param4}",
                new { controller = "Tuan", action = "List", param4 = UrlParameter.Optional },
                new { param1 = @"([a-z]+_[a-z]*[0-9]*)$", param2 = @"([a-z]+_[a-z]*[0-9]*)$", param3 = @"([a-z]+_[a-z]*[0-9]*)$" }
            );

            routes.MapRoute(
                "GroupListNew5",
                "{param1}/{param2}/{param3}/{param4}/{param5}",
                new { controller = "Tuan", action = "List", param5 = UrlParameter.Optional },
                new { param1 = @"([a-z]+_[a-z]*[0-9]*)$", param2 = @"([a-z]+_[a-z]*[0-9]*)$", param3 = @"([a-z]+_[a-z]*[0-9]*)$", param4 = @"([a-z]+_[a-z]*[0-9]*)$" }
            );
            routes.MapRoute(
                "GroupListNew1",
                "{param1}/{param2}",
                new { controller = "Tuan", action = "List", param2 = UrlParameter.Optional },
                new { param1 = @"([a-z]+_[a-z]*[0-9]*)$"}
            );

            routes.MapRoute(
                "Detail",
                "{param}",
                new { controller = "Tuan", action = "Detail" },
                new { param = @"([0-9]*).html" }
            );

            routes.MapRoute(
                "Default", // Route name
                "{action}/{param1}", // URL with parameters
                new { controller = "Tuan", action = "Home", param1 = UrlParameter.Optional }
            );
        }

        protected void Application_Start()
        {
            ViewEngines.Engines.Insert(0, new CustomViewEngine());

            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
        }
    }
}
