import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  productCounts
}) {
  return (
    <div className="filter-bar-wrapper">
      <div className="category-chips-list">
        {categories.map((cat) => {
          const count = productCounts[cat] || 0;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`category-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              <span className="chip-label">{cat === 'ALL' ? 'All Products' : cat}</span>
              <span className="chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="sort-container">
        <SlidersHorizontal size={16} className="sort-icon" />
        <select
          id="sort-select"
          className="sort-dropdown"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="featured">Featured / Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="stock-desc">In-Stock First</option>
        </select>
      </div>
    </div>
  );
}
