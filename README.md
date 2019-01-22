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
  
Steps:
  1. Clone the repo.
  2. Go into the root directory and run `npm install`
  3. Run Ganache CLI
  4. Run `truffle compile` and `truffle migrate`
  5. Go into the client folder and run `npm install`
  6. Run `npm run start`
