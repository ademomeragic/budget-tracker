using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationPreferencesToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EnableDeadlineWarnings",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EnableExceededWarnings",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EnableIncomeCongrats",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EnableNearLimitWarnings",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnableDeadlineWarnings",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EnableExceededWarnings",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EnableIncomeCongrats",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EnableNearLimitWarnings",
                table: "AspNetUsers");
        }
    }
}
