using System.Net;
using System.Text.Json;

namespace MomentumAPI.Middleware
{
    /// <summary>
    /// Middleware for global exception handling and error response formatting
    /// </summary>
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        /// <summary>
        /// Processes HTTP requests and handles any exceptions that occur
        /// </summary>
        /// <param name="context">The HTTP context</param>
        /// <returns>Task representing the asynchronous operation</returns>
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred while processing request {RequestPath}", context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        /// <summary>
        /// Handles exceptions and formats error responses
        /// </summary>
        /// <param name="context">The HTTP context</param>
        /// <param name="exception">The exception that occurred</param>
        /// <returns>Task representing the asynchronous operation</returns>
        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ErrorResponse();

            switch (exception)
            {
                case ArgumentException:
                case InvalidOperationException:
                    // Business logic errors
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = exception.Message;
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case UnauthorizedAccessException:
                    // Authentication/Authorization errors
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse.Message = "Unauthorized access";
                    errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                    break;

                case KeyNotFoundException:
                    // Resource not found errors
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = "Resource not found";
                    errorResponse.StatusCode = (int)HttpStatusCode.NotFound;
                    break;

                default:
                    // Unknown errors
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "An internal server error occurred";
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            errorResponse.TraceId = context.TraceIdentifier;
            errorResponse.Timestamp = DateTime.UtcNow;

            var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await response.WriteAsync(jsonResponse);
        }
    }

    /// <summary>
    /// Standard error response format for API errors
    /// </summary>
    public class ErrorResponse
    {
        /// <summary>
        /// HTTP status code of the error
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// Human-readable error message
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Unique trace identifier for tracking the request
        /// </summary>
        public string TraceId { get; set; } = string.Empty;

        /// <summary>
        /// Timestamp when the error occurred
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Additional error details (optional)
        /// </summary>
        public object? Details { get; set; }
    }
}
