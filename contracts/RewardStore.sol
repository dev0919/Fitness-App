// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RewardStore
 * @dev A smart contract to facilitate the purchase of digital fitness products using MATIC
 */
contract RewardStore {
    // Contract owner address
    address public owner;
    
    // Emitted when a product is purchased
    event ProductBought(
        address indexed buyer,
        uint256 amount,
        string productId
    );
    
    // Set the contract owner to the deployer
    constructor() {
        owner = msg.sender;
    }
    
    // Only contract owner can call functions with this modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    /**
     * @dev Buy a digital product from the store
     * @param productId The ID of the product being purchased
     */
    function buyProduct(string calldata productId) external payable {
        // Make sure the transaction amount is greater than 0
        require(msg.value > 0, "Payment amount must be greater than 0");
        
        // Emit event with product details
        emit ProductBought(msg.sender, msg.value, productId);
    }
    
    /**
     * @dev Get the current contract balance
     * @return The current contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Allow the owner to withdraw funds from the contract
     * @param amount The amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}
