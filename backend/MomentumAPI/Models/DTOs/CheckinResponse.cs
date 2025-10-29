namespace MomentumAPI.Models.DTOs
{
    /// <summary>
    /// Data transfer object for returning manual check-in information
    /// </summary>
    public class CheckinResponse
    {
        /// <summary>
        /// Unique identifier for the check-in
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID of the user who owns this check-in
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Date of the check-in
        /// </summary>
        public DateOnly Date { get; set; }

        /// <summary>
        /// Hours of sleep (0-24 hours)
        /// </summary>
        public decimal? SleepHours { get; set; }

        /// <summary>
        /// Sleep quality rating (1-10 scale)
        /// </summary>
        public int? SleepQuality { get; set; }

        /// <summary>
        /// Notes about sleep
        /// </summary>
        public string? SleepNotes { get; set; }

        /// <summary>
        /// Morning energy level (1-10 scale)
        /// </summary>
        public int? EnergyMorning { get; set; }

        /// <summary>
        /// Afternoon energy level (1-10 scale)
        /// </summary>
        public int? EnergyAfternoon { get; set; }

        /// <summary>
        /// Evening energy level (1-10 scale)
        /// </summary>
        public int? EnergyEvening { get; set; }

        /// <summary>
        /// Overall mood description
        /// </summary>
        public string? Mood { get; set; }

        /// <summary>
        /// Stress level (1-10 scale)
        /// </summary>
        public int? StressLevel { get; set; }

        /// <summary>
        /// Type of exercise performed
        /// </summary>
        public string? ExerciseType { get; set; }

        /// <summary>
        /// Duration of exercise in minutes
        /// </summary>
        public int? ExerciseDuration { get; set; }

        /// <summary>
        /// Exercise intensity level (1-10 scale)
        /// </summary>
        public int? ExerciseIntensity { get; set; }

        /// <summary>
        /// Caffeine intake in milligrams
        /// </summary>
        public int? CaffeineMg { get; set; }

        /// <summary>
        /// Number of glasses of water consumed
        /// </summary>
        public int? WaterGlasses { get; set; }

        /// <summary>
        /// Whether breakfast was consumed
        /// </summary>
        public bool? AteBreakfast { get; set; }

        /// <summary>
        /// Screen time before bed in minutes
        /// </summary>
        public int? ScreenTimeBeforeBed { get; set; }

        /// <summary>
        /// Hours spent in deep work/focus
        /// </summary>
        public decimal? DeepWorkHours { get; set; }

        /// <summary>
        /// Productivity rating (1-10 scale)
        /// </summary>
        public int? ProductivityRating { get; set; }

        /// <summary>
        /// Additional notes for the day
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// When this check-in was first created (UTC)
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this check-in was last updated (UTC)
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
}