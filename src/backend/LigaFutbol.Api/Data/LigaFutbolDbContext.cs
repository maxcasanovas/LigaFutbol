using LigaFutbol.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Data;

public class LigaFutbolDbContext(DbContextOptions<LigaFutbolDbContext> options) : DbContext(options)
{
    public DbSet<Pais> Paises => Set<Pais>();
    public DbSet<Ciudad> Ciudades => Set<Ciudad>();
    public DbSet<Equipo> Equipos => Set<Equipo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pais>(entity =>
        {
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
        });

        modelBuilder.Entity<Ciudad>(entity =>
        {
            entity.Property(c => c.Nombre).IsRequired().HasMaxLength(150);

            entity.HasOne(c => c.Pais)
                .WithMany(p => p.Ciudades)
                .HasForeignKey(c => c.PaisId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);

            entity.HasOne(e => e.Ciudad)
                .WithMany(c => c.Equipos)
                .HasForeignKey(e => e.CiudadId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}
