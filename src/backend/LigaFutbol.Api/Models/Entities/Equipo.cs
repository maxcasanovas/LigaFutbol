namespace LigaFutbol.Api.Models.Entities;

public class Equipo
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string UrlEscudo { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public int CiudadId { get; set; }
    public Ciudad Ciudad { get; set; } = null!;

    public int LigaId { get; set; }
    public Liga Liga { get; set; } = null!;
}
