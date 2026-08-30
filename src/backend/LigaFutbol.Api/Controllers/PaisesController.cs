using LigaFutbol.Api.Models.DTOs;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LigaFutbol.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaisesController(IPaisService paisService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaisDto>>> GetAll() =>
        Ok(await paisService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaisDto>> GetById(int id)
    {
        var pais = await paisService.GetByIdAsync(id);
        return pais is null ? NotFound() : Ok(pais);
    }

     [HttpGet("{nombre:string}")]
    public async Task<ActionResult<PaisDto>> GetByName(string nombre)
    {
        var pais = await paisService.GetByNombreAsync(nombre);
        return pais is null ? NotFound() : Ok(pais);
    }

    [HttpPost]
    public async Task<ActionResult<PaisDto>> Create(CrearPaisDto dto)
    {
        var pais = await paisService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = pais.Id }, pais);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ActualizarPaisDto dto)
    {
        var actualizado = await paisService.UpdateAsync(id, dto);
        return actualizado ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var eliminado = await paisService.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
