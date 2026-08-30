using LigaFutbol.Api.Models.Entities;

namespace LigaFutbol.Api.Repositories.Interfaces;

public interface ICiudadRepository : IRepository<Ciudad>
{
    Task<Ciudad?> GetByNombreAsync(string nombre);
}
