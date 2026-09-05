using LigaFutbol.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LigaFutbol.Api.Data;

public class LigaFutbolDbContext(DbContextOptions<LigaFutbolDbContext> options) : DbContext(options)
{
    public DbSet<Pais> Paises => Set<Pais>();
    public DbSet<Ciudad> Ciudades => Set<Ciudad>();
    public DbSet<Liga> Ligas => Set<Liga>();
    public DbSet<Equipo> Equipos => Set<Equipo>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pais>(entity =>
        {
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(p => p.UrlBandera).IsRequired().HasMaxLength(500);
        });

        modelBuilder.Entity<Ciudad>(entity =>
        {
            entity.Property(c => c.Nombre).IsRequired().HasMaxLength(150);

            entity.HasOne(c => c.Pais)
                .WithMany(p => p.Ciudades)
                .HasForeignKey(c => c.PaisId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Liga>(entity =>
        {
            entity.Property(l => l.Nombre).IsRequired().HasMaxLength(150);

            entity.HasOne(l => l.Pais)
                .WithMany(p => p.Ligas)
                .HasForeignKey(l => l.PaisId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(e => e.UrlEscudo).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Ciudad)
                .WithMany(c => c.Equipos)
                .HasForeignKey(e => e.CiudadId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Liga)
                .WithMany(l => l.Equipos)
                .HasForeignKey(e => e.LigaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Rol).IsRequired().HasConversion<string>().HasMaxLength(20);

            entity.HasIndex(u => u.Email).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
