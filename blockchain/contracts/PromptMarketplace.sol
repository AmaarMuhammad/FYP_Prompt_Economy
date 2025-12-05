// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PromptMarketplace
 * @dev Decentralized marketplace for buying and selling AI prompts
 * Supports listing, purchasing, and managing prompts with platform fees
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
        address creator;
        uint256 price; // Price in wei
        bool isActive;
        uint256 purchaseCount;
        uint256 createdAt;
    }
    
    struct Purchase {
        uint256 promptId;
        address buyer;
        uint256 price;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(uint256 => Prompt) public prompts;
    mapping(uint256 => mapping(address => bool)) public hasPurchased; // promptId => buyer => purchased
    mapping(address => uint256[]) public creatorPrompts; // creator => promptIds
    mapping(address => uint256[]) public userPurchases; // buyer => promptIds
    mapping(address => uint256) public creatorEarnings; // creator => total earnings
    
    // Events
    event PromptListed(
        uint256 indexed promptId,
        string title,
        address indexed creator,
        uint256 price,
        uint256 timestamp
    );
    
    event PromptPurchased(
        uint256 indexed promptId,
        address indexed buyer,
        address indexed creator,
        uint256 price,
        uint256 platformFee,
        uint256 creatorEarning,
        uint256 timestamp
    );
    
    event PromptDelisted(
        uint256 indexed promptId,
        address indexed creator,
        uint256 timestamp
    );
    
    event PromptPriceUpdated(
        uint256 indexed promptId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    event EarningsWithdrawn(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );
    
    event PlatformEarningsWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    
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
    
    /**
     * @dev List a new prompt for sale
     * @param _title The title of the prompt
     * @param _price The price in wei
     */
    function listPrompt(string memory _title, uint256 _price) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        promptIdCounter++;
        uint256 newPromptId = promptIdCounter;
        
        prompts[newPromptId] = Prompt({
            id: newPromptId,
            title: _title,
            creator: msg.sender,
            price: _price,
            isActive: true,
            purchaseCount: 0,
            createdAt: block.timestamp
        });
        
        creatorPrompts[msg.sender].push(newPromptId);
        
        emit PromptListed(newPromptId, _title, msg.sender, _price, block.timestamp);
        
        return newPromptId;
    }
    
    /**
     * @dev Purchase a prompt
     * @param _promptId The ID of the prompt to purchase
     */
    function purchasePrompt(uint256 _promptId) 
        external 
        payable 
        promptExists(_promptId) 
        promptActive(_promptId) 
    {
        Prompt storage prompt = prompts[_promptId];
        
        require(msg.sender != prompt.creator, "Creator cannot purchase their own prompt");
        require(!hasPurchased[_promptId][msg.sender], "Already purchased this prompt");
        require(msg.value == prompt.price, "Incorrect payment amount");
        
        // Calculate fees
        uint256 platformFee = (prompt.price * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorEarning = prompt.price - platformFee;
        
        // Update state
        hasPurchased[_promptId][msg.sender] = true;
        userPurchases[msg.sender].push(_promptId);
        prompt.purchaseCount++;
        creatorEarnings[prompt.creator] += creatorEarning;
        totalEarnings += platformFee;
        
        emit PromptPurchased(
            _promptId,
            msg.sender,
            prompt.creator,
            prompt.price,
            platformFee,
            creatorEarning,
            block.timestamp
        );
    }
    
    /**
     * @dev Delist (deactivate) a prompt
     * @param _promptId The ID of the prompt to delist
     */
    function delistPrompt(uint256 _promptId) 
        external 
        promptExists(_promptId) 
        onlyCreator(_promptId) 
    {
        Prompt storage prompt = prompts[_promptId];
        require(prompt.isActive, "Prompt is already delisted");
        
        prompt.isActive = false;
        
        emit PromptDelisted(_promptId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Reactivate a delisted prompt
     * @param _promptId The ID of the prompt to reactivate
     */
    function relistPrompt(uint256 _promptId) 
        external 
        promptExists(_promptId) 
        onlyCreator(_promptId) 
    {
        Prompt storage prompt = prompts[_promptId];
        require(!prompt.isActive, "Prompt is already active");
        
        prompt.isActive = true;
        
        emit PromptListed(_promptId, prompt.title, msg.sender, prompt.price, block.timestamp);
    }
    
    /**
     * @dev Update the price of a prompt
     * @param _promptId The ID of the prompt
     * @param _newPrice The new price in wei
     */
    function updatePromptPrice(uint256 _promptId, uint256 _newPrice) 
        external 
        promptExists(_promptId) 
        onlyCreator(_promptId) 
    {
        require(_newPrice > 0, "Price must be greater than 0");
        
        Prompt storage prompt = prompts[_promptId];
        uint256 oldPrice = prompt.price;
        prompt.price = _newPrice;
        
        emit PromptPriceUpdated(_promptId, oldPrice, _newPrice, block.timestamp);
    }
    
    /**
     * @dev Withdraw earnings for creators
     */
    function withdrawEarnings() external {
        uint256 earnings = creatorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        creatorEarnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: earnings}("");
        require(success, "Withdrawal failed");
        
        emit EarningsWithdrawn(msg.sender, earnings, block.timestamp);
    }
    
    /**
     * @dev Withdraw platform earnings (only owner)
     */
    function withdrawPlatformEarnings() external onlyOwner {
        uint256 earnings = totalEarnings;
        require(earnings > 0, "No platform earnings to withdraw");
        
        totalEarnings = 0;
        
        (bool success, ) = payable(owner).call{value: earnings}("");
        require(success, "Withdrawal failed");
        
        emit PlatformEarningsWithdrawn(owner, earnings, block.timestamp);
    }
    
    /**
     * @dev Check if a user has purchased a specific prompt
     * @param _promptId The prompt ID
     * @param _buyer The buyer's address
     */
    function hasUserPurchased(uint256 _promptId, address _buyer) 
        external 
        view 
        returns (bool) 
    {
        return hasPurchased[_promptId][_buyer];
    }
    
    /**
     * @dev Get all prompts created by a specific creator
     * @param _creator The creator's address
     */
    function getCreatorPrompts(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorPrompts[_creator];
    }
    
    /**
     * @dev Get all prompts purchased by a user
     * @param _buyer The buyer's address
     */
    function getUserPurchases(address _buyer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPurchases[_buyer];
    }
    
    /**
     * @dev Get creator's available earnings
     * @param _creator The creator's address
     */
    function getCreatorEarnings(address _creator) 
        external 
        view 
        returns (uint256) 
    {
        return creatorEarnings[_creator];
    }
    
    /**
     * @dev Get prompt details
     * @param _promptId The prompt ID
     */
    function getPrompt(uint256 _promptId) 
        external 
        view 
        promptExists(_promptId) 
        returns (
            uint256 id,
            string memory title,
            address creator,
            uint256 price,
            bool isActive,
            uint256 purchaseCount,
            uint256 createdAt
        ) 
    {
        Prompt memory prompt = prompts[_promptId];
        return (
            prompt.id,
            prompt.title,
            prompt.creator,
            prompt.price,
            prompt.isActive,
            prompt.purchaseCount,
            prompt.createdAt
        );
    }
    
    /**
     * @dev Get total number of prompts
     */
    function getTotalPrompts() external view returns (uint256) {
        return promptIdCounter;
    }
}
