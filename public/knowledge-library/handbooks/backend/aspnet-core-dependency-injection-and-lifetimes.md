# 💉 Dependency Injection and Service Lifetimes in ASP.NET Core

## Page 1: 🎯 Purpose


**Category:** Software Engineering / C# / ASP.NET Core  
**Example:** Employee service and Dapper repository

### Dependency injection in plain language

Dependency injection (DI) means a class receives the objects it needs instead of constructing or locating them itself. ASP.NET Core's service container creates registered services and supplies them to controllers and other services.

```csharp
public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public sealed class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employees;

    public EmployeeService(IEmployeeRepository employees)
    {
        _employees = employees;
    }

    public Task<Employee?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        _employees.GetByIdAsync(id, cancellationToken);
}
```

This constructor makes the dependency visible. A test can supply a controlled repository implementation; the running API can supply the Dapper-backed repository.


## Page 2: 🧩 Registering dependencies

### Register services

Register the mapping from abstraction to implementation in `Program.cs` or a focused registration extension:

```csharp
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
```

The controller can then request `IEmployeeService` in its constructor. ASP.NET Core resolves the dependency graph when it creates the controller.


## Page 3: ⏳ Choosing a service lifetime

### The three lifetimes

| Lifetime | How long an instance is reused | Typical use |
|---|---|---|
| Transient | A new instance each time the container resolves it | Small, stateless services |
| Scoped | Reused within one request scope; a new instance for another request | Request work, repositories, and services depending on scoped resources |
| Singleton | One instance for the application's lifetime | Thread-safe shared state or immutable services |

Choose based on the state and dependencies the object owns. A repository that creates and disposes a connection for each operation can be scoped. A singleton must be safe for concurrent requests and should not store request-specific state.


## Page 4: ⚠️ Lifetime boundaries

### Lifetime mismatch

A singleton lives longer than a scoped service. If it captures a scoped dependency in its constructor, that dependency can be reused across requests outside its intended scope. ASP.NET Core can detect some such mistakes during development. Do not silence validation by changing lifetimes mechanically; decide which component should own the work.

Hosted background services are usually singletons. When they need a scoped service, create a scope for each unit of background work using `IServiceScopeFactory`, resolve the scoped service inside that scope, and dispose the scope when the work ends.

### Practical decision steps

1. Does the service hold request-specific or scoped state? Usually scoped.
2. Is it stateless and inexpensive to create? Transient may fit.
3. Does it need to be shared for the app lifetime? Use singleton only if it is thread-safe and all dependencies have compatible lifetimes.
4. Can its dependencies be constructed through the container? Prefer constructor injection over service-locator calls.

DI improves substitutability and makes dependency ownership explicit. It does not require an interface for every concrete class. Add an interface when it represents a meaningful boundary, such as a service's persistence dependency.

### References

- [ASP.NET Core dependency injection](https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection)
- [Dependency injection guidelines](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection-guidelines)
- [Layered architecture](aspnet-core-layered-architecture.md)
- [Testing and interfaces](aspnet-core-testing-and-interfaces.md)
