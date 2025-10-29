using Microsoft.EntityFrameworkCore;
using MomentumAPI.Data;
using MomentumAPI.Models;
using MomentumAPI.Models.DTOs;

namespace MomentumAPI.Services
{
    /// <summary>
    /// Service for manual check-in CRUD operations with proper security and business logic
    /// </summary>
    public class CheckinService : ICheckinService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CheckinService> _logger;

        public CheckinService(ApplicationDbContext context, ILogger<CheckinService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new check-in or updates existing one if date already exists for the user (UPSERT pattern)
        /// </summary>
        /// <param name="userId">ID of the user creating/updating the check-in</param>
        /// <param name="request">Check-in data to create or update</param>
        /// <returns>The created or updated check-in response</returns>
        public async Task<CheckinResponse> CreateOrUpdateCheckinAsync(int userId, CheckinRequest request)
        {
            try
            {
                _logger.LogInformation("Creating or updating check-in for user {UserId} on date {Date}", userId, request.Date);

                // Check if check-in already exists for this user and date
                var existingCheckin = await _context.ManualCheckins
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.Date == request.Date);

                if (existingCheckin != null)
                {
                    // Update existing check-in
                    _logger.LogInformation("Updating existing check-in {CheckinId} for user {UserId}", existingCheckin.Id, userId);
                    
                    UpdateCheckinFromRequest(existingCheckin, request);
                    existingCheckin.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    return MapToResponse(existingCheckin);
                }
                else
                {
                    // Create new check-in
                    _logger.LogInformation("Creating new check-in for user {UserId} on date {Date}", userId, request.Date);
                    
                    var checkin = new ManualCheckin
                    {
                        UserId = userId,
                        Date = request.Date,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    UpdateCheckinFromRequest(checkin, request);

                    _context.ManualCheckins.Add(checkin);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Successfully created check-in {CheckinId} for user {UserId}", checkin.Id, userId);
                    return MapToResponse(checkin);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating or updating check-in for user {UserId} on date {Date}", userId, request.Date);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a check-in for a specific user and date
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in</param>
        /// <param name="date">Date of the check-in to retrieve</param>
        /// <returns>Check-in response if found, null otherwise</returns>
        public async Task<CheckinResponse?> GetCheckinByDateAsync(int userId, DateOnly date)
        {
            try
            {
                _logger.LogInformation("Retrieving check-in for user {UserId} on date {Date}", userId, date);

                var checkin = await _context.ManualCheckins
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.Date == date);

                if (checkin == null)
                {
                    _logger.LogInformation("No check-in found for user {UserId} on date {Date}", userId, date);
                    return null;
                }

                _logger.LogInformation("Found check-in {CheckinId} for user {UserId} on date {Date}", checkin.Id, userId, date);
                return MapToResponse(checkin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving check-in for user {UserId} on date {Date}", userId, date);
                throw;
            }
        }

        /// <summary>
        /// Retrieves recent check-ins for a user within the specified number of days
        /// </summary>
        /// <param name="userId">ID of the user whose check-ins to retrieve</param>
        /// <param name="days">Number of days back to retrieve (default 7, max 90)</param>
        /// <returns>List of check-in responses ordered by date descending</returns>
        public async Task<List<CheckinResponse>> GetRecentCheckinsAsync(int userId, int days = 7)
        {
            try
            {
                // Validate days parameter
                if (days < 1 || days > 90)
                {
                    throw new ArgumentException("Days parameter must be between 1 and 90", nameof(days));
                }

                _logger.LogInformation("Retrieving recent {Days} days of check-ins for user {UserId}", days, userId);

                var cutoffDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-days));

                var checkins = await _context.ManualCheckins
                    .AsNoTracking()
                    .Where(c => c.UserId == userId && c.Date >= cutoffDate)
                    .OrderByDescending(c => c.Date)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} check-ins for user {UserId} in the last {Days} days", checkins.Count, userId, days);

                return checkins.Select(MapToResponse).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent check-ins for user {UserId} (days: {Days})", userId, days);
                throw;
            }
        }

        /// <summary>
        /// Updates an existing check-in with new data
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in (security check)</param>
        /// <param name="id">ID of the check-in to update</param>
        /// <param name="request">Updated check-in data</param>
        /// <returns>Updated check-in response if found and user owns it, null otherwise</returns>
        public async Task<CheckinResponse?> UpdateCheckinAsync(int userId, int id, CheckinRequest request)
        {
            try
            {
                _logger.LogInformation("Updating check-in {CheckinId} for user {UserId}", id, userId);

                var checkin = await _context.ManualCheckins
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (checkin == null)
                {
                    _logger.LogWarning("Check-in {CheckinId} not found for user {UserId} or user doesn't own it", id, userId);
                    return null;
                }

                // Update the check-in with new data
                UpdateCheckinFromRequest(checkin, request);
                checkin.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully updated check-in {CheckinId} for user {UserId}", id, userId);
                return MapToResponse(checkin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating check-in {CheckinId} for user {UserId}", id, userId);
                throw;
            }
        }

        /// <summary>
        /// Deletes a check-in if it exists and the user owns it
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in (security check)</param>
        /// <param name="id">ID of the check-in to delete</param>
        /// <returns>True if successfully deleted, false if not found or user doesn't own it</returns>
        public async Task<bool> DeleteCheckinAsync(int userId, int id)
        {
            try
            {
                _logger.LogInformation("Attempting to delete check-in {CheckinId} for user {UserId}", id, userId);

                var checkin = await _context.ManualCheckins
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (checkin == null)
                {
                    _logger.LogWarning("Check-in {CheckinId} not found for user {UserId} or user doesn't own it", id, userId);
                    return false;
                }

                _context.ManualCheckins.Remove(checkin);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully deleted check-in {CheckinId} for user {UserId}", id, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting check-in {CheckinId} for user {UserId}", id, userId);
                throw;
            }
        }

        /// <summary>
        /// Updates a ManualCheckin entity with data from a CheckinRequest
        /// </summary>
        /// <param name="checkin">The check-in entity to update</param>
        /// <param name="request">The request data to update from</param>
        private static void UpdateCheckinFromRequest(ManualCheckin checkin, CheckinRequest request)
        {
            checkin.Date = request.Date;
            checkin.SleepHours = request.SleepHours;
            checkin.SleepQuality = request.SleepQuality;
            checkin.SleepNotes = request.SleepNotes;
            checkin.EnergyMorning = request.EnergyMorning;
            checkin.EnergyAfternoon = request.EnergyAfternoon;
            checkin.EnergyEvening = request.EnergyEvening;
            checkin.Mood = request.Mood;
            checkin.StressLevel = request.StressLevel;
            checkin.ExerciseType = request.ExerciseType;
            checkin.ExerciseDuration = request.ExerciseDuration;
            checkin.ExerciseIntensity = request.ExerciseIntensity;
            checkin.CaffeineMg = request.CaffeineMg;
            checkin.WaterGlasses = request.WaterGlasses;
            checkin.AteBreakfast = request.AteBreakfast;
            checkin.ScreenTimeBeforeBed = request.ScreenTimeBeforeBed;
            checkin.DeepWorkHours = request.DeepWorkHours;
            checkin.ProductivityRating = request.ProductivityRating;
            checkin.Notes = request.Notes;
        }

        /// <summary>
        /// Maps a ManualCheckin entity to a CheckinResponse DTO
        /// </summary>
        /// <param name="checkin">The check-in entity to map</param>
        /// <returns>Mapped CheckinResponse DTO</returns>
        private static CheckinResponse MapToResponse(ManualCheckin checkin)
        {
            return new CheckinResponse
            {
                Id = checkin.Id,
                UserId = checkin.UserId,
                Date = checkin.Date,
                SleepHours = checkin.SleepHours,
                SleepQuality = checkin.SleepQuality,
                SleepNotes = checkin.SleepNotes,
                EnergyMorning = checkin.EnergyMorning,
                EnergyAfternoon = checkin.EnergyAfternoon,
                EnergyEvening = checkin.EnergyEvening,
                Mood = checkin.Mood,
                StressLevel = checkin.StressLevel,
                ExerciseType = checkin.ExerciseType,
                ExerciseDuration = checkin.ExerciseDuration,
                ExerciseIntensity = checkin.ExerciseIntensity,
                CaffeineMg = checkin.CaffeineMg,
                WaterGlasses = checkin.WaterGlasses,
                AteBreakfast = checkin.AteBreakfast,
                ScreenTimeBeforeBed = checkin.ScreenTimeBeforeBed,
                DeepWorkHours = checkin.DeepWorkHours,
                ProductivityRating = checkin.ProductivityRating,
                Notes = checkin.Notes,
                CreatedAt = checkin.CreatedAt,
                UpdatedAt = checkin.UpdatedAt
            };
        }
    }
}