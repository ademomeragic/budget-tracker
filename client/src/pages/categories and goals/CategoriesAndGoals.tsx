import React from 'react';
import Goals from '../goals/goals'; 
import Categories from '../categories/categories';
import './CategoriesAndGoals.css'; 

const GoalsAndCategories = () => {
  return (
    <div className="goals-and-categories">
      <div className="section">
        <Categories />
      </div>
      <div className="section">
        <Goals />
      </div>
    </div>
  );
};

export default GoalsAndCategories;
