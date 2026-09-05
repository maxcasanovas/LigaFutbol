using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class AuthService(IUsuarioRepository usuarioRepository, JwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public async Task<AuthResponseDto> RegistrarAsync(RegistrarUsuarioDto dto)
    {
        if (!string.Equals(dto.Rol, nameof(RolUsuario.Lector), StringComparison.OrdinalIgnoreCase))
            throw new BusinessRuleException(
                "El autoregistro solo permite el rol Lector. Para crear usuarios Editor o Admin, un administrador debe usar /api/auth/usuarios.");

        return await CrearUsuarioInternoAsync(dto);
    }

    public async Task<AuthResponseDto> CrearUsuarioAsync(RegistrarUsuarioDto dto) =>
        await CrearUsuarioInternoAsync(dto);

    private async Task<AuthResponseDto> CrearUsuarioInternoAsync(RegistrarUsuarioDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            throw new BusinessRuleException("La contraseña debe tener al menos 6 caracteres.");

        if (!Enum.TryParse<RolUsuario>(dto.Rol, ignoreCase: true, out var rol))
            throw new BusinessRuleException("Rol inválido. Valores permitidos: Admin, Editor, Lector.");

        var existente = await usuarioRepository.GetByEmailAsync(dto.Email);
        if (existente is not null)
            throw new BusinessRuleException("El email ya está registrado.");

        var usuario = new Usuario
        {
            Email = dto.Email,
            PasswordHash = PasswordHasher.Hash(dto.Password),
            Rol = rol
        };

        await usuarioRepository.AddAsync(usuario);
        await usuarioRepository.SaveChangesAsync();

        return GenerarRespuesta(usuario);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var usuario = await usuarioRepository.GetByEmailAsync(dto.Email);
        if (usuario is null || !PasswordHasher.Verify(dto.Password, usuario.PasswordHash))
            return null;

        return GenerarRespuesta(usuario);
    }

    private AuthResponseDto GenerarRespuesta(Usuario usuario)
    {
        var (token, expiraEn) = jwtTokenGenerator.GenerarToken(usuario);
        return new AuthResponseDto(token, expiraEn, usuario.Email, usuario.Rol.ToString());
    }
}
