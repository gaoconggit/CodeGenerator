using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BestExpress.Startup))]
namespace BestExpress
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
