// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Token42
 * @notice Fixed-supply ERC-20 token for the 42 Tokenizer project.
 * @dev Mints the complete supply once to the deployer. No further minting.
 */
contract Token42 is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    constructor() ERC20("42NajibToken", "NJT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
