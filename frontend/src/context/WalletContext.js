import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to continue');
      window.open('https://metamask.io/download/', '_blank');
      return null;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];

      // Create provider to check network
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const network = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);

      const SEPOLIA_CHAIN_ID = 11155111;
      
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        toast.loading('Switching to Sepolia Testnet...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
          });
          toast.dismiss();
          window.location.reload(); 
          return null; 
        } catch (switchError) {
          toast.dismiss();
          if (switchError.code === 4902) {
            toast.error('Please add the Sepolia network to your MetaMask.');
          } else {
            toast.error('You must switch to Sepolia to use this DApp.');
          }
          return null;
        }
      }

      const web3Signer = await web3Provider.getSigner();

      setAccount(address);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(currentChainId);

      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);

      toast.success('Wallet connected successfully!', { id: 'wallet-connect-toast' });
      return address;

    } catch (error) {
      console.error('Connect wallet error:', error);
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask');
      } else {
        toast.error('Failed to connect wallet');
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []); // <-- Empty array, perfectly clean!

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    toast.success('Wallet disconnected');
  };

  // Sign message for authentication
  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('No signer available');
    }

    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Sign message error:', error);
      if (error.code === 4001) {
        toast.error('Signature request denied');
      } else {
        toast.error('Failed to sign message');
      }
      throw error;
    }
  };

  // Switch network
  const switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        toast.error('Please add this network to MetaMask');
      } else {
        toast.error('Failed to switch network');
      }
      throw error;
    }
  };

  // Handle account change
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        toast('Account changed', {icon: '🔄'});
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(Number(chainId));
      window.location.reload(); // Recommended by MetaMask
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && isMetaMaskInstalled()) {
      connectWallet();
    }
  }, [connectWallet]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connectWallet,
    disconnectWallet,
    signMessage,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};