using Microsoft.Extensions.DependencyInjection;
using Application.Profiles;
using Infrastructure;
using Infrastructure.Repositories;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Application.Services;
using Domain.Entities;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Application.Services;


var builder = WebApplication.CreateBuilder(args);

// Load connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Register AppDbContext with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register Generic Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IRepository<Budget>, Repository<Budget>>();
builder.Services.AddScoped<IRepository<Transaction>, Repository<Transaction>>();
builder.Services.AddScoped<IRepository<Category>, Repository<Category>>();

// Register Services
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>(); // Add this line for CategoryService
builder.Services.AddScoped<IAuthService, AuthService>();

// Add controllers
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Budget Tracker API", Version = "v1" });
});

// Enable CORS (if frontend will consume API on a different port)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyHeader()
               .AllowAnyMethod());
});

// Add AutoMapper (make sure your MappingProfile is in the correct namespace)
builder.Services.AddAutoMapper(typeof(MappingProfile));

var app = builder.Build();

// Use Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Budget Tracker API V1");
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
