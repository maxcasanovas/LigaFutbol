using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaisesController(IPaisService paisService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<IEnumerable<PaisDto>>> GetAll() =>
        Ok(await paisService.GetAllAsync());

    [HttpGet("{id:int}")]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<PaisDto>> GetById(int id)
    {
        var pais = await paisService.GetByIdAsync(id);
        return pais is null ? NotFound() : Ok(pais);
    }

    [HttpGet("nombre/{nombre}")]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<PaisDto>> GetByName(string nombre)
    {
        var pais = await paisService.GetByNombreAsync(nombre);
        return pais is null ? NotFound() : Ok(pais);
    }

    [HttpPost]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<ActionResult<PaisDto>> Create(CrearPaisDto dto)
    {
        try
        {
            var pais = await paisService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = pais.Id }, pais);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<IActionResult> Update(int id, ActualizarPaisDto dto)
    {
        try
        {
            var actualizado = await paisService.UpdateAsync(id, dto);
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
            var eliminado = await paisService.DeleteAsync(id);
            return eliminado ? NoContent() : NotFound();
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
