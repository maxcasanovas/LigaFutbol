using LigaFutbol.Api.Exceptions;
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
        Validar(dto.Nombre, dto.UrlBandera);

        var pais = new Pais { Nombre = dto.Nombre, UrlBandera = dto.UrlBandera };
        await paisRepository.AddAsync(pais);
        await paisRepository.SaveChangesAsync();
        return ToDto(pais);
    }

    public async Task<bool> UpdateAsync(int id, ActualizarPaisDto dto)
    {
        var pais = await paisRepository.GetByIdAsync(id);
        if (pais is null) return false;

        Validar(dto.Nombre, dto.UrlBandera);

        pais.Nombre = dto.Nombre;
        pais.UrlBandera = dto.UrlBandera;
        paisRepository.Update(pais);
        return await paisRepository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var pais = await paisRepository.GetByIdAsync(id);
        if (pais is null) return false;

        if (pais.Ciudades.Count > 0)
            throw new BusinessRuleException("No se puede eliminar el país porque tiene ciudades asociadas.");

        if (pais.Ligas.Count > 0)
            throw new BusinessRuleException("No se puede eliminar el país porque tiene ligas asociadas.");

        paisRepository.Remove(pais);
        return await paisRepository.SaveChangesAsync();
    }

    private static void Validar(string nombre, string urlBandera)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new BusinessRuleException("El nombre del país es obligatorio.");

        if (string.IsNullOrWhiteSpace(urlBandera))
            throw new BusinessRuleException("La URL de la bandera es obligatoria.");
    }

    private static PaisDto ToDto(Pais pais) =>
        new(pais.Id, pais.Nombre, pais.UrlBandera,
            pais.Ciudades.Select(c => new CiudadResumenDto(c.Id, c.Nombre)));
}
