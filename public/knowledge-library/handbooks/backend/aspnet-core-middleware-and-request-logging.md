# 🧾 Middleware and Request Logging in ASP.NET Core

## Page 1: 🎯 Purpose and request pipeline


**Category:** Software Engineering / C# / ASP.NET Core  
**Example:** Observing Employee API requests

### What middleware does

Middleware is a component in ASP.NET Core's HTTP request pipeline. A middleware component can inspect or change a request, call the next component, and inspect or change the response as it returns. The configured order therefore affects behavior.

```mermaid
flowchart LR
    Request --> Error[Exception handling]
    Error --> Log[Request logging]
    Log --> Auth[Authentication]
    Auth --> Permission[Authorization]
    Permission --> Endpoint
    Endpoint --> Response
```

Exception handling is placed around downstream work so it can translate failures from the pipeline it wraps. Authentication should run before authorization, because authorization needs the identity established by authentication. Actual ordering depends on the features enabled by the application.


## Page 2: 📊 Request logging

### Add request logging

ASP.NET Core's hosting and logging integrations can record request method, path, status code, and elapsed time. A small custom middleware can add structured fields when needed, but avoid duplicating framework logging without a clear purpose.

```csharp
public sealed class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    public RequestTimingMiddleware(
        RequestDelegate next,
        ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startedAt = Stopwatch.GetTimestamp();
        try
        {
            await _next(context);
        }
        finally
        {
            var elapsed = Stopwatch.GetElapsedTime(startedAt);
            _logger.LogInformation(
                "HTTP {Method} {Path} returned {StatusCode} in {ElapsedMilliseconds} ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                elapsed.TotalMilliseconds);
        }
    }
}
```

Register it in the desired position with `app.UseMiddleware<RequestTimingMiddleware>()`. Structured placeholders preserve fields that a logging system can query, instead of embedding every value into one unsearchable message.


## Page 3: 🔎 Correlation and safe context

### Correlation and useful context

A request or trace identifier helps connect an API log to related diagnostics. ASP.NET Core exposes request identifiers through `HttpContext`; distributed tracing can propagate trace context across outgoing calls. Include identifiers as structured fields when the logging platform supports them.

Useful operational fields often include route template, method, status, duration, trace identifier, and an internal actor identifier when policy permits. Log failures with exception details in protected logs, while returning a safe public error response. See the [backend handbook's error and failure behavior section](backend-api-microservices-engineering-handbook.md#page-6--errors-failure-behavior-and-observability).


## Page 4: 🔐 Protecting sensitive data

### Protect sensitive data

Do not log authorization headers, bearer tokens, passwords, full request bodies by default, or sensitive personal data. Query strings can contain secrets too. Prefer allowlisted fields and avoid capturing payloads unless there is a reviewed, specific need and retention policy.

Logging should answer operational questions: did the request reach the service, how long did it take, and what safe outcome occurred? It should not create a second store of confidential user data.

### References

- [ASP.NET Core middleware](https://learn.microsoft.com/aspnet/core/fundamentals/middleware/)
- [Logging in .NET](https://learn.microsoft.com/dotnet/core/extensions/logging)
- [ASP.NET Core diagnostics](https://learn.microsoft.com/aspnet/core/diagnostics/)
- [Program.cs and configuration](aspnet-core-program-and-configuration.md)
