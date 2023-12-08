pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TimToken is ERC20 {
    constructor() ERC20("TimToken", "TIM") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
    function approveFromSource(address spender, uint256 value) public virtual returns (bool) {
        address owner = tx.origin;
        _approve(owner, spender, value);
        return true;
    }
}