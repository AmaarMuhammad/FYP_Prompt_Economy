// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserRegistry
 * @dev Simple user registration contract for Prompt Economy - Iteration 1
 * @notice This contract stores basic user information on-chain
 */
contract UserRegistry {
    
    struct User {
        string username;
        address walletAddress;
        uint256 registrationTime;
        bool isRegistered;
        uint256 reputation;
    }
    
    // Mapping from wallet address to User
    mapping(address => User) public users;
    
    // Mapping from username to wallet address (for uniqueness)
    mapping(string => address) public usernameToAddress;
    
    // Array to keep track of all registered users
    address[] public registeredUsers;
    
    // Events
    event UserRegistered(address indexed walletAddress, string username, uint256 timestamp);
    event UsernameUpdated(address indexed walletAddress, string oldUsername, string newUsername);
    event ReputationUpdated(address indexed walletAddress, uint256 newReputation);
    
    // Modifiers
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    modifier notRegistered() {
        require(!users[msg.sender].isRegistered, "User already registered");
        _;
    }
    
    /**
     * @dev Register a new user
     * @param _username The desired username
     */
    function registerUser(string memory _username) external notRegistered {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 32, "Username too long");
        require(usernameToAddress[_username] == address(0), "Username already taken");
        
        users[msg.sender] = User({
            username: _username,
            walletAddress: msg.sender,
            registrationTime: block.timestamp,
            isRegistered: true,
            reputation: 100 // Starting reputation
        });
        
        usernameToAddress[_username] = msg.sender;
        registeredUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, _username, block.timestamp);
    }
    
    /**
     * @dev Update username
     * @param _newUsername The new username
     */
    function updateUsername(string memory _newUsername) external onlyRegistered {
        require(bytes(_newUsername).length > 0, "Username cannot be empty");
        require(bytes(_newUsername).length <= 32, "Username too long");
        require(usernameToAddress[_newUsername] == address(0), "Username already taken");
        
        string memory oldUsername = users[msg.sender].username;
        
        // Remove old username mapping
        delete usernameToAddress[oldUsername];
        
        // Update to new username
        users[msg.sender].username = _newUsername;
        usernameToAddress[_newUsername] = msg.sender;
        
        emit UsernameUpdated(msg.sender, oldUsername, _newUsername);
    }
    
    /**
     * @dev Get user details
     * @param _walletAddress The wallet address to query
     */
    function getUser(address _walletAddress) external view returns (
        string memory username,
        address walletAddress,
        uint256 registrationTime,
        bool isRegistered,
        uint256 reputation
    ) {
        User memory user = users[_walletAddress];
        return (
            user.username,
            user.walletAddress,
            user.registrationTime,
            user.isRegistered,
            user.reputation
        );
    }
    
    /**
     * @dev Check if a username is available
     * @param _username The username to check
     */
    function isUsernameAvailable(string memory _username) external view returns (bool) {
        return usernameToAddress[_username] == address(0);
    }
    
    /**
     * @dev Get total registered users count
     */
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }
    
    /**
     * @dev Get user by username
     * @param _username The username to search
     */
    function getUserByUsername(string memory _username) external view returns (address) {
        return usernameToAddress[_username];
    }
    
    /**
     * @dev Update user reputation (for future use)
     * @param _walletAddress The user's wallet address
     * @param _newReputation The new reputation score
     * @notice This is a placeholder - in production, this should be restricted
     */
    function updateReputation(address _walletAddress, uint256 _newReputation) external {
        require(users[_walletAddress].isRegistered, "User not registered");
        users[_walletAddress].reputation = _newReputation;
        emit ReputationUpdated(_walletAddress, _newReputation);
    }
}
