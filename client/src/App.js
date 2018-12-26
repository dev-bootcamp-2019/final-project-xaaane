import React, { Component } from "react";
import BountyApp from "./contracts/BountyApp.json";
import TestToken from "./contracts/TestToken.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {
  state = { balance: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the bounty contract instance.
      const bounty = truffleContract(BountyApp);
      bounty.setProvider(web3.currentProvider);
      const bountyInstance = await bounty.deployed();

      // Get the token contract instance.
      const token = truffleContract(TestToken);
      token.setProvider(web3.currentProvider);
      const tokenInstance = await token.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ 
        web3, accounts, tokenContract: tokenInstance, bountyContract: bountyInstance 
      }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    const { accounts, tokenContract } = this.state;

    // Stores a given value, 5 by default.
    await tokenContract.mint(accounts[0], 1000000000, { from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await tokenContract.balanceOf(accounts[0]);

    // Update state with the result.
    this.setState({ balance: response.toNumber() });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a bounty count value of 0 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The bounty count value is: {this.state.balance}</div>
      </div>
    );
  }
}

export default App;
