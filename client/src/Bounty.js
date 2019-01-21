import React, {Component} from 'react';
import ERC20Detailed from "./contracts/ERC20Detailed.json";
import { BigNumber } from 'bignumber.js';
import truffleContract from "truffle-contract";
import { withRouter, Link } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import IPFS from 'ipfs-api';
import BountyEntryList from './BountyEntryList';
import BountyEntryItem from './BountyEntryItem';
import Loader from './Loader';
import $ from 'jquery';
BigNumber.config({ EXPONENTIAL_AT: 1e+9 });


class Bounty extends Component {
	constructor(props) {
		super(props);

		if(isNaN(this.props.match.params.bountyId)) {
			this.props.history.push('/');
		}

		this.state = { 
			web3: this.props.web3,
			accounts: this.props.accounts,
			bountyContract: this.props.bountyContract,
			bountyId: this.props.match.params.bountyId,
			bountyOwner: '',
			bountyName: '',
			bountyDescription: '',
			bountyToken: '',
			bountyTokenSymbol: '',
			bountyPayout: null,
			bountyStatus: null,
			bountyEntries: [],
			error: null,
			success: null,
			fileName: '',
			winningEntryId: '',
			winningEntryOwner: '',
			winningEntryHash: '',
			winningEntryStatus: null,
			loading: true
		}

		this.getBountyDetails();
	}

	getBountyDetails = async () => {
		const { web3, bountyContract, bountyId } = this.state;
		const response = await bountyContract.getBounty(bountyId);
		console.log(response);

		if (response[0] === "0x0000000000000000000000000000000000000000") {
			this.props.history.push('/');
		}

		const token = truffleContract(ERC20Detailed);
      	token.setProvider(web3.currentProvider);
      	const tokenInstance = await token.at(response[3]);

      	const symbol = await tokenInstance.symbol();

      	const decimals = await tokenInstance.decimals();
      	let payout = new BigNumber(response[4]);
      	payout = payout.dividedBy(Math.pow(10, decimals.toNumber()));
      	//console.log(payout)

      	//console.log(response[5].toNumber());

      	if (response[5].toNumber() == 1) {
      		let winningId, hash, owner, status;
      		for (let i = 0; i < response[6].length; i++) {
				let entry = await bountyContract.getEntry(response[6][i].toNumber());
				if (entry[3] != 0) {
					console.log(entry);
					winningId = response[6][i].toNumber();
					owner = entry[0];
					hash = entry[2];
					status = entry[3].toNumber();
					break;
				}
			}

      		this.setState({
				bountyOwner: response[0],
				bountyName: response[1],
				bountyDescription: response[2],
				bountyToken: response[3],
				bountyTokenSymbol: symbol,
				bountyPayout: payout.toString(),
				bountyStatus: response[5].toNumber(),
				bountyEntries: response[6],
				winningEntryId: winningId,
				winningEntryOwner: owner,
				winningEntryHash: hash,
				winningEntryStatus: status
			});
      	} else {
      		this.setState({
				bountyOwner: response[0],
				bountyName: response[1],
				bountyDescription: response[2],
				bountyToken: response[3],
				bountyTokenSymbol: symbol,
				bountyPayout: payout.toString(),
				bountyStatus: response[5].toNumber(),
				bountyEntries: response[6]
			});
      	}

      	setTimeout(() => {
		    this.setState({
				loading: false
			});
		}, 1000);
	}

	declareWinner = async (entryID) => {
		const { accounts, bountyContract, bountyId } = this.state;

		bountyContract.approveBountyEntry(entryID, {from: accounts[0]})
			.then((receipt) => {
				console.log(receipt);
				for (var i = 0; i < receipt.logs.length; i++) {
				    var log = receipt.logs[i];

				    if (log.event === "BountyEntryApproved") {
				    	this.getBountyDetails();
			      		break;
				    }
				}
				
			});
	}

	claimReward = async (entryID) => {
		const { accounts, bountyContract, bountyId } = this.state;

		bountyContract.withdrawBountyPayout(entryID, {from: accounts[0]})
			.then((receipt) => {
				console.log(receipt);
				for (var i = 0; i < receipt.logs.length; i++) {
				    var log = receipt.logs[i];

				    if (log.event === "BountyEntryPaid") {
				    	this.getBountyDetails();
			      		break;
				    }
				}
				
			});
	}

