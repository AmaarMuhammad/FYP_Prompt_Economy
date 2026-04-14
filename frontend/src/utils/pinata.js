import axios from 'axios';

// The URL to pin a JSON object to Pinata
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
// NEW: The URL to pin an actual file (image) to Pinata
const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const uploadPromptToIPFS = async (promptData) => {
  // ... (Keep your existing uploadPromptToIPFS function exactly as it is) ...
  const dataToUpload = {
    pinataOptions: {
      cidVersion: 1
    },
    pinataMetadata: {
      name: `PromptEconomy_${promptData.title.replace(/\s+/g, '_')}`,
      keyvalues: {
        aiModel: promptData.aiModel || 'General',
        category: promptData.category || 'General'
      }
    },
    pinataContent: {
      title: promptData.title,
      description: promptData.description,
      secretPromptText: promptData.promptText,
      aiModel: promptData.aiModel,
      category: promptData.category,
      difficulty: promptData.difficulty,
      createdAt: new Date().toISOString()
    }
  };

  try {
    const response = await axios.post(PINATA_JSON_URL, dataToUpload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`
      }
    });
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error("❌ Error uploading to Pinata:", error);
    throw new Error("Failed to upload prompt data to IPFS.");
  }
};

// ==========================================
// NEW: Upload an Image File to IPFS
// ==========================================
export const uploadImageToIPFS = async (file) => {
  if (!file) return null;

  // We must use FormData to send files via HTTP
  const formData = new FormData();
  formData.append('file', file);

  // Optional: Add metadata so you can identify the image in your Pinata dashboard
  const metadata = JSON.stringify({
    name: `PromptEconomy_Preview_${file.name}`,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  try {
    const response = await axios.post(PINATA_FILE_URL, formData, {
      maxBodyLength: 'Infinity', 
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`
      }
    });

    const ipfsHash = response.data.IpfsHash;
    console.log("✅ Image pinned to IPFS. Hash:", ipfsHash);
    
    // Return a gateway URL so the browser can display the image easily on the PromptCard
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

  } catch (error) {
    console.error("❌ Error uploading image to Pinata:", error);
    throw new Error("Failed to upload image to IPFS.");
  }
};