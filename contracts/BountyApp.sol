pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./IERC20.sol";
import "./SafeERC20.sol";

contract BountyApp is Ownable {
	using SafeMath for uint256;
	using SafeERC20 for IERC20;

	uint256 public bountyCount;
	uint256 public entryCount;
	mapping (uint256 => Bounty) private bountyList;
	mapping (address => uint256[]) private userBounty;
	mapping (uint256 => BountyEntry) private entryList;
	mapping (address => uint256[]) private userEntry; 

	enum BountyStatus { Ongoing, Completed }
	enum BountyEntryStatus { Pending, Approved, Paid }

	struct Bounty {
		address bountyOwner;
		string name;
		string description;
		IERC20 token;
		uint256 payout;
		BountyStatus status;
	}

	struct BountyEntry {
		address entryUser;
		uint256 bountyID;
		string documentHash;
		BountyEntryStatus status;
	}

	event TokensDeposited(address indexed bountyOwner, uint256 amount);
	event BountyAdded(address indexed bountyOwner, uint256 bountyID);
	event BountyEntryAdded(address indexed entryOwner, uint256 entryID);
	event BountyEntryApproved(uint256 entryID);
	event BountyEntryPaid(uint256 entryID);
	event BountyAdded(uint256 bountyID);
	event BountyCompleted(uint256 bountyID);

	function() public payable {
		revert();
	}

	modifier validBounty(uint256 _bountyID) {
        require(bountyList[_bountyID].bountyOwner != address(0));
        _;
    }

    modifier validEntry(uint256 _entryID) {
        require(entryList[_entryID].entryUser != address(0));
        _;
    }

	modifier onlyBountyOwner(uint256 _bountyID) {
        require(msg.sender == bountyList[_bountyID].bountyOwner);
        _;
    }

    modifier onlyEntryOwner(uint256 _entryID) {
        require(msg.sender == entryList[_entryID].entryUser);
        _;
    }

    modifier onlyEntryPending( uint256 _entryID) {
        require(entryList[_entryID].status == BountyEntryStatus.Pending);
        _;
    }

    modifier onlyEntryApproved(uint256 _entryID) {
        require(entryList[_entryID].status == BountyEntryStatus.Approved);
        _;
    }

    modifier bountyStatusOngoing(uint256 _bountyID) {
        require(bountyList[_bountyID].status == BountyStatus.Ongoing);
        _;
    }

    modifier bountyStatusCompleted(uint256 _bountyID) {
        require(bountyList[_bountyID].status == BountyStatus.Completed);

        _;
    }

	function addBounty(string _name, string _description, IERC20 _token, uint256 _payout) public {
		require(_token.balanceOf(msg.sender) >= _payout);
		require(_token.allowance(msg.sender, this) >= _payout);

		_token.safeTransferFrom(msg.sender, this, _payout);
		emit TokensDeposited(msg.sender, _payout);

		Bounty storage newBounty = bountyList[bountyCount];
		newBounty.bountyOwner = msg.sender;
		newBounty.name = _name;
		newBounty.description = _description;
		newBounty.token = _token;
		newBounty.payout = _payout;
		newBounty.status = BountyStatus.Ongoing;
		userBounty[msg.sender].push(bountyCount);
		emit BountyAdded(msg.sender, bountyCount);

		bountyCount++;
	}

	function addBountyEntry(uint256 _bountyID, string _documentHash) public validBounty(_bountyID) bountyStatusOngoing(_bountyID) {
		require(bytes(_documentHash).length > 0);

		BountyEntry storage newBountyEntry = entryList[entryCount];
		newBountyEntry.entryUser = msg.sender;
		newBountyEntry.bountyID = _bountyID;
		newBountyEntry.documentHash = _documentHash;
		newBountyEntry.status = BountyEntryStatus.Pending;
		userEntry[msg.sender].push(entryCount);
		emit BountyEntryAdded(msg.sender, entryCount);

		entryCount++;
	}

	function approveBountyEntry(uint256 _entryID) public validEntry(_entryID) bountyStatusOngoing(entryList[_entryID].bountyID) onlyBountyOwner(entryList[_entryID].bountyID) onlyEntryPending(_entryID) {
		BountyEntry storage bountyEntry = entryList[_entryID];
		Bounty storage bounty = bountyList[bountyEntry.bountyID];

		bountyEntry.status = BountyEntryStatus.Approved;
		emit BountyEntryApproved(_entryID);

		bounty.status = BountyStatus.Completed;
		emit BountyCompleted(bountyEntry.bountyID);
	}

	function withdrawBountyPayout(uint256 _entryID) public validEntry(_entryID) bountyStatusCompleted(entryList[_entryID].bountyID) onlyEntryOwner(_entryID) onlyEntryApproved(_entryID) {
		BountyEntry storage bountyEntry = entryList[_entryID];
		Bounty storage bounty = bountyList[bountyEntry.bountyID];

		bountyEntry.status = BountyEntryStatus.Paid;
		(bounty.token).safeTransfer(bountyEntry.entryUser, bounty.payout);
		emit BountyEntryPaid(_entryID);
	}

	function getBounty(uint256 _bountyID) public view returns(address, string, string, IERC20, uint256, BountyStatus) {
		return (bountyList[_bountyID].bountyOwner, bountyList[_bountyID].name, bountyList[_bountyID].description, bountyList[_bountyID].token, bountyList[_bountyID].payout, bountyList[_bountyID].status);
	}

	function getBountyByAddress(address _address) public view returns(uint256[]) {
		return userBounty[_address];
	}

	function getEntry(uint256 _entryID) public view returns(address, uint256, string, BountyEntryStatus) {
		return (entryList[_entryID].entryUser, entryList[_entryID].bountyID, entryList[_entryID].documentHash, entryList[_entryID].status);
	}

	function getBountyEntryByAddress(address _address) public view returns(uint256[]) {
		return userEntry[_address];
	}
}