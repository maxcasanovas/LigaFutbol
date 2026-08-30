using LigaFutbol.Api.Data;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Repositories;

public class EquipoRepository(LigaFutbolDbContext context) : Repository<Equipo>(context), IEquipoRepository
{
    public async Task<Equipo?> GetByNombreAsync(string nombre) =>
        await DbSet.FirstOrDefaultAsync(e => e.Nombre == nombre);
}
