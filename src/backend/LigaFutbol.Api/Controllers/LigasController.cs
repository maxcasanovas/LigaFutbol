using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LigasController(ILigaService ligaService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<IEnumerable<LigaDto>>> GetAll() =>
        Ok(await ligaService.GetAllAsync());

    [HttpGet("{id:int}")]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<LigaDto>> GetById(int id)
    {
        var liga = await ligaService.GetByIdAsync(id);
        return liga is null ? NotFound() : Ok(liga);
    }

    [HttpPost]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<ActionResult<LigaDto>> Create(CrearLigaDto dto)
    {
        try
        {
            var liga = await ligaService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = liga.Id }, liga);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<IActionResult> Update(int id, ActualizarLigaDto dto)
    {
        try
        {
            var actualizado = await ligaService.UpdateAsync(id, dto);
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
        try
        {
            var eliminado = await ligaService.DeleteAsync(id);
            return eliminado ? NoContent() : NotFound();
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
