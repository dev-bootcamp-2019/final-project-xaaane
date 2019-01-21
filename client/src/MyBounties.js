import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import BountyItem from './BountyItem';
import Loader from './Loader';
import {Paginator} from 'primereact/paginator';

class MyBounties extends Component {
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
		const response = await bountyContract.getBountyByAddress(accounts[0]);
		//console.log(response);

		this.setState({
			bounties: response
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
					bountyId={bountyId.toNumber()}
					key={bountyId.toNumber()}
					web3={this.state.web3}
					accounts={this.state.accounts}
					bountyContract={this.state.bountyContract}
					/>
			);
		});

		return (
			<div className="main-container">
				{this.state.loading ? (<Loader />):(null)}
				<h1>My Bounties</h1>
				<hr />
				<Link to='/new-bounty' className="mb-4 btn btn-primary"><i className="fas fa-plus"></i> Create New Bounty</Link>
				<div className="row mb-4">	
					{bountyItems}
				</div>

				<Paginator first={this.state.first} rows={this.state.rows} totalRecords={this.state.bounties.length} onPageChange={this.onPageChange}></Paginator>
			</div>
		);
	}
}

export default MyBounties;