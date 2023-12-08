pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "contracts/MyERC20.Token.sol";


contract SubscriptionContract{

    TimToken public tokenContract;
     struct Subscriber {
        uint256 subscriptionAmount;
        uint256 nextPaymentTimestamp;
        bool isActive;
        address receiverAddress;
        uint interval;
        uint period;
        uint paymentExpire;
    }

    mapping(address => Subscriber) public subscribers;
    mapping(uint => address) public subscriberAddresses;
    address public tokenContractAddress;
    address public contractAddress;

    address public owner; 
    uint256 mapSize;


  
    event PaymentSent(address indexed sender, address indexed receiver, uint256 amount);
    event SubscriptionStopped(address indexed subscriber);
    event IntervalUpdated(address indexed subscriber, uint256 newInterval);


    constructor(address _tokenContract) {
        tokenContract = TimToken(_tokenContract);
        tokenContractAddress = _tokenContract;
        owner = msg.sender;
        contractAddress = address(this);
    }

     modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }


    //contract deployed by: 0xB0138E967807ccdA91a7aA9abd1d2183cC3D2260
    //subscriber: 0x03DDEBb6470320d6fA0C95763D7f74bB3DA6718F (source)
    //receiver: 0xe96e429863C426E801fDa895Daac049B34517041
    // spender: 0xf09EdEBBf5793Fa4dD04a44c88C01C94238ee72C - contract

    function subscribe(address _receiverAddress, uint256 _amount,  uint256 _interval, uint _period) external {
        require(_amount > 0, "Amount must be greater than zero");
        subscribers[msg.sender] = Subscriber(_amount, block.timestamp, true, _receiverAddress, _interval, _period, block.timestamp + _period);
        subscriberAddresses[mapSize] = msg.sender;
        require(tokenContract.approveFromSource(contractAddress, _amount*100*1000000000000000000), "Approval failed");
        require(tokenContract.transferFrom(msg.sender, subscribers[msg.sender].receiverAddress, subscribers[msg.sender].subscriptionAmount*1000000000000000000),"First Transfer failed");
        subscribers[msg.sender].nextPaymentTimestamp += subscribers[msg.sender].interval;
        mapSize++;
        
        
    }

    //source: contract
    //spender: contract

   
    
    function executeAllPayments() external payable {
        for (uint256 i = 0; i < mapSize; i++) {
            address sender = subscriberAddresses[i];
            if (subscribers[sender].isActive && block.timestamp <= subscribers[sender].paymentExpire &&  block.timestamp >= subscribers[sender].nextPaymentTimestamp) {
                
                //require(tokenContract.allowance(sender, contractAddress) >= subscribers[sender].subscriptionAmount,"Insuficient Allowance");
                require(tokenContract.transferFrom(sender, subscribers[sender].receiverAddress, subscribers[sender].subscriptionAmount*1000000000000000000),"Transfer failed");

                // Update the next payment timestamp
                subscribers[sender].nextPaymentTimestamp += subscribers[sender].interval;

                emit PaymentSent(sender, subscribers[sender].receiverAddress, subscribers[sender].subscriptionAmount);
            }
        }
    }

    //source: 0xB0138E967807ccdA91a7aA9abd1d2183cC3D2260 57
    //spender: 0x03DDEBb6470320d6fA0C95763D7f74bB3DA6718F 82
    //receiver: 0xe96e429863C426E801fDa895Daac049B34517041 36


     // Stop subscription for a subscriber
    function stopSubscription() external {
        require(subscribers[msg.sender].isActive, "Caller is not an active subscriber");
        subscribers[msg.sender].isActive = false;
        emit SubscriptionStopped(msg.sender);
    }

    // Update payment interval for a subscriber
    function updateInterval(uint256 newInterval) external {
        require(subscribers[msg.sender].isActive, "Caller is not an active subscriber");
        subscribers[msg.sender].interval = newInterval;
        emit IntervalUpdated(msg.sender, newInterval);
    }

  
}