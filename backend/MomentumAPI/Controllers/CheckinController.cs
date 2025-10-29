using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MomentumAPI.Models.DTOs;
using MomentumAPI.Services;
using System.Security.Claims;

namespace MomentumAPI.Controllers
{
    /// <summary>
    /// Controller for managing daily manual check-ins
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class CheckinController : ControllerBase
    {
        private readonly ICheckinService _checkinService;
        private readonly ILogger<CheckinController> _logger;

        public CheckinController(ICheckinService checkinService, ILogger<CheckinController> logger)
        {
            _checkinService = checkinService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new daily check-in or update existing one for the same date
        /// </summary>
        /// <param name="request">Check-in data including sleep, energy, mood, exercise, and productivity metrics</param>
        /// <returns>Created or updated check-in with ID and timestamps</returns>
        /// <response code="200">Check-in updated successfully</response>
        /// <response code="201">Check-in created successfully</response>
        /// <response code="400">Invalid request data or validation errors</response>
        /// <response code="401">Unauthorized - invalid or missing JWT token</response>
        /// <response code="500">Internal server error</response>
        [HttpPost]
        [ProducesResponseType(typeof(CheckinResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CheckinResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CheckinResponse>> CreateCheckin([FromBody] CheckinRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid check-in request received from user");
                    return BadRequest(ModelState);
                }

                var userId = GetUserIdFromClaims();
                _logger.LogInformation("Creating check-in for user {UserId} on date {Date}", userId, request.Date);

                // Check if check-in already exists for this date
                var existingCheckin = await _checkinService.GetCheckinByDateAsync(userId, request.Date);
                var response = await _checkinService.CreateOrUpdateCheckinAsync(userId, request);

                if (existingCheckin != null)
                {
                    _logger.LogInformation("Updated existing check-in {CheckinId} for user {UserId}", response.Id, userId);
                    return Ok(response);
                }
                else
                {
                    _logger.LogInformation("Created new check-in {CheckinId} for user {UserId}", response.Id, userId);
                    return CreatedAtAction(nameof(GetCheckinByDate), new { date = request.Date.ToString("yyyy-MM-dd") }, response);
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument in check-in creation request");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating check-in");
                return StatusCode(500, new { message = "An error occurred while creating the check-in" });
            }
        }

        /// <summary>
        /// Get check-in for a specific date
        /// </summary>
        /// <param name="date">Date in YYYY-MM-DD format</param>
        /// <returns>Check-in data for the specified date</returns>
        /// <response code="200">Check-in found and returned</response>
        /// <response code="400">Invalid date format</response>
        /// <response code="401">Unauthorized - invalid or missing JWT token</response>
        /// <response code="404">No check-in found for the specified date</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("{date}")]
        [ProducesResponseType(typeof(CheckinResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CheckinResponse>> GetCheckinByDate(string date)
        {
            try
            {
                if (!DateOnly.TryParse(date, out DateOnly parsedDate))
                {
                    _logger.LogWarning("Invalid date format provided: {Date}", date);
                    return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD format." });
                }

                var userId = GetUserIdFromClaims();
                _logger.LogInformation("Retrieving check-in for user {UserId} on date {Date}", userId, parsedDate);

                var checkin = await _checkinService.GetCheckinByDateAsync(userId, parsedDate);

                if (checkin == null)
                {
                    _logger.LogInformation("No check-in found for user {UserId} on date {Date}", userId, parsedDate);
                    return NotFound(new { message = $"No check-in found for date {date}" });
                }

                return Ok(checkin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving check-in for date {Date}", date);
                return StatusCode(500, new { message = "An error occurred while retrieving the check-in" });
            }
        }

        /// <summary>
        /// Get recent check-ins for the authenticated user
        /// </summary>
        /// <param name="days">Number of days to look back (default 7, max 90)</param>
        /// <returns>List of recent check-ins ordered by date descending</returns>
        /// <response code="200">Recent check-ins returned (may be empty list)</response>
        /// <response code="400">Invalid days parameter</response>
        /// <response code="401">Unauthorized - invalid or missing JWT token</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("recent")]
        [ProducesResponseType(typeof(List<CheckinResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<CheckinResponse>>> GetRecentCheckins([FromQuery] int days = 7)
        {
            try
            {
                if (days < 1 || days > 90)
                {
                    _logger.LogWarning("Invalid days parameter: {Days}", days);
                    return BadRequest(new { message = "Days parameter must be between 1 and 90" });
                }

                var userId = GetUserIdFromClaims();
                _logger.LogInformation("Retrieving recent {Days} days of check-ins for user {UserId}", days, userId);

                var checkins = await _checkinService.GetRecentCheckinsAsync(userId, days);

                _logger.LogInformation("Retrieved {Count} recent check-ins for user {UserId}", checkins.Count, userId);
                return Ok(checkins);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument in recent check-ins request");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent check-ins");
                return StatusCode(500, new { message = "An error occurred while retrieving recent check-ins" });
            }
        }

        /// <summary>
        /// Update an existing check-in
        /// </summary>
        /// <param name="id">ID of the check-in to update</param>
        /// <param name="request">Updated check-in data</param>
        /// <returns>Updated check-in data</returns>
        /// <response code="200">Check-in updated successfully</response>
        /// <response code="400">Invalid request data or validation errors</response>
        /// <response code="401">Unauthorized - invalid or missing JWT token</response>
        /// <response code="404">Check-in not found or user doesn't own it</response>
        /// <response code="500">Internal server error</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(CheckinResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CheckinResponse>> UpdateCheckin(int id, [FromBody] CheckinRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid check-in update request received for check-in {CheckinId}", id);
                    return BadRequest(ModelState);
                }

                var userId = GetUserIdFromClaims();
                _logger.LogInformation("Updating check-in {CheckinId} for user {UserId}", id, userId);

                var updatedCheckin = await _checkinService.UpdateCheckinAsync(userId, id, request);

                if (updatedCheckin == null)
                {
                    _logger.LogWarning("Check-in {CheckinId} not found for user {UserId} or user doesn't own it", id, userId);
                    return NotFound(new { message = "Check-in not found or you don't have permission to update it" });
                }

                _logger.LogInformation("Successfully updated check-in {CheckinId} for user {UserId}", id, userId);
                return Ok(updatedCheckin);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument in check-in update request for ID {CheckinId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating check-in {CheckinId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the check-in" });
            }
        }

        /// <summary>
        /// Delete a check-in
        /// </summary>
        /// <param name="id">ID of the check-in to delete</param>
        /// <returns>No content on successful deletion</returns>
        /// <response code="204">Check-in deleted successfully</response>
        /// <response code="401">Unauthorized - invalid or missing JWT token</response>
        /// <response code="404">Check-in not found or user doesn't own it</response>
        /// <response code="500">Internal server error</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCheckin(int id)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                _logger.LogInformation("Deleting check-in {CheckinId} for user {UserId}", id, userId);

                var deleted = await _checkinService.DeleteCheckinAsync(userId, id);

                if (!deleted)
                {
                    _logger.LogWarning("Check-in {CheckinId} not found for user {UserId} or user doesn't own it", id, userId);
                    return NotFound(new { message = "Check-in not found or you don't have permission to delete it" });
                }

                _logger.LogInformation("Successfully deleted check-in {CheckinId} for user {UserId}", id, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting check-in {CheckinId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the check-in" });
            }
        }

        /// <summary>
        /// Extracts the user ID from JWT claims
        /// </summary>
        /// <returns>User ID from the authenticated JWT token</returns>
        /// <exception cref="UnauthorizedAccessException">Thrown when user ID claim is not found or invalid</exception>
        private int GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogError("Invalid or missing user ID claim in JWT token");
                throw new UnauthorizedAccessException("Invalid authentication token");
            }
            return userId;
        }
    }
}