import React, { Component } from 'react';
import BountyItem from './BountyItem';
import Loader from './Loader';
import {Paginator} from 'primereact/paginator';

class ParticipatedBounties extends Component {
	constructor(props) {
		super(props);

		this.state = { 
			web3: this.props.web3,
			accounts: this.props.accounts,
			bountyContract: this.props.bountyContract,
			bounties: [],
			first: 0,
			rows: 9,
			loading: true
		}

		this.onPageChange = this.onPageChange.bind(this);

		this.getBounties();
	}

	getBounties = async () => {
		const { accounts, bountyContract } = this.state;
		const response = await bountyContract.getBountyEntryByAddress(accounts[0]);

		let entry;
		let bounties = [];
		for (let i = 0; i < response.length; i++) {
			entry = await bountyContract.getEntry(response[i].toNumber());
			bounties.push(entry[1].toNumber());
		}

		let unique = [...new Set(bounties)];

		this.setState({
			bounties: unique
		});

		setTimeout(() => {
		    this.setState({
				loading: false
			});
		}, 1000);
		
	}

	onPageChange(event) {
        this.setState({
            first: event.first,
            rows: event.rows
        });
    }

	render() {
		const bountyItems = this.state.bounties.slice().reverse().slice(this.state.first, this.state.first + 
        this.state.rows).map((bountyId) => {
			return (
				<BountyItem 
					bountyId={bountyId}
					key={bountyId}
					web3={this.state.web3}
					accounts={this.state.accounts}
					bountyContract={this.state.bountyContract}
					/>
			);
		});

		return (
			<div className="main-container">
				{this.state.loading ? (<Loader />):(null)}
				<h1>Participated Bounties</h1>
				<hr />
				<div className="row mb-4">	
					{bountyItems}
				</div>

				<Paginator first={this.state.first} rows={this.state.rows} totalRecords={this.state.bounties.length} onPageChange={this.onPageChange}></Paginator>
			</div>
		);
	}
}


export default ParticipatedBounties;