import React from 'react';
import { Switch, Route, Redirect, Link, withRouter } from 'react-router-dom'
import Home from './Home';
import AllBounties from './AllBounties';
import MyBounties from './MyBounties';
import ParticipatedBounties from './ParticipatedBounties';
import NewBounty from './NewBounty';
import SingleBounty from './SingleBounty';

const Main = ({location, web3, accounts, bountyContract}) => {
	//console.log(accounts[0]);
	return (
		<div id="content">
			<nav className="navbar navbar-expand-lg navbar-light bg-light d-lg-none">
	            <div className="container-fluid">

	            	<h4>Bounty dApp</h4>
	                <button className="btn btn-accent d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
	                    <i className="fas fa-align-justify"></i>
	                </button>

	                <div className="collapse navbar-collapse" id="navbarSupportedContent">
	                    <ul className="nav navbar-nav ml-auto">
	                        <li className={location.pathname === "/all-bounties" ? 'nav-item active' : 'nav-item'}>
	                            <Link to='/all-bounties' className="nav-link">All Bounties</Link>
	                        </li>
	                        <li className={(location.pathname === "/my-bounties" || location.pathname === "/new-bounty") ? 'nav-item active' : 'nav-item'}>
	                            <Link to='/my-bounties' className="nav-link">My Bounties</Link>
	                        </li>
	                        <li className={location.pathname === "/participated-bounties" ? 'nav-item active' : 'nav-item'}>
	                            <Link to='/participated-bounties'  className="nav-link">Participated Bounties</Link>
	                        </li>
	                    </ul>
	                </div>
	            </div>
	        </nav>
	    	<main>
				<Switch>
					<Route exact path='/' component={Home}/>
					<Route path='/bounty' component={() => 
						<SingleBounty
							path='/bounty'
							component={SingleBounty}
							web3={web3}
							accounts={accounts}
							bountyContract={bountyContract}
						/>
					} />
					<Route path='/all-bounties' component={() => 
						<AllBounties
							path='/all-bounties'
							component={AllBounties}
							web3={web3}
							accounts={accounts}
							bountyContract={bountyContract}
						/>
					} />
					<Route path='/my-bounties' component={() => 
						<MyBounties
							path='/my-bounties'
							component={MyBounties}
							web3={web3}
							accounts={accounts}
							bountyContract={bountyContract}
						/>
					} />
					<Route path='/new-bounty' component={() => 
						<NewBounty
							path='/new-bounty'
							component={NewBounty}
							web3={web3}
							accounts={accounts}
							bountyContract={bountyContract}
						/>
					} />
					<Route path='/participated-bounties' component={() => 
						<ParticipatedBounties
							path='/participated-bounties'
							component={ParticipatedBounties}
							web3={web3}
							accounts={accounts}
							bountyContract={bountyContract}
						/>
					} />
		{/*			<Route path='/all-bounties' component={Roster}/>
					<Route path='/my-bounties' component={Schedule}/>
					<Route path='/participated-bounties' component={Schedule}/>*/}
					<Route component={() => <Redirect to='/' />} />
				</Switch>
			</main>
		</div>

	);
}

export default withRouter(Main);