using LigaFutbol.Api.Models.DTOs;

namespace LigaFutbol.Api.Services.Interfaces;

public interface ILigaService
{
    Task<IEnumerable<LigaDto>> GetAllAsync();
    Task<LigaDto?> GetByIdAsync(int id);
    Task<LigaDto> CreateAsync(CrearLigaDto dto);
    Task<bool> UpdateAsync(int id, ActualizarLigaDto dto);
    Task<bool> DeleteAsync(int id);
}
