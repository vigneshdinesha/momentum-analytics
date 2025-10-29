using MomentumAPI.Models;
using MomentumAPI.Models.DTOs;

namespace MomentumAPI.Services
{
    /// <summary>
    /// Service interface for user authentication operations
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user with the provided information
        /// </summary>
        /// <param name="request">The registration request containing user details</param>
        /// <returns>An AuthResponse with user info and JWT token</returns>
        Task<AuthResponse> RegisterAsync(RegisterRequest request);

        /// <summary>
        /// Authenticates a user with email and password
        /// </summary>
        /// <param name="request">The login request containing email and password</param>
        /// <returns>An AuthResponse with user info and JWT token if successful</returns>
        Task<AuthResponse?> LoginAsync(LoginRequest request);

        /// <summary>
        /// Checks if a user with the specified email already exists
        /// </summary>
        /// <param name="email">The email to check</param>
        /// <returns>True if user exists, false otherwise</returns>
        Task<bool> UserExistsAsync(string email);
    }
}
