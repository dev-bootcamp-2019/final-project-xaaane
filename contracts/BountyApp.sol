pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./IERC20.sol";
import "./SafeERC20.sol";

/** @title Bounty App. */
contract BountyApp is Ownable {
	using SafeMath for uint256;
	using SafeERC20 for IERC20;

	bool private stopped = false;
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
		uint256[] entries;
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
	event EmergencyStop();

	/** @dev Fallback function set to revert.
      */
	function() public payable {
		revert();
	}

	/** @dev Throws if ID of the bounty is invalid
      * @param _bountyID The ID of the bounty.
      */
	modifier validBounty(uint256 _bountyID) {
        require(bountyList[_bountyID].bountyOwner != address(0));
        _;
    }

    /** @dev Throws if ID of the bounty entry is invalid
      * @param _entryID The ID of the bounty entry.
      */
    modifier validEntry(uint256 _entryID) {
        require(entryList[_entryID].entryUser != address(0));
        _;
    }

    /** @dev Throws if called by any account other than the bounty owner.
      * @param _bountyID The ID of the bounty.
      */
	modifier onlyBountyOwner(uint256 _bountyID) {
        require(msg.sender == bountyList[_bountyID].bountyOwner);
        _;
    }

    /** @dev Throws if called by the bounty owner.
      * @param _bountyID The ID of the bounty.
      */
    modifier notBountyOwner(uint256 _bountyID) {
        require(msg.sender != bountyList[_bountyID].bountyOwner);
        _;
    }

    /** @dev Throws if called by any account other than the bounty entry owner.
      * @param _entryID The ID of the bounty entry.
      */
    modifier onlyEntryOwner(uint256 _entryID) {
        require(msg.sender == entryList[_entryID].entryUser);
        _;
    }

    /** @dev Throws if bounty entry status is not pending.
      * @param _entryID The ID of the bounty entry.
      */
    modifier onlyEntryPending( uint256 _entryID) {
        require(entryList[_entryID].status == BountyEntryStatus.Pending);
        _;
    }

    /** @dev Throws if bounty entry status is not approved.
      * @param _entryID The ID of the bounty entry.
      */
    modifier onlyEntryApproved(uint256 _entryID) {
        require(entryList[_entryID].status == BountyEntryStatus.Approved);
        _;
    }

    /** @dev Throws if bounty status is not ongoing.
      * @param _bountyID The ID of the bounty.
      */
    modifier bountyStatusOngoing(uint256 _bountyID) {
        require(bountyList[_bountyID].status == BountyStatus.Ongoing);
        _;
    }

    /** @dev Throws if bounty status is not completed.
      * @param _bountyID The ID of the bounty.
      */
    modifier bountyStatusCompleted(uint256 _bountyID) {
        require(bountyList[_bountyID].status == BountyStatus.Completed);

        _;
    }

    /** @dev Throws if emergency stop is actived
      */
    modifier stopInEmergency() { 
    	require(!stopped);
    	_; 
    }

    /** @dev Throws if emergency stop is not actived
      */
	modifier onlyInEmergency() {
		require(stopped);
		_; 
	}


	/** @dev Adds a new bounty
      * @param _name The name of the bounty.
      * @param _description The description of the bounty.
      * @param _token The address of the token used as the reward for the bounty.
      * @param _payout The payout of the bounty.
      */
	function addBounty(string _name, string _description, IERC20 _token, uint256 _payout) public stopInEmergency {
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

	/** @dev Adds a new bounty entry
      * @param _bountyID The ID of the bounty.
      * @param _documentHash The IPFS hash of the document.
      */
	function addBountyEntry(uint256 _bountyID, string _documentHash) public validBounty(_bountyID) bountyStatusOngoing(_bountyID) notBountyOwner(_bountyID) stopInEmergency{
		require(bytes(_documentHash).length > 0);

		BountyEntry storage newBountyEntry = entryList[entryCount];
		newBountyEntry.entryUser = msg.sender;
		newBountyEntry.bountyID = _bountyID;
		newBountyEntry.documentHash = _documentHash;
		newBountyEntry.status = BountyEntryStatus.Pending;
		userEntry[msg.sender].push(entryCount);

		Bounty storage bounty = bountyList[_bountyID];
		bounty.entries.push(entryCount);

		emit BountyEntryAdded(msg.sender, entryCount);

		entryCount++;
	}

	/** @dev Approves a bounty entry
      * @param _entryID The ID of the bounty entry.
      */
	function approveBountyEntry(uint256 _entryID) public validEntry(_entryID) bountyStatusOngoing(entryList[_entryID].bountyID) onlyBountyOwner(entryList[_entryID].bountyID) onlyEntryPending(_entryID) stopInEmergency {
		BountyEntry storage bountyEntry = entryList[_entryID];
		Bounty storage bounty = bountyList[bountyEntry.bountyID];

		bountyEntry.status = BountyEntryStatus.Approved;
		emit BountyEntryApproved(_entryID);

		bounty.status = BountyStatus.Completed;
		emit BountyCompleted(bountyEntry.bountyID);
	}

	/** @dev Withdrawal of bounty payout
      * @param _entryID The ID of the bounty entry.
      */
	function withdrawBountyPayout(uint256 _entryID) public validEntry(_entryID) bountyStatusCompleted(entryList[_entryID].bountyID) onlyEntryOwner(_entryID) onlyEntryApproved(_entryID) stopInEmergency {
		BountyEntry storage bountyEntry = entryList[_entryID];
		Bounty storage bounty = bountyList[bountyEntry.bountyID];

		bountyEntry.status = BountyEntryStatus.Paid;
		(bounty.token).safeTransfer(bountyEntry.entryUser, bounty.payout);
		emit BountyEntryPaid(_entryID);
	}

	/** @dev Circuit breaker to stop contract functions
      */
	function toggleEmergencyStop() onlyOwner public {
	    stopped = !stopped;
	    emit EmergencyStop();
	}

	/** @dev Returns information of a bounty.
      * @param _bountyID The ID of the bounty.
      * @return An address specifying the bounty owner.
      * @return A string specifying the name of the bounty.
      * @return A string specifying the description of the bounty.
      * @return An address specifying the token used as the reward for the bounty.
      * @return A uint256 specifying the payout of the bounty.
      * @return A uint specifying the status of the bounty.
      * @return An array of uint256 specifying the entries of the bounty.
      */
	function getBounty(uint256 _bountyID) public view returns(address, string, string, IERC20, uint256, BountyStatus, uint256[]) {
		return (bountyList[_bountyID].bountyOwner, bountyList[_bountyID].name, bountyList[_bountyID].description, bountyList[_bountyID].token, bountyList[_bountyID].payout, bountyList[_bountyID].status, bountyList[_bountyID].entries);
	}

	/** @dev Returns bounties created by an address.
      * @param _address The address to search for.
      * @return An array of uint256 specifying the bounties created by the address.
      */
	function getBountyByAddress(address _address) public view returns(uint256[]) {
		return userBounty[_address];
	}

	/** @dev Returns information of a bounty entry.
      * @param _entryID The ID of the bounty entry.
      * @return An address specifying the bounty entry owner.
      * @return A uint256 specifying the ID of the bounty that the bounty entry belongs to.
      * @return A string specifying IPFS hash of the bounty entry document.
      * @return A uint specifying the status of the bounty entry.
      */
	function getEntry(uint256 _entryID) public view returns(address, uint256, string, BountyEntryStatus) {
		return (entryList[_entryID].entryUser, entryList[_entryID].bountyID, entryList[_entryID].documentHash, entryList[_entryID].status);
	}

	/** @dev Returns bounty entries by an address.
      * @param _address The address to search for.
      * @return An array of uint256 specifying the bounty entries by the address.
      */
	function getBountyEntryByAddress(address _address) public view returns(uint256[]) {
		return userEntry[_address];
	}
}