using System.Text;
using LigaFutbol.Api.Data;
using LigaFutbol.Api.Extensions;
using LigaFutbol.Api.Models.Entities;
using LigaFutbol.Api.Repositories;
using LigaFutbol.Api.Repositories.Interfaces;
using LigaFutbol.Api.Security;
using LigaFutbol.Api.Services;
using LigaFutbol.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(options =>
{
    // Convierte los tokens [controller]/[action] a snake_case (ej: MiRecurso -> mi_recurso)
    options.Conventions.Add(new RouteTokenTransformerConvention(new SnakeCaseParameterTransformer()));
});

builder.Services.AddRouting(options =>
{
    // Fuerza minúsculas en toda la URL generada (segmentos y query string)
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});

builder.Services.AddDbContext<LigaFutbolDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IEquipoRepository, EquipoRepository>();
builder.Services.AddScoped<IEquipoService, EquipoService>();
builder.Services.AddScoped<IPaisRepository, PaisRepository>();
builder.Services.AddScoped<IPaisService, PaisService>();
builder.Services.AddScoped<ICiudadRepository, CiudadRepository>();
builder.Services.AddScoped<ICiudadService, CiudadService>();
builder.Services.AddScoped<ILigaRepository, LigaRepository>();
builder.Services.AddScoped<ILigaService, LigaService>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<JwtTokenGenerator>();

var jwtSettings = builder.Configuration.GetSection("Jwt");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.Lectura, policy => policy.RequireRole(
        nameof(RolUsuario.Admin), nameof(RolUsuario.Editor), nameof(RolUsuario.Lector)))
    .AddPolicy(Policies.Escritura, policy => policy.RequireRole(
        nameof(RolUsuario.Admin), nameof(RolUsuario.Editor)))
    .AddPolicy(Policies.GestionUsuarios, policy => policy.RequireRole(
        nameof(RolUsuario.Admin)));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "LigaFutbol API";
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Si la tabla de usuarios esta vacia, crea el primer Admin a partir de la config
// (necesario porque el autoregistro publico solo permite el rol Lector).
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<LigaFutbolDbContext>();
    var seedConfig = app.Configuration.GetSection("Seed");
    var adminEmail = seedConfig["AdminEmail"];
    var adminPassword = seedConfig["AdminPassword"];

    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword)
        && !await context.Usuarios.AnyAsync())
    {
        context.Usuarios.Add(new Usuario
        {
            Email = adminEmail,
            PasswordHash = PasswordHasher.Hash(adminPassword),
            Rol = RolUsuario.Admin
        });
        await context.SaveChangesAsync();
    }
}

app.Run();
