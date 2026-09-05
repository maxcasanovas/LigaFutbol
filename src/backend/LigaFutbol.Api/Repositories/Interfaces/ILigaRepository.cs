using LigaFutbol.Api.Models.Entities;

namespace LigaFutbol.Api.Repositories.Interfaces;

public interface ILigaRepository : IRepository<Liga>
{
    Task<Liga?> GetByNombreAsync(string nombre);
}
