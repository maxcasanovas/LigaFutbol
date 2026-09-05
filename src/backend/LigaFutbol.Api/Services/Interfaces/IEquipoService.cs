using LigaFutbol.Api.Models.DTOs;

namespace LigaFutbol.Api.Services.Interfaces;

public interface IEquipoService
{
    Task<IEnumerable<EquipoDto>> GetAllAsync();
    Task<EquipoDto?> GetByIdAsync(int id);
    Task<EquipoDto> CreateAsync(CrearEquipoDto dto);
    Task<bool> UpdateAsync(int id, ActualizarEquipoDto dto);
    Task<bool> DeleteAsync(int id);
}
