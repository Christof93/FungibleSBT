//contracts/interface/IFungibleSBTDepositable.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IFungibleSBT.sol";

interface IFungibleSBTDepositable {
        /**
     * @dev Emitted when tokens are issued from one account (`from`) to
     * another (`to`).
     */
    event Deposit(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`). Usually only happens through the minting.
     */
    event Burn(address indexed from, address indexed to, uint256 value);
    
    /**
     * @dev MUST emit when `value` tokens are revoked from account `from`.
     */
    event Return(address indexed from, address indexed to, uint256 value);
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
     * @param revoker address of the account burning the tokens.
     * @param amount allowance of tokens which may be burned by the revoker.
     */
    function grantCollateral(address revoker, uint256 amount) external returns (bool);
    
    /**
    * @notice provides amount of collateral deposit
    * @dev unassigned tokenIds are invalid, and queries do throw
    * @param holder address of the account holding the tokens to be burned
    * @param revoker address of the account burning the tokens.
    */
    function collateralDeposit(address holder, address revoker) external view returns (uint256);

    /**
     * @notice Revoke/burn tokens.
     * @param account The account
     * @param amount The amount of tokens
     */
    function burnDeposit(
        address account,
        uint256 amount
    ) external returns (bool);

    /**
     * @notice Return the revocation authorisations.
     * @param account The account
     * @param amount The amount of tokens
     */
    function returnDeposit(
        address account,
        uint256 amount
    ) external returns (bool);
}