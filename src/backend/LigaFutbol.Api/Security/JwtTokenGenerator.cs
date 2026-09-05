using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LigaFutbol.Api.Models.Entities;
using Microsoft.IdentityModel.Tokens;

namespace LigaFutbol.Api.Security;

public class JwtTokenGenerator(IConfiguration configuration)
{
    public (string Token, DateTime ExpiraEn) GenerarToken(Usuario usuario)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiraEn = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationMinutes"]!));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email, usuario.Email),
            new(ClaimTypes.Role, usuario.Rol.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiraEn,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiraEn);
    }
}
