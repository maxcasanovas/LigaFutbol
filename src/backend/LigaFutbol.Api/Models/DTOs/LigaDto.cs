namespace LigaFutbol.Api.Models.DTOs;

public record LigaDto(int Id, string Nombre, int PaisId, string Pais, IEnumerable<EquipoResumenDto> Equipos, DateTime FechaCreacion);

public record CrearLigaDto(string Nombre, int PaisId);

public record ActualizarLigaDto(string Nombre, int PaisId);
