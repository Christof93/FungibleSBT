// contracts/FungibleSBT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./interfaces/IFungibleSBT.sol";
import "../node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title Fungible Soulbound Token Interface
 * @dev Implementation of the semi-fungible soul-bound token ERC5727 standard.
 */
contract FungibleSBT is  ERC165, IFungibleSBT {
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

}