using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class CiudadService(ICiudadRepository ciudadRepository, IPaisRepository paisRepository) : ICiudadService
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
        await ValidarAsync(dto.Nombre, dto.PaisId);

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

        await ValidarAsync(dto.Nombre, dto.PaisId);

        ciudad.Nombre = dto.Nombre;
        ciudad.PaisId = dto.PaisId;
        ciudadRepository.Update(ciudad);
        return await ciudadRepository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ciudad = await ciudadRepository.GetByIdAsync(id);
        if (ciudad is null) return false;

        if (ciudad.Equipos.Count > 0)
            throw new BusinessRuleException("No se puede eliminar la ciudad porque tiene equipos asociados.");

        ciudadRepository.Remove(ciudad);
        return await ciudadRepository.SaveChangesAsync();
    }

    private async Task ValidarAsync(string nombre, int paisId)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new BusinessRuleException("El nombre de la ciudad es obligatorio.");

        var pais = await paisRepository.GetByIdAsync(paisId);
        if (pais is null)
            throw new BusinessRuleException("El país indicado no existe.");
    }

    private static CiudadDto ToDto(Ciudad ciudad) =>
        new(ciudad.Id, ciudad.Nombre, ciudad.PaisId, ciudad.Pais.Nombre,
            ciudad.Equipos.Select(e => new EquipoResumenDto(e.Id, e.Nombre, e.UrlEscudo)));
}
