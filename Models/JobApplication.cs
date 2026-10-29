using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerInn.Models
{
    public class JobApplication
    {
        public int Id { get; set; }

        public int JobId { get; set; }

        public int UserId { get; set; }

        [MaxLength(3000)]
        public string? CoverLetter { get; set; }

        [MaxLength(500)]
        public string? ResumePath { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        public DateTime AppliedAt { get; set; } = DateTime.Now;

        [ForeignKey("JobId")]
        public Job Job { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}