using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LigaFutbol.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLigaEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LigaId",
                table: "Equipos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Ligas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaisId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ligas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ligas_Paises_PaisId",
                        column: x => x.PaisId,
                        principalTable: "Paises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Equipos_LigaId",
                table: "Equipos",
                column: "LigaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ligas_PaisId",
                table: "Ligas",
                column: "PaisId");

            migrationBuilder.AddForeignKey(
                name: "FK_Equipos_Ligas_LigaId",
                table: "Equipos",
                column: "LigaId",
                principalTable: "Ligas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Equipos_Ligas_LigaId",
                table: "Equipos");

            migrationBuilder.DropTable(
                name: "Ligas");

            migrationBuilder.DropIndex(
                name: "IX_Equipos_LigaId",
                table: "Equipos");

            migrationBuilder.DropColumn(
                name: "LigaId",
                table: "Equipos");
        }
    }
}
