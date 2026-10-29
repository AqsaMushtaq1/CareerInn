using CareerInn.Data;
using CareerInn.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerInn.Controllers
{
    public class CompanyController : Controller
    {
        private readonly AppDbContext _context;

        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /Company/Register
        [HttpGet]
        public IActionResult Register()
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            // Check if user already has a company
            var existing = _context.Companies
                .FirstOrDefault(c => c.UserId == userId);

            if (existing != null)
                return RedirectToAction("Dashboard");

            return View();
        }

        // POST: /Company/Register
        [HttpPost]
        public async Task<IActionResult> Register(Company model, IFormFile? logoFile)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            if (!ModelState.IsValid)
                return View(model);

            // Handle logo upload
            string? logoPath = null;
            if (logoFile != null && logoFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "logos");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{userId}_{DateTime.Now.Ticks}_{logoFile.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await logoFile.CopyToAsync(stream);

                logoPath = $"/logos/{fileName}";
            }

            var company = new Company
            {
                UserId = userId.Value,
                Name = model.Name,
                Description = model.Description,
                Location = model.Location,
                Website = model.Website,
                LogoPath = logoPath,
                CreatedAt = DateTime.Now
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Update user role to Employer
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.Role = "Employer";
                await _context.SaveChangesAsync();
                HttpContext.Session.SetString("UserRole", "Employer");
            }

            TempData["SuccessMessage"] = "Company registered successfully!";
            return RedirectToAction("Dashboard");
        }

        // GET: /Company/Dashboard
        public async Task<IActionResult> Dashboard()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            var company = await _context.Companies
                .Include(c => c.Jobs)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return RedirectToAction("Register");

            ViewBag.Company = company;
            ViewBag.TotalJobs = company.Jobs.Count;
            ViewBag.ActiveJobs = company.Jobs.Count(j => j.IsActive);

            // Total applications for this company
            ViewBag.TotalApplications = await _context.JobApplications
                .Where(a => a.Job.CompanyId == company.Id)
                .CountAsync();

            return View(company);
        }

        // GET: /Company/PostJob
        [HttpGet]
        public IActionResult PostJob()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            return View();
        }
        [HttpPost]
        public async Task<IActionResult> PostJob(Job model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return RedirectToAction("Register");

            ModelState.Remove("Company");
            ModelState.Remove("JobApplications");

            if (!ModelState.IsValid)
                return View(model);

            model.CompanyId = company.Id;
            model.PostedAt = DateTime.Now;
            model.IsActive = true;

            _context.Jobs.Add(model);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Job posted successfully!";
            return RedirectToAction("Dashboard");
        }
        // GET: /Company/Applications
        public async Task<IActionResult> Applications()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return RedirectToAction("Register");

            var applications = await _context.JobApplications
                .Include(a => a.Job)
                .Include(a => a.User)
                .Where(a => a.Job.CompanyId == company.Id)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            ViewBag.CompanyName = company.Name;
            ViewBag.TotalApplications = applications.Count;
            ViewBag.PendingApplications = applications.Count(a => a.Status == "Pending");
            ViewBag.AcceptedApplications = applications.Count(a => a.Status == "Accepted");
            ViewBag.RejectedApplications = applications.Count(a => a.Status == "Rejected");

            return View(applications);
        }

        // POST: /Company/UpdateStatus
        [HttpPost]
        public async Task<IActionResult> UpdateStatus(int applicationId, string status)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            var application = await _context.JobApplications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                return NotFound();

            application.Status = status;
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = $"Application status updated to {status}";
            return RedirectToAction("Applications");
        }
    }
}