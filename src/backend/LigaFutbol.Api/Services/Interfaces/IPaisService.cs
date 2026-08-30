using LigaFutbol.Api.Models.DTOs;

namespace LigaFutbol.Api.Services.Interfaces;

public interface IPaisService
{
    Task<IEnumerable<PaisDto>> GetAllAsync();
    Task<PaisDto?> GetByIdAsync(int id);
    Task<PaisDto> CreateAsync(CrearPaisDto dto);
    Task<bool> UpdateAsync(int id, ActualizarPaisDto dto);
    Task<bool> DeleteAsync(int id);
}
