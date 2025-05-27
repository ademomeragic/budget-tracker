using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyCodeToWallet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "CurrencyCode",
        table: "Wallets",
        type: "nvarchar(3)",
        maxLength: 3,
        nullable: false,
        defaultValue: "BAM");
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(
        name: "CurrencyCode",
        table: "Wallets");
}

    }
}
