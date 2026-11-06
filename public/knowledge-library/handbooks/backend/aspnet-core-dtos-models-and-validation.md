# 📦 DTOs, Models, and Validation in ASP.NET Core

## Page 1: 🎯 Purpose and model roles


**Category:** Software Engineering / C# / ASP.NET Core  
**Example:** Creating and returning an employee

### Similar-looking types have different jobs

A **DTO** (data transfer object) describes data crossing a boundary. A request DTO defines what an API caller may send. A response DTO defines what the API chooses to expose. A persistence model represents database storage or a row returned by Dapper. A domain model represents business concepts and rules when the application needs that distinction.

| Type | Purpose | Example |
|---|---|---|
| Request DTO | Accepted client input | `CreateEmployeeRequest` |
| Response DTO | Safe public output | `EmployeeResponse` |
| Persistence model | Database row mapping | `EmployeeRecord` |
| Domain model | Business meaning and invariants | `Employee` |

For a small application, one type may serve more than one role if the contracts truly match. Keep them separate when public API stability, security, or domain behavior requires independent change.


## Page 2: 🛡️ Shape accepted and returned data

### Avoid over-posting

Binding a database entity directly from a public request can let the caller set values intended to be server-controlled, such as IDs, tenant ownership, audit fields, or administrative flags. A request DTO allowlists accepted values.

```csharp
public sealed record CreateEmployeeRequest(
    [property: Required, StringLength(100)] string Name,
    [property: Required, StringLength(80)] string Department);

public sealed record EmployeeResponse(
    int Id,
    string Name,
    string Department);

public sealed class EmployeeRecord
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Department { get; init; } = "";
    public string InternalPayrollCode { get; init; } = "";
}
```

Mapping a record to a response makes the exposure decision explicit:

```csharp
var response = new EmployeeResponse(record.Id, record.Name, record.Department);
```

`InternalPayrollCode` never enters the public response.


## Page 3: ✅ Validation responsibilities

### Validate at the boundary

With `[ApiController]`, ASP.NET Core commonly turns data-annotation model validation failures into an automatic `400 Bad Request`. Explicit validation can handle more complex rules. The application service should enforce business rules that are not merely input shape checks, and the database should enforce durable integrity constraints such as uniqueness and foreign keys.

A useful division is:

1. API boundary: required fields, formats, lengths, and parseable values.
2. Application/domain: business rules and state transitions.
3. Database: durable constraints that must hold even under concurrent requests or other write paths.

Validation does not make input trusted. Continue using parameterized SQL and authorization checks.


## Page 4: 📤 Maintaining the API contract

### Return a stable response contract

Response DTOs should expose fields clients need and support predictable evolution. Avoid returning database-specific objects or exception details. Document nullable fields, date/time formats, identifiers, and error response shape when clients depend on them.

### References

- [ASP.NET Core Web API controllers and validation](https://learn.microsoft.com/aspnet/core/web-api/)
- [Backend API contracts overview](backend-api-microservices-engineering-handbook.md)
- [HTTP status codes](aspnet-core-http-status-codes.md)
- [Dapper and the repository pattern](aspnet-core-dapper-repository-pattern.md)
