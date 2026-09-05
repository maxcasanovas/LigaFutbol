using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class PaisService(IPaisRepository paisRepository) : IPaisService
{
    public async Task<IEnumerable<PaisDto>> GetAllAsync()
    {
        var paises = await paisRepository.GetAllAsync();
        return paises.Select(ToDto);
    }

    public async Task<PaisDto?> GetByIdAsync(int id)
    {
        var pais = await paisRepository.GetByIdAsync(id);
        return pais is null ? null : ToDto(pais);
    }

    public async Task<PaisDto?> GetByNombreAsync(string nombre)
    {
        var pais = await paisRepository.GetByNombreAsync(nombre);
        return pais is null ? null : ToDto(pais);
    }

    public async Task<PaisDto> CreateAsync(CrearPaisDto dto)
    {
        var pais = new Pais { Nombre = dto.Nombre, UrlBandera = dto.UrlBandera };
        await paisRepository.AddAsync(pais);
        await paisRepository.SaveChangesAsync();
        return ToDto(pais);
    }

    public async Task<bool> UpdateAsync(int id, ActualizarPaisDto dto)
    {
        var pais = await paisRepository.GetByIdAsync(id);
        if (pais is null) return false;

        pais.Nombre = dto.Nombre;
        pais.UrlBandera = dto.UrlBandera;
        paisRepository.Update(pais);
        return await paisRepository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var pais = await paisRepository.GetByIdAsync(id);
        if (pais is null) return false;

        paisRepository.Remove(pais);
        return await paisRepository.SaveChangesAsync();
    }

    private static PaisDto ToDto(Pais pais) =>
        new(pais.Id, pais.Nombre, pais.UrlBandera,
            pais.Ciudades.Select(c => new CiudadResumenDto(c.Id, c.Nombre)));
}
