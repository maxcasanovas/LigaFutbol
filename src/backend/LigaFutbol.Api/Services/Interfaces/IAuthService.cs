using LigaFutbol.Api.Models.DTOs;

namespace LigaFutbol.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegistrarAsync(RegistrarUsuarioDto dto);
    Task<AuthResponseDto> CrearUsuarioAsync(RegistrarUsuarioDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}
