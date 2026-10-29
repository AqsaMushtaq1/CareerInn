using Microsoft.AspNetCore.Mvc;

namespace CareerInn.Controllers
{
    public class ContactController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
