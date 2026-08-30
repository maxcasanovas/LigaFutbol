using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Services.Interfaces;

namespace LigaFutbol.Api.Services;

public class EquipoService(IEquipoRepository equipoRepository) : IEquipoService
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
        var equipo = new Equipo { Nombre = dto.Nombre, UrlEscudo = dto.UrlEscudo, CiudadId = dto.CiudadId };
        await equipoRepository.AddAsync(equipo);
        await equipoRepository.SaveChangesAsync();
        equipo = await equipoRepository.GetByIdAsync(equipo.Id);
        return ToDto(equipo!);
    }

    public async Task<bool> UpdateAsync(int id, ActualizarEquipoDto dto)
    {
        var equipo = await equipoRepository.GetByIdAsync(id);
        if (equipo is null) return false;

        equipo.Nombre = dto.Nombre;
        equipo.UrlEscudo = dto.UrlEscudo;
        equipo.CiudadId = dto.CiudadId;
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

    private static EquipoDto ToDto(Equipo equipo) =>
        new(equipo.Id, equipo.Nombre, equipo.UrlEscudo, equipo.CiudadId, equipo.Ciudad.Nombre, equipo.FechaCreacion);
}
