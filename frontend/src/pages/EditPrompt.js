import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { uploadImageToIPFS } from '../utils/pinata';
import './UploadPrompt.css'; // We can reuse the same CSS!

const EditPrompt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPromptById, updatePrompt, loading } = useMarketplace();
  
  const [imageFile, setImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    sampleOutput: '',
    aiModel: '',
    difficulty: '',
    language: ''
  });

  useEffect(() => {
    const fetchPrompt = async () => {
      const data = await getPromptById(id);
      if (data) {
        // Security check: Only the creator can edit
        const isOwner = user && data.creator && (
          data.creator._id === user.id || 
          data.creator._id === user._id || 
          data.creator.walletAddress?.toLowerCase() === user.walletAddress?.toLowerCase()
        );

        if (!isOwner) {
          navigate('/marketplace');
          return;
        }

        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags ? data.tags.join(', ') : '',
          sampleOutput: data.sampleOutput || '',
          aiModel: data.aiModel,
          difficulty: data.difficulty,
          language: data.language || 'English'
        });
      }
      setPageLoading(false);
    };
    
    if (user) fetchPrompt();
  }, [id, getPromptById, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalSampleOutput = formData.sampleOutput;
      const isImageModel = ['Midjourney', 'DALL-E', 'Stable Diffusion'].includes(formData.aiModel);

      if (isImageModel && imageFile) {
        setIsUploadingImage(true);
        finalSampleOutput = await uploadImageToIPFS(imageFile); 
        setIsUploadingImage(false);
      }

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updatedData = {
        ...formData,
        tags: tagsArray,
        sampleOutput: finalSampleOutput
      };

      const success = await updatePrompt(id, updatedData);
      if (success) {
        navigate(`/prompts/${id}`); // Send them back to the detail page
      }
    } catch (error) {
      setIsUploadingImage(false);
      console.error("Update failed:", error);
    }
  };

  if (pageLoading) return <div className="upload-container"><p>Loading editor...</p></div>;

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Edit Prompt Details</h1>
        <p>Update your marketing metadata. (Price and Content are locked on the blockchain).</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Prompt Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
        </div>

        {/* Dynamic Image Upload matching your new UI */}
        <div className="form-group">
          <label>Update Sample Output</label>
          {['Midjourney', 'DALL-E', 'Stable Diffusion'].includes(formData.aiModel) ? (
            <div className="file-upload-container" style={{ marginTop: '10px' }}>
              <label 
                htmlFor="imageFile" 
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '32px 20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease',
                  border: imageFile ? '2px solid #10B981' : '2px dashed rgba(37, 99, 235, 0.4)',
                  background: imageFile ? 'rgba(16, 185, 129, 0.1)' : 'rgba(10, 10, 15, 0.4)',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
                  {imageFile ? imageFile.name : 'Click to Replace Cover Image'}
                </span>
              </label>
              <input type="file" id="imageFile" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
            </div>
          ) : (
            <textarea name="sampleOutput" value={formData.sampleOutput} onChange={handleChange} rows={4} />
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Writing">Writing</option>
              <option value="Coding">Coding</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>AI Model</label>
            <select name="aiModel" value={formData.aiModel} onChange={handleChange}>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Midjourney">Midjourney</option>
              <option value="DALL-E">DALL-E</option>
              <option value="Claude">Claude</option>
              <option value="Any">Any</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tags (Comma separated)</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/prompts/${id}`)} className="cancel-button">Cancel</button>
          <button type="submit" className="submit-button" disabled={loading || isUploadingImage}>
            {loading || isUploadingImage ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPrompt;