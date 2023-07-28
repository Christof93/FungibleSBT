// contracts/FungibleSBT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC5727.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";


/**
 * @title Fungible Soulbound Token Interface
 * @dev Implementation of the semi-fungible soul-bound token ERC5727 standard.
 */
contract SemiFungibleSBT is  ERC165, IERC5727, IERC5727Expirable {
    using Counters for Counters.Counter;
    Counters.Counter private token_count;
    string name;
    string symbol;

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @notice Get the verifier of a token.
     * @dev MUST revert if the `tokenId` does not exist
     * @param tokenId the token for which to query the verifier
     * @return The address of the verifier of `tokenId`
     */
    function verifierOf(uint256 tokenId) external view returns (address) {

    }

    /**
     * @notice Get the issuer of a token.
     * @dev MUST revert if the `tokenId` does not exist
     * @param tokenId the token for which to query the issuer
     * @return The address of the issuer of `tokenId`
     */
    function issuerOf(uint256 tokenId) external view returns (address) {

    }
    /**
     * @notice Issue a token in a specified slot to an address.
     * @dev MUST revert if the `to` address is the zero address.
     *      MUST revert if the `verifier` address is the zero address.
     * @param to The address to issue the token to
     * @param tokenId The token id
     * @param slot The slot to issue the token in
     * @param burnAuth The burn authorization of the token
     * @param verifier The address of the verifier
     * @param data Additional data used to issue the token
     */
    function issue(
        address to,
        uint256 tokenId,
        uint256 slot,
        BurnAuth burnAuth,
        address verifier,
        bytes calldata data
    ) external payable {
    }

    /**
     * @notice Issue credit to a token.
     * @dev MUST revert if the `tokenId` does not exist.
     * @param tokenId The token id
     * @param amount The amount of the credit
     * @param data The additional data used to issue the credit
     */
    function issue(
        uint256 tokenId,
        uint256 amount,
        bytes calldata data
    ) external payable {

    }

    /**
     * @notice Revoke a token from an address.
     * @dev MUST revert if the `tokenId` does not exist.
     * @param tokenId The token id
     * @param data The additional data used to revoke the token
     */
    function revoke(uint256 tokenId, bytes calldata data) external payable {

    }

    /**
     * @notice Revoke credit from a token.
     * @dev MUST revert if the `tokenId` does not exist.
     * @param tokenId The token id
     * @param amount The amount of the credit
     * @param data The additional data used to revoke the credit
     */
    function revoke(
        uint256 tokenId,
        uint256 amount,
        bytes calldata data
    ) external payable {

    }

    /**
     * @notice Verify if a token is valid.
     * @dev MUST revert if the `tokenId` does not exist.
     * @param tokenId The token id
     * @param data The additional data used to verify the token
     * @return A boolean indicating whether the token is successfully verified
     */
    function verify(
        uint256 tokenId,
        bytes calldata data
    ) external returns (bool) {

    }
    /**
     * @notice Get the number of decimals the token uses for value - e.g. 6, means the user
     *  representation of the value of a token can be calculated by dividing it by 1,000,000.
     *  Considering the compatibility with third-party wallets, this function is defined as
     *  `valueDecimals()` instead of `decimals()` to avoid conflict with ERC-20 tokens.
     * @return The number of decimals for value
     */
    function valueDecimals() external view returns (uint8) {

    }
    /**
     * @notice Get the value of a token.
     * @param _tokenId The token for which to query the balance
     * @return The value of `_tokenId`
     */
    function balanceOf(uint256 _tokenId) external view returns (uint256) {

    }

    /**
     * @notice Get the slot of a token.
     * @param _tokenId The identifier for a token
     * @return The slot of the token
     */
    function slotOf(uint256 _tokenId) external view returns (uint256) {

    }
    /**
     * @notice Allow an operator to manage the value of a token, up to the `_value`.
     * @dev MUST revert unless caller is the current owner, an authorized operator, or the approved
     *  address for `_tokenId`.
     *  MUST emit the ApprovalValue event.
     * @param _tokenId The token to approve
     * @param _operator The operator to be approved
     * @param _value The maximum value of `_toTokenId` that `_operator` is allowed to manage
     */
    function approve(
        uint256 _tokenId,
        address _operator,
        uint256 _value
    ) external payable {

    }

    /**
     * @notice Get the maximum value of a token that an operator is allowed to manage.
     * @param _tokenId The token for which to query the allowance
     * @param _operator The address of an operator
     * @return The current approval value of `_tokenId` that `_operator` is allowed to manage
     */
    function allowance(uint256 _tokenId, address _operator) external view returns (uint256) {

    }

    /**
     * @notice Transfer value from a specified token to another specified token with the same slot.
     * @dev Caller MUST be the current owner, an authorized operator or an operator who has been
     *  approved the whole `_fromTokenId` or part of it.
     *  MUST revert if `_fromTokenId` or `_toTokenId` is zero token id or does not exist.
     *  MUST revert if slots of `_fromTokenId` and `_toTokenId` do not match.
     *  MUST revert if `_value` exceeds the balance of `_fromTokenId` or its allowance to the
     *  operator.
     *  MUST emit `TransferValue` event.
     * @param _fromTokenId The token to transfer value from
     * @param _toTokenId The token to transfer value to
     * @param _value The transferred value
     */
    function transferFrom(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint256 _value
    ) external payable {

    }


    /**
     * @notice Transfer value from a specified token to an address. The caller should confirm that
     *  `_to` is capable of receiving ERC-3525 tokens.
     * @dev This function MUST create a new ERC-3525 token with the same slot for `_to`, 
     *  or find an existing token with the same slot owned by `_to`, to receive the transferred value.
     *  MUST revert if `_fromTokenId` is zero token id or does not exist.
     *  MUST revert if `_to` is zero address.
     *  MUST revert if `_value` exceeds the balance of `_fromTokenId` or its allowance to the
     *  operator.
     *  MUST emit `Transfer` and `TransferValue` events.
     * @param _fromTokenId The token to transfer value from
     * @param _to The address to transfer value to
     * @param _value The transferred value
     * @return ID of the token which receives the transferred value
     */
    function transferFrom(
        uint256 _fromTokenId,
        address _to,
        uint256 _value
    ) external payable returns (uint256) {

    }
    /// @notice Returns the locking status of an Soulbound Token
    /// @dev SBTs assigned to zero address are considered invalid, and queries
    /// about them do throw.
    /// @param tokenId The identifier for an SBT.
    function locked(uint256 tokenId) external view returns (bool) {

    }
    
    /// @notice provides burn authorization of the token id.
    /// @dev unassigned tokenIds are invalid, and queries do throw
    /// @param tokenId The identifier for a token.
    function burnAuth(uint256 tokenId) external view returns (BurnAuth) {

    }

    /**
     * @notice Set the expiry date of a token.
     * @dev MUST revert if the `tokenId` token does not exist.
     *      MUST revert if the `date` is in the past.
     * @param tokenId The token whose expiry date is set
     * @param expiration The expire date to set
     * @param isRenewable Whether the token is renewable
     */
    function setExpiration(
        uint256 tokenId,
        uint64 expiration,
        bool isRenewable
    ) external {
        
    }

}