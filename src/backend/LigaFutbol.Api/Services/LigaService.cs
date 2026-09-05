using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class LigaService(ILigaRepository ligaRepository, IPaisRepository paisRepository) : ILigaService
{
    public async Task<IEnumerable<LigaDto>> GetAllAsync()
    {
        var ligas = await ligaRepository.GetAllAsync();
        return ligas.Select(ToDto);
    }

    public async Task<LigaDto?> GetByIdAsync(int id)
    {
        var liga = await ligaRepository.GetByIdAsync(id);
        return liga is null ? null : ToDto(liga);
    }

    public async Task<LigaDto> CreateAsync(CrearLigaDto dto)
    {
        await ValidarAsync(dto.Nombre, dto.PaisId);

        var liga = new Liga { Nombre = dto.Nombre, PaisId = dto.PaisId };
        await ligaRepository.AddAsync(liga);
        await ligaRepository.SaveChangesAsync();
        liga = await ligaRepository.GetByIdAsync(liga.Id);
        return ToDto(liga!);
    }

    public async Task<bool> UpdateAsync(int id, ActualizarLigaDto dto)
    {
        var liga = await ligaRepository.GetByIdAsync(id);
        if (liga is null) return false;

        await ValidarAsync(dto.Nombre, dto.PaisId);

        liga.Nombre = dto.Nombre;
        liga.PaisId = dto.PaisId;
        ligaRepository.Update(liga);
        return await ligaRepository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var liga = await ligaRepository.GetByIdAsync(id);
        if (liga is null) return false;

        if (liga.Equipos.Count > 0)
            throw new BusinessRuleException("No se puede eliminar la liga porque tiene equipos asociados.");

        ligaRepository.Remove(liga);
        return await ligaRepository.SaveChangesAsync();
    }

    private async Task ValidarAsync(string nombre, int paisId)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new BusinessRuleException("El nombre de la liga es obligatorio.");

        var pais = await paisRepository.GetByIdAsync(paisId);
        if (pais is null)
            throw new BusinessRuleException("El país indicado no existe.");
    }

    private static LigaDto ToDto(Liga liga) =>
        new(liga.Id, liga.Nombre, liga.PaisId, liga.Pais.Nombre,
            liga.Equipos.Select(e => new EquipoResumenDto(e.Id, e.Nombre, e.UrlEscudo)), liga.FechaCreacion);
}
