using LigaFutbol.Api.Data;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class EquipoRepository(LigaFutbolDbContext context) : Repository<Equipo>(context), IEquipoRepository
{
    public override async Task<IEnumerable<Equipo>> GetAllAsync() =>
        await DbSet.Include(e => e.Ciudad).ToListAsync();

    public override async Task<Equipo?> GetByIdAsync(int id) =>
        await DbSet.Include(e => e.Ciudad).FirstOrDefaultAsync(e => e.Id == id);

    public async Task<Equipo?> GetByNombreAsync(string nombre) =>
        await DbSet.Include(e => e.Ciudad).FirstOrDefaultAsync(e => e.Nombre == nombre);
}
