# Design Patterns Decisions
There are 2 design patterns adopted for the development of BountyApp.sol. One is the use of a circuit breaker and the other is the use of a withdrawal pattern.

## Circuit Breaker
The circuit breaker is in place in case new errors are discovered. This allows the pausing of smart contract. Only the smart contract owner has the ability to trigger the circuit breaker.

## Withdrawal Pattern
A withdrawal pattern is adopted to prevent malicious actors from blocking the contract from execution. Upon approval of the bounty entry, the winning entry owner has to withdraw the funds manually.
