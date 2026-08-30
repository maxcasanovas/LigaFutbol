using LigaFutbol.Api.Data;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class CiudadRepository(LigaFutbolDbContext context) : Repository<Ciudad>(context), ICiudadRepository
{
    public override async Task<IEnumerable<Ciudad>> GetAllAsync() =>
        await DbSet.Include(c => c.Pais).Include(c => c.Equipos).ToListAsync();

    public override async Task<Ciudad?> GetByIdAsync(int id) =>
        await DbSet.Include(c => c.Pais).Include(c => c.Equipos).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Ciudad?> GetByNombreAsync(string nombre) =>
        await DbSet.Include(c => c.Pais).Include(c => c.Equipos).FirstOrDefaultAsync(c => c.Nombre == nombre);
}
