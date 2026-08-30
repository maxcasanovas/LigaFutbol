using LigaFutbol.Api.Data;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class PaisRepository(LigaFutbolDbContext context) : Repository<Pais>(context), IPaisRepository
{
    public override async Task<IEnumerable<Pais>> GetAllAsync() =>
        await DbSet.Include(p => p.Ciudades).ToListAsync();

    public override async Task<Pais?> GetByIdAsync(int id) =>
        await DbSet.Include(p => p.Ciudades).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Pais?> GetByNombreAsync(string nombre) =>
        await DbSet.Include(p => p.Ciudades).FirstOrDefaultAsync(p => p.Nombre == nombre);
}
