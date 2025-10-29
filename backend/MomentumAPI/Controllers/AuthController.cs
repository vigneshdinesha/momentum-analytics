using Microsoft.AspNetCore.Mvc;
using MomentumAPI.Models.DTOs;
using MomentumAPI.Services;

namespace MomentumAPI.Controllers
{
    /// <summary>
    /// Controller for user authentication operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        /// <param name="request">Registration details including email, password, first name, and last name</param>
        /// <returns>Authentication response with JWT token and user information</returns>
        /// <response code="201">User successfully registered</response>
        /// <response code="400">Invalid request data or user already exists</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid registration request received");
                    return BadRequest(ModelState);
                }

                var response = await _authService.RegisterAsync(request);
                _logger.LogInformation("User successfully registered with email {Email}", request.Email);
                
                return CreatedAtAction(nameof(Register), new { email = response.Email }, response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed for email {Email}: {Message}", request.Email, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for email {Email}", request.Email);
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        /// <summary>
        /// Authenticate user and return JWT token
        /// </summary>
        /// <param name="request">Login credentials including email and password</param>
        /// <returns>Authentication response with JWT token and user information</returns>
        /// <response code="200">Login successful</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="401">Invalid credentials</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid login request received");
                    return BadRequest(ModelState);
                }

                var response = await _authService.LoginAsync(request);
                
                if (response == null)
                {
                    _logger.LogWarning("Login failed for email {Email}: Invalid credentials", request.Email);
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                _logger.LogInformation("User successfully logged in with email {Email}", request.Email);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for email {Email}", request.Email);
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        /// <summary>
        /// Health check endpoint for authentication service
        /// </summary>
        /// <returns>Service health status</returns>
        /// <response code="200">Service is healthy</response>
        [HttpGet("health")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Health()
        {
            return Ok(new { 
                status = "healthy", 
                service = "MomentumAPI Authentication",
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
    }
}
