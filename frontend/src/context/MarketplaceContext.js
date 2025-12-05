import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';

const MarketplaceContext = createContext();

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

export const MarketplaceProvider = ({ children }) => {
  const { account, provider, signer } = useWallet();
  const { user, token } = useAuth();
  
  const [contract, setContract] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    aiModel: '',
    difficulty: '',
    search: '',
    sortBy: 'createdAt'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Contract addresses (update after deployment)
  const CONTRACT_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS;
  
  // Contract ABI (simplified - include full ABI in production)
  const CONTRACT_ABI = [
    "function listPrompt(string memory _title, uint256 _price) external returns (uint256)",
    "function purchasePrompt(uint256 _promptId) external payable",
    "function getPrompt(uint256 _promptId) external view returns (uint256 id, string memory title, address creator, uint256 price, bool isActive, uint256 purchaseCount, uint256 createdAt)",
    "function hasUserPurchased(uint256 _promptId, address _buyer) external view returns (bool)",
    "function getCreatorPrompts(address _creator) external view returns (uint256[] memory)",
    "function getUserPurchases(address _buyer) external view returns (uint256[] memory)",
    "function delistPrompt(uint256 _promptId) external",
    "function updatePromptPrice(uint256 _promptId, uint256 _newPrice) external",
    "function withdrawEarnings() external",
    "function getCreatorEarnings(address _creator) external view returns (uint256)",
    "event PromptListed(uint256 indexed promptId, string title, address indexed creator, uint256 price, uint256 timestamp)",
    "event PromptPurchased(uint256 indexed promptId, address indexed buyer, address indexed creator, uint256 price, uint256 platformFee, uint256 creatorEarning, uint256 timestamp)"
  ];

  // Initialize contract
  useEffect(() => {
    if (provider && CONTRACT_ADDRESS) {
      try {
        const marketplaceContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer || provider
        );
        setContract(marketplaceContract);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    }
  }, [provider, signer, CONTRACT_ADDRESS]);

  // Load prompts from backend
  const loadPrompts = async (options = {}) => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        ...options
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(`${API_URL}/prompts`, { params });

      if (response.data.success) {
        setPrompts(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  // Search prompts
  const searchPrompts = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/prompts/search`, {
        params: { q: query, page: 1, limit: pagination.limit }
      });

      if (response.data.success) {
        setPrompts(response.data.data);
        setFilters(prev => ({ ...prev, search: query }));
      }
    } catch (error) {
      console.error('Error searching prompts:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Get prompt by ID
  const getPromptById = async (promptId) => {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.get(`${API_URL}/prompts/${promptId}`, config);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load prompt details');
      return null;
    }
  };

  // Create prompt (list on marketplace)
  const createPrompt = async (promptData) => {
    if (!user || !token) {
      toast.error('Please login to create a prompt');
      return null;
    }

    if (!contract || !signer) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      setLoading(true);
      
      // Step 1: List on blockchain
      toast.loading('Listing prompt on blockchain...');
      const priceInWei = ethers.parseEther(promptData.priceInMatic);
      const tx = await contract.listPrompt(promptData.title, priceInWei);
      const receipt = await tx.wait();
      
      // Get promptId from event
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'PromptListed';
        } catch {
          return false;
        }
      });
      
      const parsedEvent = contract.interface.parseLog(event);
      const blockchainId = parsedEvent.args.promptId.toString();
      
      toast.dismiss();
      toast.success('Blockchain transaction successful!');

      // Step 2: Save to backend
      toast.loading('Saving prompt details...');
      const response = await axios.post(
        `${API_URL}/prompts`,
        {
          ...promptData,
          price: priceInWei.toString(),
          blockchainId,
          transactionHash: receipt.hash
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.dismiss();
      
      if (response.data.success) {
        toast.success('Prompt created successfully!');
        return response.data.data;
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error creating prompt:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create prompt');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Purchase prompt
  const purchasePrompt = async (prompt) => {
    if (!user || !token) {
      toast.error('Please login to purchase');
      return false;
    }

    if (!contract || !signer) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      
      // Step 1: Purchase on blockchain
      toast.loading('Processing purchase on blockchain...');
      const tx = await contract.purchasePrompt(prompt.blockchainId, {
        value: prompt.price
      });
      const receipt = await tx.wait();
      
      toast.dismiss();
      toast.success('Blockchain transaction successful!');

      // Step 2: Record purchase in backend
      toast.loading('Verifying purchase...');
      const initResponse = await axios.post(
        `${API_URL}/purchases/initiate`,
        {
          promptId: prompt._id,
          transactionHash: receipt.hash,
          price: prompt.price
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (initResponse.data.success) {
        const purchaseId = initResponse.data.data._id;
        
        // Step 3: Verify transaction
        const verifyResponse = await axios.post(
          `${API_URL}/purchases/${purchaseId}/verify`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        toast.dismiss();
        
        if (verifyResponse.data.success) {
          toast.success('Purchase successful! You now have access to the prompt.');
          return true;
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error purchasing prompt:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Purchase failed');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get user's purchases
  const getMyPurchases = async () => {
    if (!token) return [];

    try {
      const response = await axios.get(`${API_URL}/purchases/my-purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  };

  // Get user's created prompts
  const getMyPrompts = async () => {
    if (!token) return [];

    try {
      const response = await axios.get(`${API_URL}/prompts/user/my-prompts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user prompts:', error);
      return [];
    }
  };

  // Get creator earnings
  const getEarnings = async () => {
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/purchases/earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      return null;
    }
  };

  // Withdraw earnings (blockchain)
  const withdrawEarnings = async () => {
    if (!contract || !signer) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      toast.loading('Withdrawing earnings...');
      
      const tx = await contract.withdrawEarnings();
      await tx.wait();
      
      toast.dismiss();
      toast.success('Earnings withdrawn successfully!');
      return true;
    } catch (error) {
      toast.dismiss();
      console.error('Error withdrawing earnings:', error);
      toast.error('Failed to withdraw earnings');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      aiModel: '',
      difficulty: '',
      search: '',
      sortBy: 'createdAt'
    });
  };

  const value = {
    contract,
    prompts,
    loading,
    filters,
    pagination,
    loadPrompts,
    searchPrompts,
    getPromptById,
    createPrompt,
    purchasePrompt,
    getMyPurchases,
    getMyPrompts,
    getEarnings,
    withdrawEarnings,
    updateFilters,
    resetFilters
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
