namespace LigaFutbol.Api.Models.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
