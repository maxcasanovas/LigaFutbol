using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Routing;

namespace LigaFutbol.Api.Extensions;

public partial class SnakeCaseParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value) =>
        value is null ? null : PalabraCompuesta().Replace(value.ToString()!, "$1_$2").ToLowerInvariant();

    [GeneratedRegex("([a-z0-9])([A-Z])")]
    private static partial Regex PalabraCompuesta();
}
