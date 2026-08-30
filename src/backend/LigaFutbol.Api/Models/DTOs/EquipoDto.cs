namespace LigaFutbol.Api.Models.DTOs;

public record EquipoDto(int Id, string Nombre, string Ciudad, DateTime FechaCreacion);

public record CrearEquipoDto(string Nombre, string Ciudad);

public record ActualizarEquipoDto(string Nombre, string Ciudad);
