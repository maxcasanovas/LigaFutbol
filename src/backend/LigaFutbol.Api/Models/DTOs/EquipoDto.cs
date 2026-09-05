namespace LigaFutbol.Api.Models.DTOs;

public record EquipoDto(int Id, string Nombre, string UrlEscudo, int CiudadId, string Ciudad, int LigaId, string Liga, DateTime FechaCreacion);

public record CrearEquipoDto(string Nombre, string UrlEscudo, int CiudadId, int LigaId);

public record ActualizarEquipoDto(string Nombre, string UrlEscudo, int CiudadId, int LigaId);
