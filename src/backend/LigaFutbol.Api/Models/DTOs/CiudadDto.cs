namespace LigaFutbol.Api.Models.DTOs;

public record CiudadDto(int Id, string Nombre, int PaisId, string Pais, IEnumerable<EquipoResumenDto> Equipos);

public record EquipoResumenDto(int Id, string Nombre, string UrlEscudo);

public record CrearCiudadDto(string Nombre, int PaisId);

public record ActualizarCiudadDto(string Nombre, int PaisId);
