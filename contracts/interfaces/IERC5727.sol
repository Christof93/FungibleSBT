//contracts/interface/IERC5727.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC3525.sol";
import "./IERC5192.sol";
import "./IERC5484.sol";
import "./IERC4906.sol";
/**
 * @title ERC5727 Soulbound Token Interface
 * @dev The core interface of the ERC5727 standard.
 */
interface IERC5727 is IERC3525, IERC5192, IERC5484, IERC4906 {
    /**
     * @dev MUST emit when a token is revoked.
     * @param from The address of the owner
     * @param tokenId The token id
     */
    event Revoked(address indexed from, uint256 indexed tokenId);

    /**
     * @dev MUST emit when a token is verified.
     * @param by The address that initiated the verification
     * @param tokenId The token id
     * @param result The result of the verification
     */
    event Verified(address indexed by, uint256 indexed tokenId, bool result);

    /**
     * @notice Get the verifier of a token.
     * @dev MUST revert if the `tokenId` does not exist
     * @param tokenId the token for which to query the verifier
     * @return The address of the verifier of `tokenId`
     */
    function verifierOf(uint256 tokenId) external view returns (address);

    /**
     * @notice Get the issuer of a token.
     * @dev MUST revert if the `tokenId` does not exist
     * @param tokenId the token for which to query the issuer
     * @return The address of the issuer of `tokenId`
     */
    function issuerOf(uint256 tokenId) external view returns (address);

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
    ) external payable;

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
    ) external payable;

    /**
     * @notice Revoke a token from an address.
     * @dev MUST revert if the `tokenId` does not exist.
     * @param tokenId The token id
     * @param data The additional data used to revoke the token
     */
    function revoke(uint256 tokenId, bytes calldata data) external payable;

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
    ) external payable;

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
    ) external returns (bool);
}

/**
 * @title ERC5727 Soulbound Token Expirable Interface
 * @dev This extension allows soulbound tokens to be expirable and renewable.
 */
interface IERC5727Expirable is IERC5727 {
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
    ) external;
}