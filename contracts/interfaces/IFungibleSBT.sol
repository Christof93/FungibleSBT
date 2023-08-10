//contracts/interface/IFungibleSBT.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFungibleSBT {
    /**
     * @dev Emitted when tokens are issued from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Issued(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    /**
     * @dev MUST emit when a tokens are revoked.
     * @param from The address of the owner
     * @param value The token id
     */
    event Revoked(address indexed from, uint256 value);

    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
    

    /**
     * @notice Get the balanace of a token.
     * @param account The address to query the balance
     * @return The balance of address
     */
    function getBalance(address account) external view returns (uint256);

    /**
     * @notice Get the amount of tokens issued by spender to owner.
     * @param from The address of the spender
     * @param from The address of the owner
     * @return The total issuance of spender to owner
     */
    function getIssuance(address from, address to) external view returns (uint256);
    
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);
    
    /**
     * @notice Issue an amount of tokens to an address.
     * @dev MUST revert if the `to` address is the zero address.
     * @param to The address to issue the token to
     * @param amount The amount of tokens
     */
    function issue(
        address to,
        uint256 amount
    ) external payable returns (bool);

    /**
     * @notice Revoke/burn tokens.
     * @param account The account
     * @param amount The amount of tokens
     */
    function revoke(
        address account,
        uint256 amount
    ) external payable returns (bool);
}