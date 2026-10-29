using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerInn.Models
{
    public class Company
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required(ErrorMessage = "Company name is required")]
        [MaxLength(150)]
        public string Name { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(300)]
        [Url]
        public string? Website { get; set; }

        [MaxLength(500)]
        public string? LogoPath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}