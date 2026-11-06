# 🧪 Testing ASP.NET Core Services, Repositories, and Interfaces

## Page 1: 🎯 Purpose and test layers


**Category:** Software Engineering / C# / ASP.NET Core  
**Example:** Employee API with a Dapper repository

### Test each claim at the layer that can prove it

A layered API needs more than one kind of test. A unit test can isolate business rules; a database integration test can verify SQL and mapping; an API integration test can verify the public HTTP behavior through the application pipeline.

| Test level | Evidence it provides | Employee API example |
|---|---|---|
| Service unit test | Business decisions with controlled collaborators | Inactive department cannot accept an employee |
| Repository integration test | SQL, schema, parameters, mapping, transaction behavior | Dapper returns the expected employee row |
| API integration test | Routing, serialization, validation, authentication, status, response body | Invalid input returns the documented `400` shape |

A passing service unit test does not prove SQL works. A successful manual query does not prove the API maps and authorizes its response correctly.


## Page 2: 🧩 Testing through useful boundaries

### Use interfaces for meaningful seams

Suppose `EmployeeService` depends on `IEmployeeRepository`. A unit test can provide a small fake repository with a known employee and assert the service's rule or result. This isolates the service from SQL Server without pretending to test database behavior.

Create an interface when a caller needs a stable capability or a useful substitute. Avoid adding an interface to every class by convention alone; testability comes from clear boundaries and observable behavior, not interface count.


## Page 3: 🌐 API integration tests

### Test the HTTP contract

Use ASP.NET Core's test host or `WebApplicationFactory` to send requests through routing and middleware. Verify status codes, response bodies, model validation, authentication and authorization outcomes, and relevant headers. Include both successful and denied requests.

Security tests should cover missing/invalid credentials, authenticated callers without permission, and resource ownership. A caller must not gain access to another employee by changing the route ID.


## Page 4: 🗄️ Repository integration tests

### Test Dapper against a database

Repository tests should run against a disposable database compatible with the production provider, or another carefully selected test database when semantics are equivalent. Verify representative queries, parameter binding, null/missing-row behavior, mapping, and transaction behavior. A mock cannot parse the SQL or prove the schema supports it.

Keep test data isolated and repeatable. Avoid pointing tests at personal or production data. See the [database testing handbook](../data/database-testing-handbook.md) for fixture and schema guidance.

### Keep assertions meaningful

Prefer assertions about results a caller observes: returned employee, persisted values, HTTP status, or error contract. Use interaction checks where they express a real requirement, such as confirming an external payment is not attempted after validation fails. Avoid tests that lock in private helper names or incidental call order.

### References

- [Testing and QA handbook](../quality/testing-and-qa-handbook.md)
- [Database testing handbook](../data/database-testing-handbook.md)
- [ASP.NET Core integration tests](https://learn.microsoft.com/aspnet/core/test/integration-tests)
- [Dependency injection and lifetimes](aspnet-core-dependency-injection-and-lifetimes.md)
- [Dapper repository pattern](aspnet-core-dapper-repository-pattern.md)
