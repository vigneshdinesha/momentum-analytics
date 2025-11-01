using MomentumAPI.Models.DTOs;

namespace MomentumAPI.Services
{
    /// <summary>
    /// Service interface for manual check-in CRUD operations
    /// </summary>
    public interface ICheckinService
    {
        /// <summary>
        /// Creates a new check-in (allows multiple per day)
        /// </summary>
        /// <param name="userId">ID of the user creating the check-in</param>
        /// <param name="request">Check-in data to create</param>
        /// <returns>The created check-in response</returns>
        Task<CheckinResponse> CreateCheckinAsync(int userId, CheckinRequest request);

        /// <summary>
        /// Creates a new check-in or updates existing one if date already exists for the user (UPSERT pattern)
        /// </summary>
        /// <param name="userId">ID of the user creating/updating the check-in</param>
        /// <param name="request">Check-in data to create or update</param>
        /// <returns>The created or updated check-in response</returns>
        Task<CheckinResponse> CreateOrUpdateCheckinAsync(int userId, CheckinRequest request);

        /// <summary>
        /// Retrieves a check-in for a specific user and date (returns the most recent one if multiple exist)
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in</param>
        /// <param name="date">Date of the check-in to retrieve</param>
        /// <returns>Check-in response if found, null otherwise</returns>
        Task<CheckinResponse?> GetCheckinByDateAsync(int userId, DateOnly date);

        /// <summary>
        /// Retrieves all check-ins for a specific user and date
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-ins</param>
        /// <param name="date">Date of the check-ins to retrieve</param>
        /// <returns>List of check-in responses for the specified date</returns>
        Task<List<CheckinResponse>> GetAllCheckinsByDateAsync(int userId, DateOnly date);

        /// <summary>
        /// Retrieves a check-in by its ID
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in (security check)</param>
        /// <param name="id">ID of the check-in to retrieve</param>
        /// <returns>Check-in response if found and user owns it, null otherwise</returns>
        Task<CheckinResponse?> GetCheckinByIdAsync(int userId, int id);

        /// <summary>
        /// Retrieves recent check-ins for a user within the specified number of days
        /// </summary>
        /// <param name="userId">ID of the user whose check-ins to retrieve</param>
        /// <param name="days">Number of days back to retrieve (default 7, max 90)</param>
        /// <returns>List of check-in responses ordered by date descending</returns>
        Task<List<CheckinResponse>> GetRecentCheckinsAsync(int userId, int days = 7);

        /// <summary>
        /// Updates an existing check-in with new data
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in (security check)</param>
        /// <param name="id">ID of the check-in to update</param>
        /// <param name="request">Updated check-in data</param>
        /// <returns>Updated check-in response if found and user owns it, null otherwise</returns>
        Task<CheckinResponse?> UpdateCheckinAsync(int userId, int id, CheckinRequest request);

        /// <summary>
        /// Deletes a check-in if it exists and the user owns it
        /// </summary>
        /// <param name="userId">ID of the user who owns the check-in (security check)</param>
        /// <param name="id">ID of the check-in to delete</param>
        /// <returns>True if successfully deleted, false if not found or user doesn't own it</returns>
        Task<bool> DeleteCheckinAsync(int userId, int id);
    }
}