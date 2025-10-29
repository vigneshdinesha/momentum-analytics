using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MomentumAPI.Models
{
    [Table("manual_checkins")]
    public class ManualCheckin
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("date")]
        public DateOnly Date { get; set; }

        // Sleep
        [Column("sleep_hours")]
        public decimal? SleepHours { get; set; }

        [Range(1, 10)]
        [Column("sleep_quality")]
        public int? SleepQuality { get; set; }

        [MaxLength(500)]
        [Column("sleep_notes")]
        public string? SleepNotes { get; set; }

        // Energy & Mood
        [Range(1, 10)]
        [Column("energy_morning")]
        public int? EnergyMorning { get; set; }

        [Range(1, 10)]
        [Column("energy_afternoon")]
        public int? EnergyAfternoon { get; set; }

        [Range(1, 10)]
        [Column("energy_evening")]
        public int? EnergyEvening { get; set; }

        [MaxLength(50)]
        [Column("mood")]
        public string? Mood { get; set; }

        [Range(1, 10)]
        [Column("stress_level")]
        public int? StressLevel { get; set; }

        // Physical
        [MaxLength(100)]
        [Column("exercise_type")]
        public string? ExerciseType { get; set; }

        [Column("exercise_duration")]
        public int? ExerciseDuration { get; set; }

        [Range(1, 10)]
        [Column("exercise_intensity")]
        public int? ExerciseIntensity { get; set; }

        // Habits
        [Column("caffeine_mg")]
        public int? CaffeineMg { get; set; }

        [Column("water_glasses")]
        public int? WaterGlasses { get; set; }

        [Column("ate_breakfast")]
        public bool? AteBreakfast { get; set; }

        [Column("screen_time_before_bed")]
        public int? ScreenTimeBeforeBed { get; set; }

        // Productivity
        [Column("deep_work_hours")]
        public decimal? DeepWorkHours { get; set; }

        [Range(1, 10)]
        [Column("productivity_rating")]
        public int? ProductivityRating { get; set; }

        [MaxLength(1000)]
        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User User { get; set; } = null!;
    }
}