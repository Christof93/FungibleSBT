//contracts/interface/IFungibleSBTDepositable.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IFungibleSBT.sol";

interface IFungibleSBTDepositable {
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
    function extendRevocationAuth(address revoker, uint256 amount) external returns (bool);

    /**
    * @notice provides burn authorization of ...
    * @dev unassigned tokenIds are invalid, and queries do throw
    * @param revoker address of the account burning the tokens.
    * @param holder address of the account holding the tokens to be burned
    */
    function revocationAllowance(address revoker, address holder) external view returns (uint256);
}