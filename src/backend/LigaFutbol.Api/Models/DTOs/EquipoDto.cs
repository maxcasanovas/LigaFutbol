namespace LigaFutbol.Api.Models.DTOs;

public record EquipoDto(int Id, string Nombre, int CiudadId, string Ciudad, DateTime FechaCreacion);

public record CrearEquipoDto(string Nombre, int CiudadId);

public record ActualizarEquipoDto(string Nombre, int CiudadId);
