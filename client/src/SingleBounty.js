import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import Bounty from './Bounty';

const SingleBounty = ({web3, accounts, bountyContract}) => {
	return (
		<Switch>
			<Route exact path='/bounty' component={() => <Redirect to='/' />} />

			<Route path='/bounty/:bountyId' component={({match, history}) => 
				<Bounty
					path='/bounty/:bountyId'
					component={Bounty}
					web3={web3}
					accounts={accounts}
					bountyContract={bountyContract}
					match={match}
					history={history}
				/>
			} />
		</Switch>
	);
}

export default SingleBounty;