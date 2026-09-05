using System.Security.Claims;
using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register(RegistrarUsuarioDto dto)
    {
        try
        {
            var resultado = await authService.RegistrarAsync(dto);
            return Ok(resultado);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("usuarios")]
    [Authorize(Policy = Policies.GestionUsuarios)]
    public async Task<ActionResult<AuthResponseDto>> CrearUsuario(RegistrarUsuarioDto dto)
    {
        try
        {
            var resultado = await authService.CrearUsuarioAsync(dto);
            return Ok(resultado);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var resultado = await authService.LoginAsync(dto);
        return resultado is null ? Unauthorized(new { message = "Credenciales inválidas." }) : Ok(resultado);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var rol = User.FindFirstValue(ClaimTypes.Role);
        return Ok(new { email, rol });
    }
}
