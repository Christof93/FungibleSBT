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
    mapping(address => mapping(address => uint256)) private _burnAllowances;

    string _name;
    string _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
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
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }


    /**
     * @notice Get the value of a token.
     * @param account The address to query the balance
     * @return The balance of address
     */
    function balanceOf(address account) external view returns (uint256) {

    }

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256) {

    }

    /**
     * @notice Issue an amount of tokens to an address.
     * @dev MUST revert if the `to` address is the zero address.
     *      MUST revert if the `verifier` address is the zero address.
     * @param to The address to issue the token to
     * @param data Additional data used to issue the token
     */
    function issue(
        address to,
        uint256 amount,
        bytes calldata data
    ) external payable {

    }

    /**
     * @notice Revoke/burn tokens.
     * @dev MUST revert if the `tokenId` does not exist.
     * @param account The account
     * @param amount The amount of tokens
     * @param data Additional data used to revoke the token
     */
    function revoke(
        address account,
        uint256 amount,
        bytes calldata data
    ) external payable {

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
    function extendRevokeAuth(address revoker, uint256 amount) external returns (bool) {

    }

    /**
    * @notice provides burn authorization of ...
    * @dev unassigned tokenIds are invalid, and queries do throw
    * @param revoker address of the account burning the tokens.
    * @param holder address of the account holding the tokens to be burned
    */
    function revokeAllowance(address revoker, address holder) external view returns (uint256) {

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

}