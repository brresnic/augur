pragma solidity 0.5.4;

import 'ROOT/libraries/ContractExists.sol';
import 'ROOT/reporting/ReputationToken.sol';
import 'ROOT/IAugur.sol';
import 'ROOT/reporting/IUniverse.sol';


contract TestNetReputationToken is ReputationToken {
    using ContractExists for address;

    uint256 private constant DEFAULT_FAUCET_AMOUNT = 47 ether;
    address private constant FOUNDATION_REP_ADDRESS = address(0x1985365e9f78359a9B6AD760e32412f4a445E862);

    constructor(IAugur _augur, IUniverse _universe, IUniverse _parentUniverse, address _erc820RegistryAddress) ReputationToken(_augur, _universe, _parentUniverse, _erc820RegistryAddress) public {
        // This is to confirm we are not on foundation network
        require(!FOUNDATION_REP_ADDRESS.exists());
    }

    function faucet(uint256 _amount) public returns (bool) {
        if (_amount == 0) {
            _amount = DEFAULT_FAUCET_AMOUNT;
        }
        require(_amount < 2 ** 128);
        mint(msg.sender, _amount);
        return true;
    }
}
