using Microsoft.AspNetCore.Mvc;

namespace CareerInn.Controllers
{
    public class AboutController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
