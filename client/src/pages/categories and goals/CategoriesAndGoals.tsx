import React from 'react';
import Goals from '../goals/goals'; 
import Categories from '../categories/categories';
import ChatWidget from '../../components/chat/ChatWidget';

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
      <div className="section chat-widget">
        <ChatWidget />
      </div>
    </div>
  );
};

export default GoalsAndCategories;
