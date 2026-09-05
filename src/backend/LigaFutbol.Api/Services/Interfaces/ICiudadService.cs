using LigaFutbol.Api.Models.DTOs;

namespace LigaFutbol.Api.Services.Interfaces;

public interface ICiudadService
{
    Task<IEnumerable<CiudadDto>> GetAllAsync();
    Task<CiudadDto?> GetByIdAsync(int id);
    Task<CiudadDto> CreateAsync(CrearCiudadDto dto);
    Task<bool> UpdateAsync(int id, ActualizarCiudadDto dto);
    Task<bool> DeleteAsync(int id);
}
