//contracts/interface/IERC5727.sol
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
     * @dev MUST emit when a token is revoked.
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
     * @notice Get the value of a token.
     * @param account The address to query the balance
     * @return The balance of address
     */
    function balanceOf(address account) external view returns (uint256);

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

    /**
     * @dev Sets `amount` as allowance of `revoker` to burn caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     * @param revoker address of the account burning the tokens.
     * @param amount allowance of tokens which may be burned by the revoker.
     */
    function extendRevokeAuth(address revoker, uint256 amount) external returns (bool);

    /**
    * @notice provides burn authorization of ...
    * @dev unassigned tokenIds are invalid, and queries do throw
    * @param revoker address of the account burning the tokens.
    * @param holder address of the account holding the tokens to be burned
    */
    function revocationAllowance(address revoker, address holder) external view returns (uint256);

    /**
     * @notice Set the expiry date of a token.
     * @dev MUST revert if the `date` is in the past.
     * @param expiration The expire date to set
     * @param isRenewable Whether the token is renewable
     */
    function setExpiration(
        uint64 expiration,
        bool isRenewable
    ) external;
}