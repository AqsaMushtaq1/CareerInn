using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CareerInn.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        [MaxLength(100)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "JobSeeker";

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Company? Company { get; set; }

        public ICollection<JobApplication> JobApplications { get; set; }
            = new List<JobApplication>();
    }
}