# 🌐 HTTP Status Codes for ASP.NET Core APIs

## Page 1: 🎯 Purpose and status-code guide


**Category:** Software Engineering / C# / ASP.NET Core  
**Example:** Employee API responses

### A status code is part of the API contract

An HTTP status code tells the client the broad outcome of a request. Choose a status that reflects what the server actually established, then return a response body that follows the API's documented contract.

| Status | Typical use | Employee API example |
|---|---|---|
| `200 OK` | Request succeeded and a representation or result is returned | Employee lookup or update returns the employee |
| `201 Created` | A resource was created | New employee response, preferably with a location link |
| `204 No Content` | Request succeeded and no response body is needed | Successful delete |
| `400 Bad Request` | Input is malformed or fails request validation | Missing required name field |
| `401 Unauthorized` | Authentication is absent or invalid | Missing or expired bearer token |
| `403 Forbidden` | Caller is authenticated but denied | Employee write permission is absent |
| `404 Not Found` | Resource does not exist or is intentionally concealed | Employee ID has no visible record |
| `409 Conflict` | Request conflicts with current resource state or a uniqueness rule | Duplicate employee identifier |
| `500 Internal Server Error` | Unexpected server failure | Unhandled application or infrastructure failure |

Exact choices can depend on the API contract and framework conventions. Be consistent across endpoints and document meaningful differences.


## Page 2: 🔍 Distinguishing absence from failure

### A missing record is not a failed lookup

A repository can complete successfully and return `null` when no employee matches. That is a normal result the endpoint can map to `404`. If Dapper or the database throws, the lookup did not establish whether the record exists. Do not catch that failure and return `404` as though the employee were absent.

```csharp
var employee = await _employees.GetByIdAsync(id, cancellationToken);
if (employee is null)
{
    return NotFound();
}

return Ok(EmployeeResponse.From(employee));
```

The [backend handbook's error and failure behavior section](backend-api-microservices-engineering-handbook.md#page-6--errors-failure-behavior-and-observability) explains how unexpected failures can be logged and converted to safe error responses centrally.


## Page 3: 📬 Successful write responses

### Create and delete responses

```csharp
var created = await _employees.CreateAsync(request, cancellationToken);
var response = EmployeeResponse.From(created);
return CreatedAtAction(nameof(GetById), new { id = created.Id }, response);
```

A `201` response communicates creation and can include the new resource's location. For a delete that returns no representation, `NoContent()` produces `204`. Choose response bodies intentionally; clients should not have to guess whether a successful response includes JSON.


## Page 4: 🧯 Safe error responses

### Keep error details safe and consistent

Validation failures can return a structured `400` with field-level details. Unexpected failures should use a stable error shape, such as Problem Details, while keeping stack traces, SQL statements, secrets, and internal exception messages out of public responses. See the [backend handbook's error and failure behavior section](backend-api-microservices-engineering-handbook.md#page-6--errors-failure-behavior-and-observability).

### References

- [HTTP status codes](https://developer.mozilla.org/docs/Web/HTTP/Status)
- [ASP.NET Core Web API error handling](https://learn.microsoft.com/aspnet/core/fundamentals/error-handling-api)
- [Authentication and authorization](aspnet-core-authentication-and-authorization.md)