	componentDidMount() {
		$(document).on('change', ':file', function() {
		    var input = $(this),
		        numFiles = input.get(0).files ? input.get(0).files.length : 1,
		        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		    input.trigger('fileselect', [numFiles, label]);

		    $(".select-file-container .file-label").remove();
	        $(".select-file-container").append("<p class='file-label mt-2 mb-0'>" + label + "</p>");
		});
	}

 	uploadToIPFS = async(reader) => {
    //file is converted to a buffer for upload to IPFS
		const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
    //this.setState({buffer});
		const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

		await ipfs.add(buffer, (err, ipfsHash) => {
        	console.log(err,ipfsHash);

        	const { accounts, bountyContract, bountyId } = this.state;

        	bountyContract.addBountyEntry(bountyId, ipfsHash[0].hash, {from: accounts[0]})
			.then((receipt) => {
				console.log(receipt);
				for (var i = 0; i < receipt.logs.length; i++) {
				    var log = receipt.logs[i];

				    if (log.event === "BountyEntryAdded") {
				    	let newEntries = this.state.bountyEntries;
				    	newEntries.push(receipt.logs[i].args.entryID);
				      	this.setState({
							error: null,
							success: "Your entry has been submitted!",
							bountyEntries: newEntries,
							loading: false

						});
			      		break;
				    }
				}
				
			});
        });
    }

	onSubmit = async (props) => {
		//var ext = props.file.split('.').pop();
		this.setState({
    		loading: true
    	});

		var input = document.getElementById('fileInput');
		var file = input.files[0];
		console.log(input.files[0]);

		var _validFileExtensions = [".jpg", ".jpeg", ".png", ".mp4", ".avi", ".mkv", ".docx", ".pdf", ".txt"];

		var validExt = false;
		for (var i = 0; i < _validFileExtensions.length; i++) {
			var currExt = _validFileExtensions[i];
            if (props.file.substr(props.file.length - currExt.length, currExt.length).toLowerCase() === currExt.toLowerCase()) {
                validExt = true;
                break;
            }
		}

		if (!validExt) {
			this.setState({
	    		error: "Invalid submission format!",
	    		success: null,
	    		loading: false
	    	});
		} else {
			this.setState({
	    		error: null,
	    		success: null
	    	});
			let reader = new window.FileReader();
	        reader.readAsArrayBuffer(file);
	        reader.onloadend = () => this.uploadToIPFS(reader);
		}
	}

