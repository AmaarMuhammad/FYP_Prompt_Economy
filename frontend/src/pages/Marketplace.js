import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import PromptCard from '../components/PromptCard';
import './Marketplace.css';

const Marketplace = () => {
  const { 
    prompts, 
    loading, 
    filters, 
    pagination,
    loadPrompts, 
    updateFilters, 
    resetFilters,
    searchPrompts 
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, [filters.category, filters.sortBy, filters.aiModel, filters.difficulty]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPrompts(searchQuery);
    } else {
      loadPrompts();
    }
  };

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
  };

  const handleResetFilters = () => {
    resetFilters();
    setSearchQuery('');
    loadPrompts();
  };

  const handlePageChange = (newPage) => {
    loadPrompts({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    'All',
    'Writing',
    'Marketing',
    'Coding',
    'Design',
    'Business',
    'Education',
    'Entertainment',
    'Productivity',
    'Research',
    'Other'
  ];

  const aiModels = [
    'All',
    'ChatGPT',
    'GPT-4',
    'Claude',
    'Midjourney',
    'DALL-E',
    'Stable Diffusion',
    'Other',
    'Any'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' }
  ];

  return (
    <div className="marketplace-container">
      {/* Header */}
      <div className="marketplace-header">
        <h1>Prompt Marketplace</h1>
        <p>Discover and purchase high-quality AI prompts from creators worldwide</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Search prompts by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button">Search</button>
          <button 
            type="button" 
            className="filter-toggle-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Filters
          </button>
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value === 'All' ? '' : e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>AI Model</label>
            <select 
              value={filters.aiModel} 
              onChange={(e) => handleFilterChange('aiModel', e.target.value === 'All' ? '' : e.target.value)}
            >
              {aiModels.map(model => (
                <option key={model} value={model === 'All' ? '' : model}>{model}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <select 
              value={filters.difficulty} 
              onChange={(e) => handleFilterChange('difficulty', e.target.value === 'All' ? '' : e.target.value)}
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff === 'All' ? '' : diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={filters.sortBy} 
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <button className="reset-filters-button" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        <span className="stats-text">
          Showing {prompts.length} of {pagination.total} prompts
        </span>
      </div>

      {/* Prompts Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading prompts...</p>
        </div>
      ) : prompts.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <h2>No prompts found</h2>
          <p>Try adjusting your filters or search query</p>
          <button onClick={handleResetFilters} className="reset-button">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="prompts-grid">
            {prompts.map(prompt => (
              <PromptCard key={prompt._id} prompt={prompt} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </div>

              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Marketplace;
