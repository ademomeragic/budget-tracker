using Application.Interfaces;
using Application.Dtos;  // Import DTOs namespace
using AutoMapper;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IMapper _mapper;  // AutoMapper instance

        public UserService(IRepository<User> userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        // Get a user by ID and return as DTO
        public async Task<UserResponse> GetByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) 
            {
                return null; // Consider returning a custom exception or a not found response
            }

            // Map User entity to UserResponse DTO
            return _mapper.Map<UserResponse>(user);
        }

        // Get all users and return as a list of DTOs
        public async Task<IEnumerable<UserResponse>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserResponse>>(users);
        }

        // Add a new user (from CreateUserDTO)
        public async Task AddAsync(CreateUserRequest createUserDTO)
        {
            // Validate DTO before mapping (e.g., check if email already exists)
            if (string.IsNullOrWhiteSpace(createUserDTO.Email)) 
            {
                throw new ArgumentException("Email is required.");
            }

            var existingUser = await _userRepository.GetAllAsync();
            if (existingUser.Any(u => u.Email == createUserDTO.Email))
            {
                throw new InvalidOperationException("User with this email already exists.");
            }

            // Map CreateUserDTO to User entity
            var user = _mapper.Map<User>(createUserDTO);
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        // Update an existing user (from UpdateUserDTO)
        public async Task UpdateAsync(UpdateUserRequest updateUserDTO)
        {
            var user = await _userRepository.GetByIdAsync(updateUserDTO.Id);
            if (user == null) 
            {
                throw new Exception("User not found.");
            }

            // Check for any other data consistency before mapping
            if (string.IsNullOrWhiteSpace(updateUserDTO.Email)) 
            {
                throw new ArgumentException("Email cannot be empty.");
            }

            // Map UpdateUserDTO to User entity
            _mapper.Map(updateUserDTO, user);
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        // Delete a user by ID
        public async Task DeleteAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) 
            {
                throw new Exception("User not found.");
            }

            await _userRepository.DeleteAsync(id);
            await _userRepository.SaveChangesAsync();
        }
    }
}
