pragma solidity ^0.4.23;

import "./SafeMath.sol";
import "./ERC20Burnable.sol";
import "./ERC20Detailed.sol";
import "./ERC20Mintable.sol";

contract TestToken is ERC20Mintable, ERC20Detailed, ERC20Burnable{

  string public name = "Test Token";
  string public symbol = "TEST";
  uint8 public decimals = 18;

  constructor() public ERC20Detailed(name, symbol, decimals) {
  	_mint(msg.sender, 10000 ether);
  }

}