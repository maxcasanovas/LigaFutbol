namespace LigaFutbol.Api.Models.DTOs;

public record PaisDto(int Id, string Nombre, string UrlBandera, IEnumerable<CiudadResumenDto> Ciudades);

public record CiudadResumenDto(int Id, string Nombre);

public record CrearPaisDto(string Nombre, string UrlBandera);

public record ActualizarPaisDto(string Nombre, string UrlBandera);
