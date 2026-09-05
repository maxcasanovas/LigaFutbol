using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace LigaFutbol.Api.Security;

public sealed class BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider authenticationSchemeProvider) : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        var schemes = await authenticationSchemeProvider.GetAllSchemesAsync();
        if (!schemes.Any(s => s.Name == JwtBearerDefaults.AuthenticationScheme))
            return;

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            In = ParameterLocation.Header,
            BearerFormat = "JWT"
        };

        var securityRequirement = new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        };

        foreach (var apiDescription in context.DescriptionGroups.SelectMany(g => g.Items))
        {
            var metadata = apiDescription.ActionDescriptor.EndpointMetadata;
            var requiereAuth = metadata.OfType<IAuthorizeData>().Any() && !metadata.OfType<IAllowAnonymous>().Any();
            if (!requiereAuth)
                continue;

            var path = "/" + apiDescription.RelativePath?.TrimStart('/');
            if (apiDescription.RelativePath is null || !document.Paths.TryGetValue(path, out var pathItem))
                continue;

            var httpMethod = new HttpMethod(apiDescription.HttpMethod ?? "GET");
            if (pathItem.Operations is null || !pathItem.Operations.TryGetValue(httpMethod, out var operation))
                continue;

            var security = operation.Security ??= [];
            security.Add(securityRequirement);
        }
    }
}