	render() {
		return(
			<div className="main-container">
				{this.state.loading ? (<Loader />):(null)}
				<div className="row single-bounty-container">
					<div className="col-12 col-md-6 ml-auto">
						<div className="row">
							<div className="col-12">
								<div className="card mb-3">
								  <div className="card-body">
								  	<h1>{this.state.bountyName}</h1>
								  	<hr />
								    <p className="card-text card-desc">{this.state.bountyDescription}</p>
								  </div>
								</div>
							</div>
						</div>
						{ this.state.bountyOwner === this.state.accounts[0] ?
							(
								<div className="row submission-table-container">
									<div className="col-12">
										<div className="card mb-3">
											<div className="card-body">
												<h4 className="my-0">All Submissions</h4>
											</div>
											<div className="table-responsive bounty-entry-table">
												<table className="table">
													<thead>
														<tr>
															<th className="text-center" scope="col">ID</th>
															<th className="text-center" scope="col">Submission</th>
															<th className="text-center" scope="col">ETH Address</th>
															{ this.state.bountyStatus === 0 ? (<th className="text-center" scope="col"></th>):(null)}
														</tr>
													</thead>
													<BountyEntryList 
														onDeclareWinner={ entryID => this.declareWinner(entryID) }
														bountyEntries = {this.state.bountyEntries}
														web3={this.state.web3}
														accounts={this.state.accounts}
														bountyContract={this.state.bountyContract}
														bountyId={this.state.bountyId}
														bountyStatus={this.state.bountyStatus}
														bountyOwner={this.state.bountyOwner}
														winningEntryStatus={this.state.winningEntryStatus}
													/>
												</table>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="row submission-table-container">
									<div className="col-12">
										<div className="card mb-3">
											<div className="card-body">
												<h4 className="my-0">My Submissions</h4>
											</div>
											<div className="table-responsive bounty-entry-table">
												<table className="table">
													<thead>
														<tr>
															<th className="text-center" scope="col">ID</th>
															<th className="text-center" scope="col">Submission</th>
															<th className="text-center" scope="col">Status</th>
														</tr>
													</thead>
													<BountyEntryList 
														onDeclareWinner={ entryID => this.declareWinner(entryID) }
														bountyEntries = {this.state.bountyEntries}
														web3={this.state.web3}
														accounts={this.state.accounts}
														bountyContract={this.state.bountyContract}
														bountyId={this.state.bountyId}
														bountyStatus={this.state.bountyStatus}
														bountyOwner={this.state.bountyOwner}
														winningEntryStatus={this.state.winningEntryStatus}
													/>
												</table>
											</div>
										</div>
									</div>
								</div>
							)
						}
						
					</div>
					<div className="col-12 col-md-4 mr-auto">
						<div className="card mb-3">
							<div className="card-body text-center">
								<p className="card-subheader my-0">Bounty Status:</p>
							    <h1>{this.state.bountyStatus === 1 ? (<span className="badge badge-success">Completed</span>) : (<span className="badge badge-primary">Ongoing</span>)}</h1>
							</div>
							<div className="card-body text-center">
								<p className="card-subheader my-0">Reward:</p>
								<h1>{this.state.bountyPayout} {this.state.bountyTokenSymbol}</h1>
							</div>
							<div className="card-body card-submissions text-center">
								<h1 className="my-0">{this.state.bountyEntries == null ? 0 : this.state.bountyEntries.length}</h1>
								<p className="card-subheader my-0">Submissions</p>
							</div>
							{ (this.state.bountyOwner === this.state.accounts[0] || this.state.bountyOwner === '' || this.state.bountyStatus == 1) ? 
								(null) : 
								(
									<div className="card-body text-center">
										<p className="card-subheader">Submit Your Entry</p>
										<Form 
											onSubmit={this.onSubmit}
											validate={values => {
												const errors = {};

												if (!values.file) {
												  errors.file = "Required";
												}

												return errors;
											}}
											render={({ handleSubmit, submitting, pristine, values, reset }) => {
												return (
													<form id="submit-entry-form" onSubmit={handleSubmit}>
														<div className="row">
															<div className="col-12 col-md-10 mx-auto text-center">
																<Field name="file">
														            {({ input, meta }) => (
														              <div className="select-file-container">
														              	<label className="btn btn-secondary btn-file my-0">Select File...
														              		<input {...input} type="file" accept=".jpg,.jpeg,.png,.mp4,.avi,.mkv,.docx,.pdf,.txt" id="fileInput" />
														              	</label>
														              	{ this.state.fileName === '' ? (null) : (<p class='file-label mt-2 mb-0'>{ this.state.fileName }</p>)}
														              	{meta.error && meta.touched && <p className="text-danger mb-0">{meta.error}</p>}
														              </div>
														            )}
												          		</Field>
											          		</div>
											          	</div>
											          	<div className="row mt-2">
											          		<div className="col-12 col-md-10 mx-auto text-center">
											          			<small>Accepted formats:<br/>.jpg, .jpeg, .png, .mp4, .avi, .mkv, .docx, .pdf, .txt</small>
												        		<div className="buttons mt-4">
														            <button className="btn btn-accent btn-block" type="submit" disabled={submitting || pristine}>
														              Submit
														            </button>
																</div>
															</div>
											          	</div>
											          	<div className="row mt-4">
												        	<div className="col-12 mx-auto text-center">
												        		<span className="text-danger py-4">{ this.state.error }</span>
												        		<span className="text-success py-4">{ this.state.success }</span>
												        	</div>
												        </div>
													</form>
												);
											}}
										/>
									</div>
								)
							}
							{ this.state.bountyStatus === 0 ? (null) : 
								(
									<div className="card-body card-submissions text-center">
										<p className="card-subheader mt-0 mb-2">Winning Submission:</p>
										<a href={"https://gateway.ipfs.io/ipfs/" + this.state.winningEntryHash} target="_blank" className="btn btn-accent">Click to View</a>
										<p className="card-subheader mt-4 mb-0">Submitted By:</p>
										<p className="text-accent font-weight-bold">{this.state.winningEntryOwner}</p>
										{ (this.state.winningEntryOwner == this.state.accounts[0] && this.state.winningEntryStatus != 2) ? 
											(
												<button onClick={() => this.claimReward(this.state.winningEntryId)} className="btn btn-success">Claim Reward</button>
											):(null)}
									</div>
								)
							}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(Bounty);