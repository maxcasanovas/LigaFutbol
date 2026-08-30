namespace LigaFutbol.Api.Models.Entities;

public class Pais
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string UrlBandera { get; set; } = string.Empty;

    public ICollection<Ciudad> Ciudades { get; set; } = [];
}
