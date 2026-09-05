using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquiposController(IEquipoService equipoService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<IEnumerable<EquipoDto>>> GetAll() =>
        Ok(await equipoService.GetAllAsync());

    [HttpGet("{id:int}")]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<EquipoDto>> GetById(int id)
    {
        var equipo = await equipoService.GetByIdAsync(id);
        return equipo is null ? NotFound() : Ok(equipo);
    }

    [HttpPost]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<ActionResult<EquipoDto>> Create(CrearEquipoDto dto)
    {
        try
        {
            var equipo = await equipoService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = equipo.Id }, equipo);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<IActionResult> Update(int id, ActualizarEquipoDto dto)
    {
        try
        {
            var actualizado = await equipoService.UpdateAsync(id, dto);
            return actualizado ? NoContent() : NotFound();
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<IActionResult> Delete(int id)
    {
        var eliminado = await equipoService.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
