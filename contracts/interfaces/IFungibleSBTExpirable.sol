//contracts/interface/IFungibleSBTExpirable.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IFungibleSBT.sol";

interface IFungibleSBTExpirable is IFungibleSBT {    
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