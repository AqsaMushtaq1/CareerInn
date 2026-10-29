using CareerInn.Data;
using CareerInn.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerInn.Controllers
{
    public class DashboardController : Controller
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            var userRole = HttpContext.Session.GetString("UserRole");
            var userName = HttpContext.Session.GetString("UserName");

            ViewBag.UserName = userName;
            ViewBag.UserRole = userRole;

            if (userRole == "Admin")
            {
                ViewBag.TotalUsers = await _context.Users.CountAsync();
                ViewBag.TotalJobs = await _context.Jobs.CountAsync();
                ViewBag.TotalApplications = await _context.JobApplications.CountAsync();
                ViewBag.TotalCompanies = await _context.Companies.CountAsync();

                var allApplications = await _context.JobApplications
                    .Include(a => a.Job)
                    .ThenInclude(j => j.Company)
                    .Include(a => a.User)
                    .OrderByDescending(a => a.AppliedAt)
                    .Take(10)
                    .ToListAsync();

                ViewBag.RecentApplications = allApplications;

                var allUsers = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .ToListAsync();

                ViewBag.AllUsers = allUsers;

                return View("Admin");
            }
            else
            {
                // JobSeeker — their applications
                var myApplications = await _context.JobApplications
                    .Include(a => a.Job)
                    .ThenInclude(j => j.Company)
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.AppliedAt)
                    .ToListAsync();

                ViewBag.MyApplications = myApplications;
                ViewBag.TotalApplications = myApplications.Count;
                ViewBag.PendingApplications = myApplications.Count(a => a.Status == "Pending");
                ViewBag.AcceptedApplications = myApplications.Count(a => a.Status == "Accepted");
                // Get latest resume from applications
                var latestResume = myApplications
                    .Where(a => a.ResumePath != null)
                    .OrderByDescending(a => a.AppliedAt)
                    .FirstOrDefault();

                ViewBag.LatestResume = latestResume?.ResumePath;
                ViewBag.LatestResumeDate = latestResume?.AppliedAt.ToString("MMM dd, yyyy");
                // This week stats
                var weekStart = DateTime.Now.AddDays(-7);
                ViewBag.WeeklyApplications = myApplications
                    .Count(a => a.AppliedAt >= weekStart);
            }

            return View();
        }
    }
}