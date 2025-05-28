using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExchangeRates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateTable(
        name: "ExchangeRates",
        columns: table => new
        {
            Id = table.Column<int>(type: "int", nullable: false)
                .Annotation("SqlServer:Identity", "1, 1"),
            BaseCurrency = table.Column<string>(type: "nvarchar(max)", nullable: false),
            TargetCurrency = table.Column<string>(type: "nvarchar(max)", nullable: false),
            Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
        },
        constraints: table =>
        {
            table.PrimaryKey("PK_ExchangeRates", x => x.Id);
        });
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropTable(
        name: "ExchangeRates");
}


    
    }
}
