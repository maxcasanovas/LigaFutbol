namespace LigaFutbol.Api.Models.DTOs;

public record RegistrarUsuarioDto(string Email, string Password, string Rol);

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string Token, DateTime ExpiraEn, string Email, string Rol);
