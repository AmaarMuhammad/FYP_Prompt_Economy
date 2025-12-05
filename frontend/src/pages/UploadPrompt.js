import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import './UploadPrompt.css';

const UploadPrompt = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPrompt, loading } = useMarketplace();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Writing',
    tags: '',
    priceInMatic: '',
    sampleOutput: '',
    aiModel: 'Any',
    difficulty: 'Intermediate',
    language: 'English'
  });

  const [errors, setErrors] = useState({});

  const categories = [
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
    'ChatGPT',
    'GPT-4',
    'Claude',
    'Midjourney',
    'DALL-E',
    'Stable Diffusion',
    'Other',
    'Any'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required';
    } else if (formData.content.length > 10000) {
      newErrors.content = 'Content must be less than 10000 characters';
    }

    if (!formData.priceInMatic || parseFloat(formData.priceInMatic) <= 0) {
      newErrors.priceInMatic = 'Please enter a valid price greater than 0';
    }

    if (formData.sampleOutput && formData.sampleOutput.length > 1000) {
      newErrors.sampleOutput = 'Sample output must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert tags string to array
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const promptData = {
      ...formData,
      tags: tagsArray
    };

    const result = await createPrompt(promptData);

    if (result) {
      navigate('/marketplace');
    }
  };

  if (!user) {
    return (
      <div className="upload-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to upload prompts</p>
          <button onClick={() => navigate('/login')} className="login-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Your Prompt</h1>
        <p>Share your AI prompts with the community and earn MATIC</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">
            Prompt Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Professional Email Writer for Business Communication"
            maxLength={200}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="char-count">{formData.title.length}/200</span>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what your prompt does, what problem it solves, and who it's for..."
            rows={4}
            maxLength={2000}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-count">{formData.description.length}/2000</span>
        </div>

        {/* Prompt Content */}
        <div className="form-group">
          <label htmlFor="content">
            Prompt Content <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter the actual prompt text that buyers will receive..."
            rows={8}
            maxLength={10000}
            className={errors.content ? 'error' : ''}
          />
          <p className="field-hint">
            This is the actual prompt that will be delivered to buyers. Be detailed and specific.
          </p>
          {errors.content && <span className="error-message">{errors.content}</span>}
          <span className="char-count">{formData.content.length}/10000</span>
        </div>

        {/* Sample Output */}
        <div className="form-group">
          <label htmlFor="sampleOutput">
            Sample Output (Optional)
          </label>
          <textarea
            id="sampleOutput"
            name="sampleOutput"
            value={formData.sampleOutput}
            onChange={handleChange}
            placeholder="Provide a sample of what output this prompt generates..."
            rows={4}
            maxLength={1000}
          />
          <p className="field-hint">
            Show potential buyers what kind of results they can expect
          </p>
          <span className="char-count">{formData.sampleOutput.length}/1000</span>
        </div>

        {/* Category and AI Model Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="aiModel">
              AI Model
            </label>
            <select
              id="aiModel"
              name="aiModel"
              value={formData.aiModel}
              onChange={handleChange}
            >
              {aiModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Difficulty and Language Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="difficulty">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language">
              Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="English"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">
            Tags (Optional)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., email, business, professional, communication (comma-separated)"
          />
          <p className="field-hint">
            Add relevant tags to help buyers find your prompt. Separate with commas.
          </p>
        </div>

        {/* Price */}
        <div className="form-group">
          <label htmlFor="priceInMatic">
            Price (MATIC) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="priceInMatic"
            name="priceInMatic"
            value={formData.priceInMatic}
            onChange={handleChange}
            placeholder="0.01"
            step="0.001"
            min="0"
            className={errors.priceInMatic ? 'error' : ''}
          />
          {errors.priceInMatic && <span className="error-message">{errors.priceInMatic}</span>}
          <p className="field-hint">
            You'll receive 95% of the sale price. Platform takes 5% fee.
          </p>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPrompt;
