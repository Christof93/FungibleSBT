// contracts/FungibleSBT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IFungibleSBT.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Fungible Soulbound Token Implementation
 * @dev Implementation of a fungible soul-bound token.
 */
contract FungibleSBT is  ERC165, IFungibleSBT {
    mapping(address => uint256) internal _balances;
    mapping(address => uint256) internal _unassignedBalances; 
    
    uint256 internal _totalSupply;
    
    mapping(address => mapping(address => uint256)) internal _issued;

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
     * @notice Get the balance of a token.
     * @param account The address to query the balance
     * @return The balance of address
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Get the issuance issued by spender to owner.
     * @param to The address of the owner
     * @param from The address of the spender
     * @return The total issuance of spender to owner
     */
    function getIssuance(address to, address from) external view returns (uint256) {
        return _issued[to][from];
    }

    /**
     * @notice Get the balance of minted but not issued token.
     * @param account The address to query the balance
     * @return The balance of not yet assigned tokens of the address
     */
    function unassignedBalanceOf(address account) external view returns (uint256) {
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
    ) external returns (bool) {
        address from = msg.sender;
        _transfer(from, to, amount);
        // can not be more than _totalSupply
        unchecked {
            _issued[to][from] += amount;
        }
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
    ) external returns (bool) {
        address revoker = msg.sender;       
        uint256 allowance = _issued[account][revoker];        
        require(allowance >= amount, "Fungible SBT: Not enough revocation allowance");
        _burn(account, amount);
        // already checked amount <= allowance
        unchecked {
            _issued[account][revoker] -= amount;
        }
        emit Revoked(account, amount);
        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
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
        unchecked {
            _balances[account] = Math.max(accountBalance - amount, 0);
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= Math.max(accountBalance, amount);
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
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