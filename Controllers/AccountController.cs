using CareerInn.Data;
using CareerInn.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace CareerInn.Controllers
{
    public class AccountController : Controller
    {
        private readonly AppDbContext _context;

        public AccountController(AppDbContext context)
        {
            _context = context;
        }
         
        // ── REGISTER GET ──
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        // ── REGISTER POST ──
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == model.Email);

            if (existingUser != null)
            {
                ModelState.AddModelError("Email", "Email is already registered");
                return View(model);
            }

            // Hash the password
            var user = new User
            {
                FullName = model.FullName,
                Email = model.Email,
                PasswordHash = HashPassword(model.Password),
                Role = model.Role,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Redirect to login after successful registration
            TempData["SuccessMessage"] = "Account created successfully! Please login.";
            if (user.Role == "Employer")
                return RedirectToAction("Dashboard", "Company");
            else
                return RedirectToAction("Index", "Dashboard");
        }

        // ── LOGIN GET ──
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        // ── LOGIN POST ──
        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || user.PasswordHash != HashPassword(model.Password))
            {
                ModelState.AddModelError("", "Invalid email or password");
                return View(model);
            }

            // Store user info in session
            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserName", user.FullName);
            HttpContext.Session.SetString("UserRole", user.Role);

            if (user.Role == "Employer")
                return RedirectToAction("Dashboard", "Company");
            else
                return RedirectToAction("Index", "Dashboard");
        }

        // ── LOGOUT ──
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }

        // ── PASSWORD HASHING ──
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}