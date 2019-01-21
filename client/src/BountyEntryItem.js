import React, { Component } from 'react';

class BountyEntryItem extends Component {
	constructor(props){
		super(props);

		this.state = { 
			web3: this.props.web3,
			accounts: this.props.accounts,
			bountyContract: this.props.bountyContract,
			bountyId: this.props.bountyId,
			bountyStatus: this.props.bountyStatus,
			bountyOwner: this.props.bountyOwner,
			bountyEntryId: this.props.bountyEntryId,
			bountyEntryOwner: '',
			bountyEntryHash: '',
			bountyEntryStatus: '',
			winningEntryStatus: this.props.winningEntryStatus
		}

		this.getBountyEntryDetails();
	}

	componentWillReceiveProps() {
	  this.getBountyEntryDetails();
	}

	getBountyEntryDetails = async () => {
		const { bountyContract, bountyEntryId } = this.state;
		const response = await bountyContract.getEntry(bountyEntryId);
		//console.log(response);

		const bountyEntryStatus = ["Pending", "Approved", "Paid"];

		this.setState({
			bountyEntryOwner: response[0],
			bountyEntryHash: response[2],
			bountyEntryStatus: bountyEntryStatus[response[3].toNumber()],
		});
	}

	render() {
		if (this.state.accounts[0] === this.state.bountyOwner) {
			return (
				<tr className="bounty-entry-row">
					<td className="bounty-entry-id text-center">{ this.state.bountyEntryId }</td>
					<td className="bounty-entry-link text-center"><a href={"https://gateway.ipfs.io/ipfs/" + this.state.bountyEntryHash} target="_blank">Click to View</a></td>
					<td className="bounty-entry-address text-center text-truncate">{ this.state.bountyEntryOwner }</td>
					{this.state.bountyStatus === 0 ? (<td className="text-center"><button onClick={() => this.props.onDeclareWinner(this.state.bountyEntryId)} className="btn btn-accent">Declare Winner</button></td>) : (null)}
				</tr>
			);
		} else {
			if (this.state.accounts[0] === this.state.bountyEntryOwner) {
				return (
					<tr className="bounty-entry-row">
						<td className="bounty-entry-id text-center">{ this.state.bountyEntryId }</td>
						<td className="bounty-entry-link text-center"><a href={"https://gateway.ipfs.io/ipfs/" + this.state.bountyEntryHash} target="_blank">Click to View</a></td>
						<td className="bounty-entry-address text-center">{ this.state.bountyEntryStatus }</td>
					</tr>
				);
			} else {
				return(null);
			}
		}
	}
}

export default BountyEntryItem;