import React, { Component } from 'react';
import ERC20Detailed from "./contracts/ERC20Detailed.json";
import { BigNumber } from 'bignumber.js';
import truffleContract from "truffle-contract";
import { withRouter, Link } from "react-router-dom"
BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

class BountyItem extends Component {
	constructor(props) {
		super(props);

		this.state = { 
			web3: this.props.web3,
			accounts: this.props.accounts,
			bountyContract: this.props.bountyContract,
			bountyId: this.props.bountyId,
			bountyOwner: '',
			bountyName: '',
			bountyDescription: '',
			bountyToken: '',
			bountyTokenSymbol: '',
			bountyPayout: null,
			bountyStatus: null
		}

		this.getBountyDetails();
	}

	getBountyDetails = async () => {
		const { web3, bountyContract, bountyId } = this.state;
		const response = await bountyContract.getBounty(bountyId);
		//console.log(response);

		const token = truffleContract(ERC20Detailed);
      	token.setProvider(web3.currentProvider);
      	const tokenInstance = await token.at(response[3]);

      	const symbol = await tokenInstance.symbol();

      	const decimals = await tokenInstance.decimals();
      	let payout = new BigNumber(response[4]);
      	payout = payout.dividedBy(Math.pow(10, decimals.toNumber()));
      	//console.log(payout)

      	//console.log(response[5].toNumber());

		this.setState({
			bountyOwner: response[0],
			bountyName: response[1],
			bountyDescription: response[2],
			bountyToken: response[3],
			bountyTokenSymbol: symbol,
			bountyPayout: payout.toString(),
			bountyStatus: response[5].toNumber()
		});
	}

	render() {
		if (this.state.bountyStatus != null) {
			return (
				<div className="col-12 col-md-6 col-xl-4 bounty-item">
					<Link to={'/bounty/' + this.state.bountyId}>
						<div className="card mb-3">
						  <div className="card-header">{this.state.bountyName} {this.state.bountyStatus === 0 ? (<span className="badge badge-primary float-right">Ongoing</span>) : (<span className="badge badge-success float-right">Completed</span>)}</div>
						  <div className="card-body">
						    <p className="card-text card-desc">{this.state.bountyDescription}</p>
						  </div>
						  <div className="card-body card-reward text-center">
						  	<p className="card-subheader my-0">Reward:</p>
						  	<p className="card-text">{this.state.bountyPayout} {this.state.bountyTokenSymbol}</p>
						  </div>
						</div>
					</Link>
				</div>
			);
		} else {
			return (null);
		}
	}
}

export default withRouter(BountyItem);