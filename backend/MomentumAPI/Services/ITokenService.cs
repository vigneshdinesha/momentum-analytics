using MomentumAPI.Models;

namespace MomentumAPI.Services
{
    /// <summary>
    /// Service interface for JWT token operations
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Generates a JWT token for the specified user
        /// </summary>
        /// <param name="user">The user to generate the token for</param>
        /// <returns>A JWT token string</returns>
        string GenerateToken(User user);

        /// <summary>
        /// Validates a JWT token and extracts user information
        /// </summary>
        /// <param name="token">The JWT token to validate</param>
        /// <returns>The user ID if token is valid, null otherwise</returns>
        int? ValidateToken(string token);
    }
}
