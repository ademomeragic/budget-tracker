import React, { useEffect, useState } from 'react';
import api from '../../api/api'; // ensures credentials & baseURL are applied

// import './categories.css';

interface Category {
  id: number;
  name: string;
  type: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/category?type=${type}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  const createCategory = async () => {
    try {
      await api.post('/category', { name, type });
      setName('');
      fetchCategories(); // Refresh after creation
    } catch (error) {
      console.error('Error creating category', error);
    }
  };

   const deleteCategory = async (id: number) => {
    try {
      await api.delete(`/category/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  return (
    <div className="categories-page">
      <h2 className="page-title">Manage Categories</h2>

      <div className="type-selector">
        <label>
          Show:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>

      <div className="category-form">
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createCategory}>Add Category</button>
      </div>

      <ul className="category-list">
        {categories.map((cat) => (
          <li key={cat.id} className="category-item">
            <span className="cat-name">{cat.name}</span>
            <span className={`cat-type ${cat.type}`}>{cat.type}</span>
            <button
              className="delete-btn"
              onClick={() => deleteCategory(cat.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
