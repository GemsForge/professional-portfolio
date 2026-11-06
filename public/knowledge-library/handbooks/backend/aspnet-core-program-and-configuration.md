# ⚙️ Program.cs and Configuration in ASP.NET Core

## Page 1: 🎯 Purpose and application startup


**Category:** Software Engineering / C# / ASP.NET Core  
**Example:** Starting an Employee API with Dapper

### `Program.cs` as the composition root

`Program.cs` is where the application is assembled. It reads configuration, registers services, builds the app, orders middleware, maps endpoints, and starts the server. This makes it the composition root: the place that connects implementations to the abstractions they satisfy.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddProblemDetails();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

As registrations grow, group a related set behind an extension such as `AddEmployeeFeature`. Keep the order and purpose of pipeline middleware easy to inspect.


## Page 2: 🗂️ Configuration sources

### Configuration sources

ASP.NET Core can combine settings from JSON files, environment-specific JSON, environment variables, command-line arguments, and secret providers. Later providers can override earlier values. This lets the same application use different database endpoints in local development and hosted environments.

```json
{
  "ConnectionStrings": {
    "Employees": "Server=localhost;Database=Employees;Integrated Security=true;TrustServerCertificate=true"
  }
}
```

Read a connection string with `GetConnectionString("Employees")`. Treat required configuration as a startup requirement: fail clearly if it is missing, instead of waiting for the first database request to fail mysteriously.


## Page 3: ✅ Validating settings

### Use typed options for related settings

For a group of settings, bind a typed options class and validate it:

```csharp
public sealed class EmployeeDatabaseOptions
{
    public const string SectionName = "EmployeeDatabase";
    public string ConnectionString { get; init; } = "";
}

builder.Services.AddOptions<EmployeeDatabaseOptions>()
    .Bind(builder.Configuration.GetSection(EmployeeDatabaseOptions.SectionName))
    .Validate(options => !string.IsNullOrWhiteSpace(options.ConnectionString),
        "Employee database connection string is required.")
    .ValidateOnStart();
```

Options make settings easier to discover, validate, and inject. Keep options focused on configuration rather than placing application behavior in them.


## Page 4: 🔐 Secrets and responsibility boundaries

### Protect secrets

A checked-in JSON file can hold non-secret defaults, but should not contain production passwords, signing keys, API tokens, or private connection strings. Use local development secrets or the hosting environment's managed secret store. Avoid printing secret-bearing configuration to logs or returning it in error responses.

The connection string itself is an environment-specific value. Code should name the setting it requires; deployment configuration supplies the appropriate value for that environment.

### Keep responsibilities separate

- Service registrations connect interfaces and implementations.
- Configuration provides environment-specific values.
- Middleware configures behavior for requests.
- Endpoint mapping exposes the API surface.

For pipeline ordering and request-wide behavior, see [middleware and request logging](aspnet-core-middleware-and-request-logging.md). For dependency registration and lifetimes, see [dependency injection](aspnet-core-dependency-injection-and-lifetimes.md).

### References

- [ASP.NET Core configuration](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/)
- [Options pattern in .NET](https://learn.microsoft.com/dotnet/core/extensions/options)
- [ASP.NET Core dependency injection](https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection)
- [Middleware and request logging](aspnet-core-middleware-and-request-logging.md)
