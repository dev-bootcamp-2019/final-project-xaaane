import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import truffleContract from "truffle-contract";
import ERC20Detailed from "./contracts/ERC20Detailed.json";
import { BigNumber } from 'bignumber.js';
import { Redirect } from 'react-router-dom'

class NewBounty extends Component {
	constructor(props) {
		super(props);

		this.state = { 
			web3: this.props.web3,
			accounts: this.props.accounts,
			bountyContract: this.props.bountyContract,
			redirect: null,
			error: null,
			name: '',
			description: '',
			token: '',
			payout: null,
		}
	}

	onSubmit = async (props) => {
		const { web3, accounts, bountyContract } = this.state;
		console.log(props);

		const token = truffleContract(ERC20Detailed);
      	token.setProvider(web3.currentProvider);
      	const tokenInstance = await token.at(props.token);

	    // Stores a given value, 5 by default.
	    //await tokenContract.mint(accounts[0], 1000000000, { from: accounts[0] });

	    // Get the value from the contract to prove it worked.
	    const decimals = await tokenInstance.decimals();
	    let response = new BigNumber(await tokenInstance.balanceOf(accounts[0]));
	    const payout = (new BigNumber(props.payout)).multipliedBy(Math.pow(10, decimals));

	    if (response.isLessThan(payout)) {
	    	this.setState({
	    		error: "You do not have enough tokens!"
	    	});
	    } else {
	    	response = new BigNumber(await tokenInstance.allowance(accounts[0], bountyContract.address));

			//console.log(response.toString());
			//console.log(payout.toString());
	    	if (response.isLessThan(payout)) {
	    		tokenInstance.approve(bountyContract.address, payout.toString(), {from: accounts[0]})
	    		.then(async () => {
	    			bountyContract.addBounty(props.name, props.description, props.token, payout.toString(), {from: accounts[0]})
	    			.then((receipt) => {
	    				console.log(receipt);
	    				for (var i = 0; i < receipt.logs.length; i++) {
						    var log = receipt.logs[i];

						    if (log.event === "BountyAdded") {
						      	this.setState({
			    					redirect: log.args[1].toNumber(),
			    					error: null,
			    					name: '',
									description: '',
									token: '',
									payout: null,
			    				});
					      		break;
						    }
						}

	    				
	    			})
	    			.catch((err) => {
					  	console.log("Failed with error: " + err);
					  	this.setState({
							redirect: null,
							error: "User rejected the transaction",
							name: '',
							description: '',
							token: '',
							payout: null,
						});
					});
	    		})
	    		.catch((err) => {
				  	console.log("Failed with error: " + err);
				  	this.setState({
						redirect: null,
						error: "User rejected the transaction",
						name: '',
						description: '',
						token: '',
						payout: null,
					});
				});
	    	} else {
	    		response = await bountyContract.addBounty(props.name, props.description, props.token, payout.toString(), {from: accounts[0]});
	    	}

	    	
	    	//response = await bountyContract.addBounty(props.name, props.description, props.token, props.payout, {from: accounts[0]});

	    	console.log(response);
	    }

		//window.alert(JSON.stringify(values, 0, 2));
	}

	render() {
		if (this.state.redirect != null) {
			const redirect_url = '/bounty/' + this.state.redirect;
			return (
				<Redirect to={redirect_url} />
			);
		}

		return (
			<div>
				<h1>Create New Bounty</h1>
				<hr />
				<Form 
					onSubmit={this.onSubmit}
					validate={values => {
						const errors = {};
						if (!values.name) {
						  errors.name = "Required";
						}
						if (!values.description) {
						  errors.description = "Required";
						}
						if (!values.token) {
						  errors.token = "Required";
						}
						if (!values.payout) {
						  errors.payout = "Required";
						} else if (isNaN(values.payout)) {
						  errors.payout = "Must be a number";
						} else if (values.payout <= 0 ) {
						  errors.payout = "Must be more than 0";
						}
						return errors;
					}}
					render={({ handleSubmit, submitting, pristine, values, reset }) => {
						return (
						<form id="new-bounty-form" className="py-4" onSubmit={handleSubmit}>
							<div className="row">
								<div className="col-12 col-md-8 col-lg-6 col-xl-4 mx-auto">
							          <Field name="name">
							            {({ input, meta }) => (
							              <div className="form-group">
							                <label>Bounty Name</label>
							                <input {...input} className="form-control" type="text" placeholder="e.g. Amazing Bounty!" values={this.state.name} />
							                {meta.error && meta.touched && <span className="text-danger float-right py-2">{meta.error}</span>}
							              </div>
							            )}
							          </Field>
							          <Field name="description">
							            {({ input, meta }) => (
							              <div className="form-group">
							                <label>Bounty Description</label>
							                <textarea {...input} className="form-control" placeholder="e.g. Amazing bounty description!" rows="4">{this.state.description}</textarea>
							                {meta.error && meta.touched && <span className="text-danger float-right py-2">{meta.error}</span>}
							              </div>
							            )}
							          </Field>
							          <Field name="token">
							            {({ input, meta }) => (
							              <div className="form-group">
							                <label>Token Address</label>
							                <input {...input} className="form-control" type="text" placeholder="e.g. 0x0000000000000000000000000000000000000000"  values={this.state.token} />
							                {meta.error && meta.touched && <span className="text-danger float-right py-2">{meta.error}</span>}
							              </div>
							            )}
							          </Field>
							          <Field name="payout">
							            {({ input, meta }) => (
							              <div className="form-group">
							                <label>Payout</label>
							                <input {...input} className="form-control" type="text" placeholder="e.g. 1000000000"  values={this.state.payout} />
							                {meta.error && meta.touched && <span className="text-danger float-right py-2">{meta.error}</span>}
							              </div>
							            )}
							          </Field>
						        </div>
					        </div>
					        <div className="row">
					        	<div className="col-12 col-md-8 col-lg-6 col-xl-4 mx-auto text-center">
					        		<div className="buttons py-4">
							            <button className="btn btn-accent btn-block" type="submit" disabled={submitting || pristine}>
							              Submit
							            </button>
									</div>
									<small>You'll have to approve 2 transactions if you have not approved the bounty contract to spend on your behalf.</small>
					        	</div>
					        </div>
					        <div className="row mt-4">
					        	<div className="col-12 col-md-8 col-lg-6 col-xl-4 mx-auto text-center">
					        		<span className="text-danger py-4">{ this.state.error }</span>
					        	</div>
					        </div>
					        
				        </form>
				        );
					}
				}
				/>
				    
				
			</div>
		);
	}
}

export default NewBounty;