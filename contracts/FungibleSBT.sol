// contracts/FungibleSBT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IFungibleSBT.sol";
import "../node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Fungible Soulbound Token Interface
 * @dev Implementation of the semi-fungible soul-bound token ERC5727 standard.
 */
contract FungibleSBT is  ERC165, IFungibleSBT {
    using Counters for Counters.Counter;

    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _unassignedBalances; 
    
    uint256 private _totalSupply;
    
    mapping(address => mapping(address => uint256)) private _burnAllowances;
    mapping(address => uint256) private _lendings;

    string _name;
    string _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        // mint 100 tokens to deploying account
        _mint(msg.sender, 100);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the default value returned by this function, unless
     * it's overridden.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @notice Get the balanace of a token.
     * @param account The address to query the balance
     * @return The balance of address
     */
    function getBalance(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Get the value of a token.
     * @param account The address to query the balance
     * @return The balance of not yet assigned tokens of the address
     */
    function getUnassignedBalance(address account) external view returns (uint256) {
        return _unassignedBalances[account];
    }

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @notice Issue an amount of tokens to an address.
     * @dev MUST revert if the `to` address is the zero address.
     * @param to The address to issue the token to
     * @param amount The amount of tokens
     */
    function issue(
        address to,
        uint256 amount
    ) external payable returns (bool) {
        address from = msg.sender;
        _transfer(from, to, amount);
        emit Issued(from, to, amount);
        return true;
    }

    /**
     * @notice Revoke/burn tokens.
     * @param account The account
     * @param amount The amount of tokens
     */
    function revoke(
        address account,
        uint256 amount
    ) external payable returns (bool) {
        if (account != msg.sender) {
            require(
                amount <= revocationAllowance(account, msg.sender),
                "Not allowed to revoke this amount of issued tokens from account."
            );
            _spendBurnAllowance(account, msg.sender, amount);
        }
        _burn(account, amount);
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
    function extendRevocationAuth(address revoker, uint256 amount) external returns (bool) {
        address from = msg.sender;
        uint256 accountBalance = _balances[from];
        uint256 alreadyLent = _lendings[from];
        require(alreadyLent + amount <= accountBalance,
            "Fungible SBT: Can not extend revocation authority. Potential revocations exceed balance.");
        _burnAllowances[from][revoker] += amount;
        return true;
    }

    /**
    * @notice provides burn authorization of ...
    * @dev unassigned tokenIds are invalid, and queries do throw
    * @param holder address of the account holding the tokens to be burned
    * @param revoker address of the account burning the tokens.
    */
    function revocationAllowance(address holder, address revoker) public view virtual returns (uint256) {
        return _burnAllowances[holder][revoker];
    }

    /**
     * @notice Set the expiry date of a token.
     * @dev MUST revert if the `date` is in the past.
     * @param expiration The expire date to set
     * @param isRenewable Whether the token is renewable
     */
    function setExpiration(
        uint64 expiration,
        bool isRenewable
    ) external {

    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "FungibleSBT: transfer from the zero address");
        require(to != address(0), "FungibleSBT: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _unassignedBalances[from];
        require(fromBalance >= amount, "FungibleSBT: amount of tokens to be issued exceeds balance of unassigned tokens.");
        unchecked {
            _unassignedBalances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "FungibleSBT: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _unassignedBalances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "FungibleSBT: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "FungibleSBT: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
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
        
        // subtract what potential spender owes from total lendings
        _lendings[owner] -= _burnAllowances[owner][spender];
        // add the new amount to lendings
        _lendings[owner] += amount;

        _burnAllowances[owner][spender] = amount;

        // emit Approval(owner, spender, amount);
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
        uint256 currentAllowance = revocationAllowance(spender, owner);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "FungibleSBT: insufficient revocation allowance");
            unchecked {
                _setBurnAllowance(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

}