using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquiposController(IEquipoService equipoService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EquipoDto>>> GetAll() =>
        Ok(await equipoService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipoDto>> GetById(int id)
    {
        var equipo = await equipoService.GetByIdAsync(id);
        return equipo is null ? NotFound() : Ok(equipo);
    }

    [HttpPost]
    public async Task<ActionResult<EquipoDto>> Create(CrearEquipoDto dto)
    {
        var equipo = await equipoService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = equipo.Id }, equipo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ActualizarEquipoDto dto)
    {
        var actualizado = await equipoService.UpdateAsync(id, dto);
        return actualizado ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var eliminado = await equipoService.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
