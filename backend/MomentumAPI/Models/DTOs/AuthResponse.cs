namespace MomentumAPI.Models.DTOs
{
    /// <summary>
    /// Data transfer object for authentication responses containing user info and JWT token
    /// </summary>
    public class AuthResponse
    {
        /// <summary>
        /// JWT token for authentication
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's first name
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User's last name
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Token expiration date and time in UTC
        /// </summary>
        public DateTime ExpiresAt { get; set; }
    }
}
