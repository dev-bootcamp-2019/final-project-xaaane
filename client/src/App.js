import React, { Component } from "react";
import BountyApp from "./contracts/BountyApp.json";
import TestToken from "./contracts/TestToken.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import SideBar from './SideBar';
import Main from "./Main";
import { BigNumber } from 'bignumber.js';

import "./App.css";
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';



class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null, 
      accounts: null, 
      tokenContract: null,
      bountyContract: null,
    }
  }

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
      // this.setState({ 
      //   web3, accounts, tokenContract: tokenInstance, bountyContract: bountyInstance 
      // }, this.runExample);

      this.setState({ 
        web3, accounts, tokenContract: tokenInstance, bountyContract: bountyInstance 
      });

      this.runExample();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    const { accounts, tokenContract, bountyContract } = this.state;

    // Stores a given value, 5 by default.
    //await tokenContract.mint(accounts[0], "1000000000000000000000000000", { from: accounts[0] });
    //await tokenContract.approve(bountyContract.address, 0, { from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = new BigNumber(await tokenContract.balanceOf(accounts[0]));

    console.log(response.toString());

    // Update state with the result.
    //this.setState({ balance: response.toNumber() });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <SideBar />
        <Main 
          web3={this.state.web3}
          accounts={this.state.accounts}
          bountyContract={this.state.bountyContract}
        />
      </div>
    );
  }
}

export default App;
