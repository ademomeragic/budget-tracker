# Use the base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Use the SDK image to build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY BudgetTracker.sln ./
COPY BudgetTracker.Api/BudgetTracker.Api.csproj BudgetTracker.Api/
COPY BudgetTracker.Application/BudgetTracker.Application.csproj BudgetTracker.Application/
COPY BudgetTracker.Domain/BudgetTracker.Domain.csproj BudgetTracker.Domain/
COPY BudgetTracker.Infrastructure/BudgetTracker.Infrastructure.csproj BudgetTracker.Infrastructure/
COPY BudgetTracker.Tests/BudgetTracker.Tests.csproj BudgetTracker.Tests/

# Restore dependencies
RUN dotnet restore BudgetTracker.sln

# Copy everything and build
COPY . .
WORKDIR /src/BudgetTracker.Api
RUN dotnet build -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BudgetTracker.Api.dll"]
