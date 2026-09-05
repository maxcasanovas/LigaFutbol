using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class CiudadService(ICiudadRepository ciudadRepository) : ICiudadService
{
    public async Task<IEnumerable<CiudadDto>> GetAllAsync()
    {
        var ciudades = await ciudadRepository.GetAllAsync();
        return ciudades.Select(ToDto);
    }

    public async Task<CiudadDto?> GetByIdAsync(int id)
    {
        var ciudad = await ciudadRepository.GetByIdAsync(id);
        return ciudad is null ? null : ToDto(ciudad);
    }

    public async Task<CiudadDto> CreateAsync(CrearCiudadDto dto)
    {
        var ciudad = new Ciudad { Nombre = dto.Nombre, PaisId = dto.PaisId };
        await ciudadRepository.AddAsync(ciudad);
        await ciudadRepository.SaveChangesAsync();
        ciudad = await ciudadRepository.GetByIdAsync(ciudad.Id);
        return ToDto(ciudad!);
    }

    public async Task<bool> UpdateAsync(int id, ActualizarCiudadDto dto)
    {
        var ciudad = await ciudadRepository.GetByIdAsync(id);
        if (ciudad is null) return false;

        ciudad.Nombre = dto.Nombre;
        ciudad.PaisId = dto.PaisId;
        ciudadRepository.Update(ciudad);
        return await ciudadRepository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ciudad = await ciudadRepository.GetByIdAsync(id);
        if (ciudad is null) return false;

        ciudadRepository.Remove(ciudad);
        return await ciudadRepository.SaveChangesAsync();
    }

    private static CiudadDto ToDto(Ciudad ciudad) =>
        new(ciudad.Id, ciudad.Nombre, ciudad.PaisId, ciudad.Pais.Nombre,
            ciudad.Equipos.Select(e => new EquipoResumenDto(e.Id, e.Nombre, e.UrlEscudo)));
}
