// src/components/CreateCategoryForm.tsx
import React, { useState } from "react";
import { createCategory } from "../services/CategoryServices";
import { CreateCategoryRequest } from "../types/Category";

const CreateCategoryForm: React.FC = () => {
  const [categoryName, setCategoryName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) {
      alert("Category name is required");
      return;
    }

    const newCategory: CreateCategoryRequest = { name: categoryName };

    try {
      await createCategory(newCategory);
      alert("Category created successfully!");
      setCategoryName("");
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    }
  };

  return (
    <div>
      <h2>Create Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name:</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Category</button>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
