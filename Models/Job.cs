using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerInn.Models
{
    public class Job
    {
        public int Id { get; set; }

        public int CompanyId { get; set; }

        [Required(ErrorMessage = "Job title is required")]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required(ErrorMessage = "Job description is required")]
        public string Description { get; set; }

        public string? Requirements { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(50)]
        public string? JobType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Salary { get; set; }

        [MaxLength(50)]
        public string? ExperienceLevel { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? ApplicationDeadline { get; set; }

        public DateTime PostedAt { get; set; } = DateTime.Now;

        [ForeignKey("CompanyId")]
        public Company Company { get; set; }

        public ICollection<JobApplication> JobApplications { get; set; }
            = new List<JobApplication>();
    }
}
