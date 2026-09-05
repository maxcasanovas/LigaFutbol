using LigaFutbol.Api.Data;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class UsuarioRepository(LigaFutbolDbContext context) : Repository<Usuario>(context), IUsuarioRepository
{
    public async Task<Usuario?> GetByEmailAsync(string email) =>
        await DbSet.FirstOrDefaultAsync(u => u.Email == email);
}
