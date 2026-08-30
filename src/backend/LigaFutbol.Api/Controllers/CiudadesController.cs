using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CiudadesController(ICiudadService ciudadService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CiudadDto>>> GetAll() =>
        Ok(await ciudadService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CiudadDto>> GetById(int id)
    {
        var ciudad = await ciudadService.GetByIdAsync(id);
        return ciudad is null ? NotFound() : Ok(ciudad);
    }

    [HttpPost]
    public async Task<ActionResult<CiudadDto>> Create(CrearCiudadDto dto)
    {
        var ciudad = await ciudadService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = ciudad.Id }, ciudad);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ActualizarCiudadDto dto)
    {
        var actualizado = await ciudadService.UpdateAsync(id, dto);
        return actualizado ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var eliminado = await ciudadService.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
