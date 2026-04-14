import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';
import contractAddresses from '../contracts/contract-address.json';
import { uploadPromptToIPFS } from '../utils/pinata'; // <-- Import Pinata utility

const CONTRACT_ADDRESS = contractAddresses.PromptMarketplace;

// Updated ABI to include Staking and totalStaked
const CONTRACT_ABI = [
  "function listPrompt(string memory _title, string memory _contentURI, uint256 _price) external returns (uint256)",
  "function purchasePrompt(uint256 _promptId) external payable",
  // ✅ UPDATED: getPrompt now returns totalStaked at the end
  "function getPrompt(uint256 _promptId) external view returns (uint256 id, string memory title, string memory contentURI, address creator, uint256 price, bool isActive, uint256 purchaseCount, uint256 createdAt, uint256 totalStaked)",
  "function hasUserPurchased(uint256 _promptId, address _buyer) external view returns (bool)",
  "function getCreatorPrompts(address _creator) external view returns (uint256[] memory)",
  "function getUserPurchases(address _buyer) external view returns (uint256[] memory)",
  "function delistPrompt(uint256 _promptId) external",
  "function updatePromptPrice(uint256 _promptId, uint256 _newPrice) external",
  "function withdrawEarnings() external",
  "function getCreatorEarnings(address _creator) external view returns (uint256)",
  // ✅ NEW: Staking Functions
  "function stakeOnPrompt(uint256 _promptId) external payable",
  "function unstakeFromPrompt(uint256 _promptId) external",
  "function userStakes(uint256 _promptId, address _user) external view returns (uint256)",
  
  "event PromptListed(uint256 indexed promptId, string title, string contentURI, address indexed creator, uint256 price, uint256 timestamp)",
  "event PromptPurchased(uint256 indexed promptId, address indexed buyer, address indexed creator, uint256 price, uint256 platformFee, uint256 creatorEarning, uint256 timestamp)",
  "event PromptStaked(uint256 indexed promptId, address indexed staker, uint256 amount, uint256 totalStakedNow)",
  "event PromptUnstaked(uint256 indexed promptId, address indexed staker, uint256 amount, uint256 totalStakedNow)"
];

const MarketplaceContext = createContext();

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

export const MarketplaceProvider = ({ children }) => {
  const { provider, signer } = useWallet();
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
  }, [provider, signer]);

  const loadPrompts = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        ...options
      };

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
  }, [API_URL, filters, pagination.limit, pagination.page]);

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

  const getPromptById = useCallback(async (promptId) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API_URL}/prompts/${promptId}`, config);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load prompt details');
      return null;
    }
  }, [API_URL, token]);

  // --- UPDATED IPFS CREATE PROMPT FUNCTION ---
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

      // Step 1: Upload to IPFS First!
      toast.loading('Encrypting & uploading to IPFS...');
      const ipfsURI = await uploadPromptToIPFS(promptData);
      toast.dismiss();

      // Step 2: List on blockchain with the new IPFS hash
      toast.loading('Awaiting MetaMask confirmation...');
      const priceInWei = ethers.parseEther(promptData.priceInMatic || promptData.priceInEth || "0"); // Fallbacks for safety
      
      // Note the new signature: title, contentURI, price
      const tx = await contract.listPrompt(promptData.title, ipfsURI, priceInWei);
      
      toast.loading('Mining transaction on Sepolia...', { id: 'mining-toast' });
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
      
      toast.dismiss('mining-toast');
      toast.success('Secured on Blockchain & IPFS!');

      // Step 3: Save metadata to MongoDB for fast searching
      toast.loading('Syncing to frontend database...', { id: 'sync-toast' });
      const response = await axios.post(
        `${API_URL}/prompts`,
        {
          ...promptData,
          creator: user._id || user.id, // Fixed the previous missing creator bug!
          price: priceInWei.toString(),
          ipfsHash: ipfsURI, // Save the IPFS link to Mongo for easy reference
          blockchainId,
          transactionHash: receipt.hash
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.dismiss('sync-toast');
      
      if (response.data.success) {
        toast.success('Prompt live on Marketplace!');
        return response.data.data;
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error creating prompt:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('MetaMask transaction rejected');
      } else if (error.response?.data?.message) {
        toast.error(`Backend Sync Error: ${error.response.data.message}`);
      } else {
        toast.error(error.message || 'Failed to create prompt');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

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
      
      toast.loading('Processing purchase on blockchain...');
      const tx = await contract.purchasePrompt(prompt.blockchainId, {
        value: prompt.price
      });
      const receipt = await tx.wait();
      
      toast.dismiss();
      toast.success('Blockchain transaction successful!');

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

  const getMyPrompts = async () => {
    if (!token) return [];
    try {
      const response = await axios.get(`${API_URL}/prompts/my-prompts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user prompts:', error);
      return [];
    }
  };

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

  const updatePrompt = async (promptId, updatedData) => {
    try {
      setLoading(true);
      toast.loading('Updating prompt metadata...');
      
      const response = await axios.put(`${API_URL}/prompts/${promptId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.dismiss();
      
      if (response.data.success) {
        toast.success('Prompt updated successfully!');
        return true;
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error updating prompt:', error);
      toast.error('Failed to update prompt');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const delistAndDeletePrompt = async ({ mongoId, blockchainId }) => {
    if (!contract || !signer) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      toast.loading('Removing from Blockchain...', { id: 'delist' });
      
      // Step 1: Try to remove from Smart Contract
      try {
        const tx = await contract.delistPrompt(blockchainId);
        await tx.wait();
      } catch (blockchainError) {
        // SELF-HEALING LOGIC: Catch ghost data!
        const errorMsg = blockchainError.reason || blockchainError.message || "";
        
        if (
          errorMsg.includes('already delisted') || 
          errorMsg.includes('does not exist') || 
          errorMsg.includes('reverted')
        ) {
          console.warn("Web3 Ghost Data detected! Bypassing blockchain error and forcing database cleanup...");
          // We don't throw the error here, so the code will naturally continue down to Step 2!
        } else {
          // If it's a real error (like user clicking "Reject" in MetaMask), throw it to stop the process
          throw blockchainError; 
        }
      }
      
      // Step 2: Delete/Deactivate in MongoDB
      // ... (rest of your code continues here)
      // Step 2: Delete/Deactivate in MongoDB
      toast.loading('Syncing database...', { id: 'delist' });
      await axios.delete(`${API_URL}/prompts/${mongoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Prompt successfully removed from Marketplace!', { id: 'delist' });
      return true;
      
    } catch (error) {
      toast.dismiss('delist');
      console.error('Error delisting prompt:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled in MetaMask');
      } else {
        toast.error('Failed to delist prompt');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- NEW STAKING FUNCTION ---
  const stakeOnPrompt = async (blockchainId, amountInMatic) => {
    if (!user || !token) {
      toast.error('Please login to stake');
      return false;
    }

    if (!contract || !signer) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      toast.loading('Staking MATIC on this prompt...');
      
      const amountInWei = ethers.parseEther(amountInMatic.toString());
      const tx = await contract.stakeOnPrompt(blockchainId, {
        value: amountInWei
      });
      
      await tx.wait();
      
      toast.dismiss();
      toast.success('Successfully staked on prompt! You are now validating its quality.');
      return true;
    } catch (error) {
      toast.dismiss();
      console.error('Error staking on prompt:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected in MetaMask');
      } else {
        toast.error('Failed to stake on prompt');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

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
    delistAndDeletePrompt,
    updateFilters,
    resetFilters,
    updatePrompt,
    stakeOnPrompt
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};