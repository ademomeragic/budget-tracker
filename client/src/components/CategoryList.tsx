// src/components/CategoryList.tsx
import React, { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "../services/CategoryServices";
import { CategoryResponse } from "../types/Category";

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id: number | undefined) => {
    if (id === undefined) {
      console.error("Category ID is undefined");
      return;
    }
    try {
      await deleteCategory(id);
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div>
      <h2>Category List</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <button onClick={() => handleDelete(category.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
