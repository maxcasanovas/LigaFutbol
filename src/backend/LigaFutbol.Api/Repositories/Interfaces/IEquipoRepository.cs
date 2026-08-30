using LigaFutbol.Api.Models.Entities;

namespace LigaFutbol.Api.Repositories.Interfaces;

public interface IEquipoRepository : IRepository<Equipo>
{
    Task<Equipo?> GetByNombreAsync(string nombre);
}
