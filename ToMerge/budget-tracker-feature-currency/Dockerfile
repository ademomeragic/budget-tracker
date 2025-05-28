# Use the .NET 8 SDK image to build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the entire solution
COPY . .

# Restore
RUN dotnet restore "BudgetTracker.Api/BudgetTracker.Api.csproj"

# Build and publish the API project
RUN dotnet publish "BudgetTracker.Api/BudgetTracker.Api.csproj" -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "BudgetTracker.Api.dll"]
