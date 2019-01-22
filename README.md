# Bounty DApp
This is a bounty platform where users can post bounty requests and also submit bounty entries. It runs on a smart contract built with Solidity as the backend.

## Project Flow
  - Users post bounty requests and deposits their tokens.
  - Other users submit bounty entries.
  - Bounty owner selects a bounty entry and declare it the winner of the bounty.
  - Winner of the bounty claims the reward from the tokens deposited by the bounty owner.

## How to set it up
Requirements:
  - Truffle
  - Node Package Manager (npm)
  - Ganache CLI
  - MetaMask
  
Steps:
  1. Clone the repo
  2. Go into the root directory and run `npm install`
  3. Run Ganache CLI
  4. Run `truffle compile` and `truffle migrate`
  5. Go into the client folder and run `npm install`
  6. Run `npm run start`
  7. Make sure that MetaMask is connected to localhost:8545
  8. Import the seed phrase from Ganache CLI
  9. 10,000 TEST tokens have been minted for the first account generated from the seed phrase, you can use the tokens to post a new bounty.

## Test Cases
There are a total of 14 test cases have been written for BountyApp.sol.

The tests cover posting of bounties, submitting of bounty entries, approving of bounty entry and withdrawal of payout. It also covers incorrect / malicious usage of the smart contract. The tests are written to ensure that the flow of the smart contract aligns with the intended flow of the project, and also to ensure that incorrect or malicious usage of the smart contracts are reverted.

Run `truffle test` in the root directory to run the test cases.
