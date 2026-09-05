using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class EquipoService(
    IEquipoRepository equipoRepository,
    ICiudadRepository ciudadRepository,
    ILigaRepository ligaRepository) : IEquipoService
{
    public async Task<IEnumerable<EquipoDto>> GetAllAsync()
    {
        var equipos = await equipoRepository.GetAllAsync();
        return equipos.Select(ToDto);
    }

    public async Task<EquipoDto?> GetByIdAsync(int id)
    {
        var equipo = await equipoRepository.GetByIdAsync(id);
        return equipo is null ? null : ToDto(equipo);
    }

    public async Task<EquipoDto> CreateAsync(CrearEquipoDto dto)
    {
        await ValidarAsync(dto.Nombre, dto.CiudadId, dto.LigaId);

        var equipo = new Equipo { Nombre = dto.Nombre, UrlEscudo = dto.UrlEscudo, CiudadId = dto.CiudadId, LigaId = dto.LigaId };
        await equipoRepository.AddAsync(equipo);
        await equipoRepository.SaveChangesAsync();
        equipo = await equipoRepository.GetByIdAsync(equipo.Id);
        return ToDto(equipo!);
    }

    public async Task<bool> UpdateAsync(int id, ActualizarEquipoDto dto)
    {
        var equipo = await equipoRepository.GetByIdAsync(id);
        if (equipo is null) return false;

        await ValidarAsync(dto.Nombre, dto.CiudadId, dto.LigaId);

        equipo.Nombre = dto.Nombre;
        equipo.UrlEscudo = dto.UrlEscudo;
        equipo.CiudadId = dto.CiudadId;
        equipo.LigaId = dto.LigaId;
        equipoRepository.Update(equipo);
        return await equipoRepository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var equipo = await equipoRepository.GetByIdAsync(id);
        if (equipo is null) return false;

        equipoRepository.Remove(equipo);
        return await equipoRepository.SaveChangesAsync();
    }

    private async Task ValidarAsync(string nombre, int ciudadId, int ligaId)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new BusinessRuleException("El nombre del equipo es obligatorio.");

        var ciudad = await ciudadRepository.GetByIdAsync(ciudadId);
        if (ciudad is null)
            throw new BusinessRuleException("La ciudad indicada no existe.");

        var liga = await ligaRepository.GetByIdAsync(ligaId);
        if (liga is null)
            throw new BusinessRuleException("La liga indicada no existe.");

        if (ciudad.PaisId != liga.PaisId)
            throw new BusinessRuleException("La ciudad y la liga del equipo deben pertenecer al mismo país.");
    }

    private static EquipoDto ToDto(Equipo equipo) =>
        new(equipo.Id, equipo.Nombre, equipo.UrlEscudo, equipo.CiudadId, equipo.Ciudad.Nombre,
            equipo.LigaId, equipo.Liga.Nombre, equipo.FechaCreacion);
}
