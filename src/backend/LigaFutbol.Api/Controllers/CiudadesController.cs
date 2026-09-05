using LigaFutbol.Api.Exceptions;
using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CiudadesController(ICiudadService ciudadService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<IEnumerable<CiudadDto>>> GetAll() =>
        Ok(await ciudadService.GetAllAsync());

    [HttpGet("{id:int}")]
    [Authorize(Policy = Policies.Lectura)]
    public async Task<ActionResult<CiudadDto>> GetById(int id)
    {
        var ciudad = await ciudadService.GetByIdAsync(id);
        return ciudad is null ? NotFound() : Ok(ciudad);
    }

    [HttpPost]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<ActionResult<CiudadDto>> Create(CrearCiudadDto dto)
    {
        try
        {
            var ciudad = await ciudadService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = ciudad.Id }, ciudad);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.Escritura)]
    public async Task<IActionResult> Update(int id, ActualizarCiudadDto dto)
    {
        try
        {
            var actualizado = await ciudadService.UpdateAsync(id, dto);
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
            var eliminado = await ciudadService.DeleteAsync(id);
            return eliminado ? NoContent() : NotFound();
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
