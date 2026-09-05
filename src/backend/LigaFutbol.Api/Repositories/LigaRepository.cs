using LigaFutbol.Api.Data;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class LigaRepository(LigaFutbolDbContext context) : Repository<Liga>(context), ILigaRepository
{
    public override async Task<IEnumerable<Liga>> GetAllAsync() =>
        await DbSet.Include(l => l.Pais).Include(l => l.Equipos).ToListAsync();

    public override async Task<Liga?> GetByIdAsync(int id) =>
        await DbSet.Include(l => l.Pais).Include(l => l.Equipos).FirstOrDefaultAsync(l => l.Id == id);

    public async Task<Liga?> GetByNombreAsync(string nombre) =>
        await DbSet.Include(l => l.Pais).Include(l => l.Equipos).FirstOrDefaultAsync(l => l.Nombre == nombre);
}
