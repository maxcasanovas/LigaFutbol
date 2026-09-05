namespace LigaFutbol.Api.Models.Entities;

public class Liga
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public int PaisId { get; set; }
    public Pais Pais { get; set; } = null!;

    public ICollection<Equipo> Equipos { get; set; } = [];
}
