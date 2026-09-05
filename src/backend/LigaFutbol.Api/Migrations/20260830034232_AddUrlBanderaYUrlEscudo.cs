using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LigaFutbol.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUrlBanderaYUrlEscudo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UrlBandera",
                table: "Paises",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UrlEscudo",
                table: "Equipos",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UrlBandera",
                table: "Paises");

            migrationBuilder.DropColumn(
                name: "UrlEscudo",
                table: "Equipos");
        }
    }
}
