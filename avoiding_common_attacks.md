# Avoiding Common Attacks

## Reentrancy attack
Reentrancy attack is prevented by modifying the status of the entry before actually processing the transfer.

```
bountyEntry.status = BountyEntryStatus.Paid;
(bounty.token).safeTransfer(bountyEntry.entryUser, bounty.payout);
```

## Integer Overflow and Underflow
I have used the SafeMath.sol library from [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol). The library implements safety checks on mathematical functions that reverts on error.

## Denial of Service
Denial of service attack is prevented by using a withdrawal pattern.
