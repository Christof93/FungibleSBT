//contracts/interface/IERC5727.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFungibleSBT {
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
     * @param data Additional data used to issue the token
     */
    function issue(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 slot,
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
     * @notice Get the value of a token.
     * @param _tokenId The token for which to query the balance
     * @return The value of `_tokenId`
     */
    function balanceOf(uint256 _tokenId) external view returns (uint256);

    /**
     * @notice Get the maximum value of a token that an operator is allowed to manage.
     * @param _tokenId The token for which to query the allowance
     * @param _operator The address of an operator
     * @return The current approval value of `_tokenId` that `_operator` is allowed to manage
     */
    function allowance(uint256 _tokenId, address _operator) external view returns (uint256);


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
    ) external payable returns (uint256);

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