// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PromptMarketplace
 * @dev Decentralized marketplace for buying, selling, and STAKING on AI prompts
 */
contract PromptMarketplace {
    // Platform fee percentage (5%)
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
    
    address public owner;
    uint256 public promptIdCounter;
    uint256 public totalEarnings; // Platform earnings
    
    struct Prompt {
        uint256 id;
        string title;
        string contentURI;
        address creator;
        uint256 price; // Price in wei
        bool isActive;
        uint256 purchaseCount;
        uint256 createdAt;
        uint256 totalStaked; // <-- NEW: Community Validation Score
    }
    
    struct Purchase {
        uint256 promptId;
        address buyer;
        uint256 price;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(uint256 => Prompt) public prompts;
    mapping(uint256 => mapping(address => bool)) public hasPurchased;
    mapping(address => uint256[]) public creatorPrompts;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256) public creatorEarnings;
    
    // NEW STAKING MAPPINGS
    mapping(uint256 => mapping(address => uint256)) public userStakes; // promptId => user => staked amount
    
    // Events
    event PromptListed(uint256 indexed promptId, string title, string contentURI, address indexed creator, uint256 price, uint256 timestamp);
    event PromptPurchased(uint256 indexed promptId, address indexed buyer, address indexed creator, uint256 price, uint256 platformFee, uint256 creatorEarning, uint256 timestamp);
    event PromptDelisted(uint256 indexed promptId, address indexed creator, uint256 timestamp);
    event PromptPriceUpdated(uint256 indexed promptId, uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    event EarningsWithdrawn(address indexed creator, uint256 amount, uint256 timestamp);
    event PlatformEarningsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);
    
    // NEW STAKING EVENTS
    event PromptStaked(uint256 indexed promptId, address indexed staker, uint256 amount, uint256 totalStakedNow);
    event PromptUnstaked(uint256 indexed promptId, address indexed staker, uint256 amount, uint256 totalStakedNow);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier promptExists(uint256 _promptId) {
        require(_promptId > 0 && _promptId <= promptIdCounter, "Prompt does not exist");
        _;
    }
    
    modifier onlyCreator(uint256 _promptId) {
        require(prompts[_promptId].creator == msg.sender, "Only creator can modify this prompt");
        _;
    }
    
    modifier promptActive(uint256 _promptId) {
        require(prompts[_promptId].isActive, "Prompt is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        promptIdCounter = 0;
        totalEarnings = 0;
    }
    
    function listPrompt(string memory _title, string memory _contentURI, uint256 _price) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_contentURI).length > 0, "Content URI cannot be empty");
        
        promptIdCounter++;
        uint256 newPromptId = promptIdCounter;
        
        prompts[newPromptId] = Prompt({
            id: newPromptId,
            title: _title,
            contentURI: _contentURI,
            creator: msg.sender,
            price: _price,
            isActive: true,
            purchaseCount: 0,
            createdAt: block.timestamp,
            totalStaked: 0 // Initialize staking score to 0
        });
        
        creatorPrompts[msg.sender].push(newPromptId);
        emit PromptListed(newPromptId, _title, _contentURI, msg.sender, _price, block.timestamp);
        return newPromptId;
    }
    
    function purchasePrompt(uint256 _promptId) external payable promptExists(_promptId) promptActive(_promptId) {
        Prompt storage prompt = prompts[_promptId];
        
        require(msg.sender != prompt.creator, "Creator cannot purchase their own prompt");
        require(!hasPurchased[_promptId][msg.sender], "Already purchased this prompt");
        require(msg.value == prompt.price, "Incorrect payment amount");
        
        uint256 platformFee = (prompt.price * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorEarning = prompt.price - platformFee;
        
        hasPurchased[_promptId][msg.sender] = true;
        userPurchases[msg.sender].push(_promptId);
        prompt.purchaseCount++;
        creatorEarnings[prompt.creator] += creatorEarning;
        totalEarnings += platformFee;
        
        emit PromptPurchased(_promptId, msg.sender, prompt.creator, prompt.price, platformFee, creatorEarning, block.timestamp);
    }

    // ==========================================
    // NEW: COMMUNITY STAKING FUNCTIONS
    // ==========================================

    /**
     * @dev Stake MATIC on a prompt to increase its visibility/validation score
     * @param _promptId The ID of the prompt to stake on
     */
    function stakeOnPrompt(uint256 _promptId) external payable promptExists(_promptId) promptActive(_promptId) {
        require(msg.value > 0, "Must stake more than 0");

        userStakes[_promptId][msg.sender] += msg.value;
        prompts[_promptId].totalStaked += msg.value;

        emit PromptStaked(_promptId, msg.sender, msg.value, prompts[_promptId].totalStaked);
    }

    /**
     * @dev Unstake MATIC from a prompt and return it to the user
     * @param _promptId The ID of the prompt to unstake from
     */
    function unstakeFromPrompt(uint256 _promptId) external promptExists(_promptId) {
        uint256 stakedAmount = userStakes[_promptId][msg.sender];
        require(stakedAmount > 0, "No funds staked on this prompt");

        // Update state before external transfer (Prevents Reentrancy Attacks)
        userStakes[_promptId][msg.sender] = 0;
        prompts[_promptId].totalStaked -= stakedAmount;

        // Transfer funds back to the user
        (bool success, ) = payable(msg.sender).call{value: stakedAmount}("");
        require(success, "Unstake transfer failed");

        emit PromptUnstaked(_promptId, msg.sender, stakedAmount, prompts[_promptId].totalStaked);
    }

    // ==========================================
    // EXISTING UTILITY FUNCTIONS
    // ==========================================
    
    function delistPrompt(uint256 _promptId) external promptExists(_promptId) onlyCreator(_promptId) {
        Prompt storage prompt = prompts[_promptId];
        require(prompt.isActive, "Prompt is already delisted");
        prompt.isActive = false;
        emit PromptDelisted(_promptId, msg.sender, block.timestamp);
    }
    
    function relistPrompt(uint256 _promptId) external promptExists(_promptId) onlyCreator(_promptId) {
        Prompt storage prompt = prompts[_promptId];
        require(!prompt.isActive, "Prompt is already active");
        prompt.isActive = true;
        emit PromptListed(_promptId, prompt.title, prompt.contentURI, msg.sender, prompt.price, block.timestamp);
    }
    
    function updatePromptPrice(uint256 _promptId, uint256 _newPrice) external promptExists(_promptId) onlyCreator(_promptId) {
        require(_newPrice > 0, "Price must be greater than 0");
        Prompt storage prompt = prompts[_promptId];
        uint256 oldPrice = prompt.price;
        prompt.price = _newPrice;
        emit PromptPriceUpdated(_promptId, oldPrice, _newPrice, block.timestamp);
    }
    
    function withdrawEarnings() external {
        uint256 earnings = creatorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        creatorEarnings[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: earnings}("");
        require(success, "Withdrawal failed");
        emit EarningsWithdrawn(msg.sender, earnings, block.timestamp);
    }
    
    function withdrawPlatformEarnings() external onlyOwner {
        uint256 earnings = totalEarnings;
        require(earnings > 0, "No platform earnings to withdraw");
        totalEarnings = 0;
        (bool success, ) = payable(owner).call{value: earnings}("");
        require(success, "Withdrawal failed");
        emit PlatformEarningsWithdrawn(owner, earnings, block.timestamp);
    }
    
    function hasUserPurchased(uint256 _promptId, address _buyer) external view returns (bool) {
        return hasPurchased[_promptId][_buyer];
    }
    
    function getCreatorPrompts(address _creator) external view returns (uint256[] memory) {
        return creatorPrompts[_creator];
    }
    
    function getUserPurchases(address _buyer) external view returns (uint256[] memory) {
        return userPurchases[_buyer];
    }
    
    function getCreatorEarnings(address _creator) external view returns (uint256) {
        return creatorEarnings[_creator];
    }

    // ✅ UPDATED to return totalStaked
    function getPrompt(uint256 _promptId) external view promptExists(_promptId) 
        returns (
            uint256 id, string memory title, string memory contentURI, address creator, 
            uint256 price, bool isActive, uint256 purchaseCount, uint256 createdAt, uint256 totalStaked
        ) 
    {
        Prompt memory prompt = prompts[_promptId];
        return (
            prompt.id, prompt.title, prompt.contentURI, prompt.creator, 
            prompt.price, prompt.isActive, prompt.purchaseCount, prompt.createdAt, prompt.totalStaked
        );
    }
    
    function getTotalPrompts() external view returns (uint256) {
        return promptIdCounter;
    }
}