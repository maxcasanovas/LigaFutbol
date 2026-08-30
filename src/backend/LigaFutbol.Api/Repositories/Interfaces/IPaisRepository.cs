using LigaFutbol.Api.Models.Entities;

namespace LigaFutbol.Api.Repositories.Interfaces;

public interface IPaisRepository : IRepository<Pais>
{
    Task<Pais?> GetByNombreAsync(string nombre);
}
