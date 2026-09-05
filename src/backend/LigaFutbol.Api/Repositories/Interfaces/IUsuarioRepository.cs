using LigaFutbol.Api.Models.Entities;

namespace LigaFutbol.Api.Repositories.Interfaces;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByEmailAsync(string email);
}
