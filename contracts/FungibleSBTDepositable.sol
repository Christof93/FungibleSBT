// contracts/FungibleSBTDepositable.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FungibleSBT.sol";
import "./interfaces/IFungibleSBTDepositable.sol";

/**
 * @title Depositable Fungible Soulbound Token
 * @dev Implementation of the fungible soul-bound token standard which makes it 
 * possible to deposit tokens as a collateral by extending the authority to burn the
 * token to certain addresses.
 */
contract FungibleSBTDepositable is  FungibleSBT, IFungibleSBTDepositable {
    mapping(address => mapping(address => uint256)) private _burnAllowances;
    mapping(address => uint256) private _totalCollaterals;

    constructor(string memory name_, string memory symbol_) FungibleSBT(
        name_,
        symbol_
    ) {}

    /**
    * @notice provides burn authorization of ...
    * @dev unassigned tokenIds are invalid, and queries do throw
    * @param holder address of the account holding the tokens to be burned
    * @param revoker address of the account burning the tokens.
    */
    function collateralDeposit(address holder, address revoker) external view returns (uint256) {
        return _burnAllowances[holder][revoker];
    }

    /**
     * @notice Revoke/burn tokens.
     * @param account The account
     * @param amount The amount of tokens
     */
    function burnDeposit(
        address account,
        uint256 amount
    ) external returns (bool) {
        address revoker = msg.sender;
        uint256 allowance = _burnAllowances[account][revoker];
        
        require(allowance >= amount, "Fungible SBT: Trying to burn amount larger than assigned collateral deposit.");
        _burn(account, amount);
        if (account != revoker) {
            _spendBurnAllowance(account, revoker, amount);
        }
        emit Revoked(account, amount);
        return true;
    }

    /**
     * @notice Return the revocation authorisations.
     * @param account The account
     * @param amount The amount of tokens
     */
    function returnDeposit(
        address account,
        uint256 amount
    ) external returns (bool) {
        address revoker = msg.sender;
        uint256 allowance = _burnAllowances[account][revoker];
        
        require(allowance >= amount, "Fungible SBT: Trying to return amount larger than assigned collateral deposit.");
        if (account != revoker) {
            _spendBurnAllowance(account, revoker, amount);
        }
        emit Revoked(account, amount);
        return true;
    }

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
    function grantCollateral(address revoker, uint256 amount) external returns (bool) {
        address from = msg.sender;
        uint256 accountBalance = _balances[from];
        uint256 alreadyLent = _totalCollaterals[from];
        require(alreadyLent + amount <= accountBalance,
            "Fungible SBT: Can not grant collateral. Resulting deposits exceed total balance.");
        _setBurnAllowance(from, revoker, amount);
        return true;
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _setBurnAllowance(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "FungibleSBT: set burn allowance from the zero address");
        require(spender != address(0), "FungibleSBT: approve to the zero address");

        // subtract what potential spender owes from total totalCollaterals
        _totalCollaterals[owner] -= _burnAllowances[owner][spender];
        // add the new amount to totalCollaterals
        _totalCollaterals[owner] += amount;

        _burnAllowances[owner][spender] = amount;
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendBurnAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = _burnAllowances[owner][spender];
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "FungibleSBT: insufficient revocation allowance");
            unchecked {
                _setBurnAllowance(owner, spender, currentAllowance - amount);
            }
        }
    }

}