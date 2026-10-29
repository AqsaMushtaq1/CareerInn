using CareerInn.Data;
using CareerInn.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerInn.Controllers
{
    public class JobsController : Controller
    {
        private readonly AppDbContext _context;

        public JobsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /Jobs
        public async Task<IActionResult> Index(string? search, string? location, string? jobType, string? experience)
        {
            var query = _context.Jobs
                .Include(j => j.Company)
                .Where(j => j.IsActive == true)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(j => j.Title.Contains(search) || j.Description.Contains(search) || j.Company.Name.Contains(search));

            if (!string.IsNullOrEmpty(location))
                query = query.Where(j => j.Location.Contains(location));

            if (!string.IsNullOrEmpty(jobType))
                query = query.Where(j => j.JobType == jobType);

            if (!string.IsNullOrEmpty(experience))
                query = query.Where(j => j.ExperienceLevel == experience);

            var jobs = await query
                .OrderByDescending(j => j.PostedAt)
                .ToListAsync();

            ViewBag.Search = search;
            ViewBag.Location = location;
            ViewBag.JobType = jobType;
            ViewBag.Experience = experience;
            ViewBag.TotalJobs = jobs.Count;

            return View(jobs);
        }

        // GET: /Jobs/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var job = await _context.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound();

            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId != null)
            {
                ViewBag.AlreadyApplied = await _context.JobApplications
                    .AnyAsync(a => a.JobId == id && a.UserId == userId);
            }

            return View(job);
        }

        // GET: /Jobs/Apply/5
        [HttpGet]
        public async Task<IActionResult> Apply(int id)
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            var job = await _context.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound();

            // Check if already applied
            var alreadyApplied = await _context.JobApplications
                .AnyAsync(a => a.JobId == id && a.UserId == userId);

            if (alreadyApplied)
            {
                TempData["ErrorMessage"] = "You have already applied for this job.";
                return RedirectToAction("Details", new { id });
            }

            return View(job);
        }

        // POST: /Jobs/Apply/5
        [HttpPost]
        public async Task<IActionResult> Apply(int id, string? coverLetter, IFormFile? resumeFile)
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return RedirectToAction("Login", "Account");

            // Check if already applied
            var alreadyApplied = await _context.JobApplications
                .AnyAsync(a => a.JobId == id && a.UserId == userId);

            if (alreadyApplied)
            {
                TempData["ErrorMessage"] = "You have already applied for this job.";
                return RedirectToAction("Details", new { id });
            }

            // Handle resume file upload
            string? resumePath = null;
            if (resumeFile != null && resumeFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resumes");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{userId}_{DateTime.Now.Ticks}_{resumeFile.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await resumeFile.CopyToAsync(stream);

                resumePath = $"/resumes/{fileName}";
            }

            // Save application
            var application = new JobApplication
            {
                JobId = id,
                UserId = userId.Value,
                CoverLetter = coverLetter,
                ResumePath = resumePath,
                Status = "Pending",
                AppliedAt = DateTime.Now
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Application submitted successfully!";
            return RedirectToAction("Index", "Dashboard");
        }
    }
}