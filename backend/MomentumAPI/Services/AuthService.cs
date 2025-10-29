using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using MomentumAPI.Data;
using MomentumAPI.Models;
using MomentumAPI.Models.DTOs;

namespace MomentumAPI.Services
{
    /// <summary>
    /// Service for user authentication operations including registration and login
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext context, ITokenService tokenService, ILogger<AuthService> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new user with the provided information
        /// </summary>
        /// <param name="request">The registration request containing user details</param>
        /// <returns>An AuthResponse with user info and JWT token</returns>
        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Check if user already exists
                if (await UserExistsAsync(request.Email))
                {
                    throw new InvalidOperationException($"User with email {request.Email} already exists");
                }

                // Hash the password using BCrypt
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, BCrypt.Net.BCrypt.GenerateSalt());

                // Create new user
                var user = new User
                {
                    Email = request.Email.ToLowerInvariant(),
                    PasswordHash = passwordHash,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    SubscriptionTier = "free", // Default to free tier
                    OnboardingComplete = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Add user to database
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New user registered with email {Email} and ID {UserId}", user.Email, user.Id);

                // Generate JWT token
                var token = _tokenService.GenerateToken(user);
                var expiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

                return new AuthResponse
                {
                    Token = token,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName ?? string.Empty,
                    LastName = user.LastName ?? string.Empty,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user with email {Email}", request.Email);
                throw;
            }
        }

        /// <summary>
        /// Authenticates a user with email and password
        /// </summary>
        /// <param name="request">The login request containing email and password</param>
        /// <returns>An AuthResponse with user info and JWT token if successful</returns>
        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            try
            {
                // Find user by email
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant());

                if (user == null)
                {
                    _logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
                    return null;
                }

                // Verify password using BCrypt
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Invalid password attempt for email: {Email}", request.Email);
                    return null;
                }

                _logger.LogInformation("Successful login for user {UserId} with email {Email}", user.Id, user.Email);

                // Generate JWT token
                var token = _tokenService.GenerateToken(user);
                var expiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

                return new AuthResponse
                {
                    Token = token,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName ?? string.Empty,
                    LastName = user.LastName ?? string.Empty,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login attempt for email {Email}", request.Email);
                throw;
            }
        }

        /// <summary>
        /// Checks if a user with the specified email already exists
        /// </summary>
        /// <param name="email">The email to check</param>
        /// <returns>True if user exists, false otherwise</returns>
        public async Task<bool> UserExistsAsync(string email)
        {
            try
            {
                return await _context.Users
                    .AnyAsync(u => u.Email == email.ToLowerInvariant());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user exists with email {Email}", email);
                throw;
            }
        }

        /// <summary>
        /// Gets the JWT token expiration time in minutes from configuration
        /// </summary>
        /// <returns>Token expiration time in minutes</returns>
        private int GetTokenExpirationMinutes()
        {
            // This will be injected from configuration, defaulting to 7 days (10080 minutes)
            return 10080;
        }
    }
}
