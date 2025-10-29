using System.ComponentModel.DataAnnotations;

namespace MomentumAPI.Models.DTOs
{
    /// <summary>
    /// Data transfer object for creating or updating manual check-ins
    /// </summary>
    public class CheckinRequest
    {
        /// <summary>
        /// Date of the check-in (required, cannot be in the future)
        /// </summary>
        [Required(ErrorMessage = "Date is required")]
        [FutureDate(ErrorMessage = "Check-in date cannot be in the future")]
        public DateOnly Date { get; set; }

        /// <summary>
        /// Hours of sleep (0-24 hours)
        /// </summary>
        [Range(0, 24, ErrorMessage = "Sleep hours must be between 0 and 24")]
        public decimal? SleepHours { get; set; }

        /// <summary>
        /// Sleep quality rating (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Sleep quality must be between 1 and 10")]
        public int? SleepQuality { get; set; }

        /// <summary>
        /// Notes about sleep
        /// </summary>
        [StringLength(500, ErrorMessage = "Sleep notes cannot exceed 500 characters")]
        public string? SleepNotes { get; set; }

        /// <summary>
        /// Morning energy level (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Morning energy must be between 1 and 10")]
        public int? EnergyMorning { get; set; }

        /// <summary>
        /// Afternoon energy level (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Afternoon energy must be between 1 and 10")]
        public int? EnergyAfternoon { get; set; }

        /// <summary>
        /// Evening energy level (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Evening energy must be between 1 and 10")]
        public int? EnergyEvening { get; set; }

        /// <summary>
        /// Overall mood description
        /// </summary>
        [StringLength(50, ErrorMessage = "Mood description cannot exceed 50 characters")]
        public string? Mood { get; set; }

        /// <summary>
        /// Stress level (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Stress level must be between 1 and 10")]
        public int? StressLevel { get; set; }

        /// <summary>
        /// Type of exercise performed
        /// </summary>
        [StringLength(100, ErrorMessage = "Exercise type cannot exceed 100 characters")]
        public string? ExerciseType { get; set; }

        /// <summary>
        /// Duration of exercise in minutes
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Exercise duration must be non-negative")]
        public int? ExerciseDuration { get; set; }

        /// <summary>
        /// Exercise intensity level (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Exercise intensity must be between 1 and 10")]
        public int? ExerciseIntensity { get; set; }

        /// <summary>
        /// Caffeine intake in milligrams
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Caffeine intake must be non-negative")]
        public int? CaffeineMg { get; set; }

        /// <summary>
        /// Number of glasses of water consumed
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Water glasses must be non-negative")]
        public int? WaterGlasses { get; set; }

        /// <summary>
        /// Whether breakfast was consumed
        /// </summary>
        public bool? AteBreakfast { get; set; }

        /// <summary>
        /// Screen time before bed in minutes
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Screen time must be non-negative")]
        public int? ScreenTimeBeforeBed { get; set; }

        /// <summary>
        /// Hours spent in deep work/focus
        /// </summary>
        [Range(0, 24, ErrorMessage = "Deep work hours must be between 0 and 24")]
        public decimal? DeepWorkHours { get; set; }

        /// <summary>
        /// Productivity rating (1-10 scale)
        /// </summary>
        [Range(1, 10, ErrorMessage = "Productivity rating must be between 1 and 10")]
        public int? ProductivityRating { get; set; }

        /// <summary>
        /// Additional notes for the day
        /// </summary>
        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Custom validation attribute to ensure date is not in the future
    /// </summary>
    public class FutureDateAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null) return true; // Let Required handle null validation

            if (value is DateOnly date)
            {
                return date <= DateOnly.FromDateTime(DateTime.Today);
            }

            return false;
        }
    }
}