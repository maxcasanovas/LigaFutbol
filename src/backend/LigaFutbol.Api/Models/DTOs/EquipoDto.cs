namespace LigaFutbol.Api.Models.DTOs;

public record EquipoDto(int Id, string Nombre, string UrlEscudo, int CiudadId, string Ciudad, DateTime FechaCreacion);

public record CrearEquipoDto(string Nombre, string UrlEscudo, int CiudadId);

public record ActualizarEquipoDto(string Nombre, string UrlEscudo, int CiudadId);
