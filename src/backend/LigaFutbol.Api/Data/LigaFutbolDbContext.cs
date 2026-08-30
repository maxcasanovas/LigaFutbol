using LigaFutbol.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Data;

public class LigaFutbolDbContext(DbContextOptions<LigaFutbolDbContext> options) : DbContext(options)
{
    public DbSet<Equipo> Equipos => Set<Equipo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Ciudad).IsRequired().HasMaxLength(150);
        });

        base.OnModelCreating(modelBuilder);
    }
}
