import React,{ Component } from 'react';
import BountyEntryItem from './BountyEntryItem';

const BountyEntryList = (props) => {
	const entryItems = props.bountyEntries.slice().reverse().map((bountyEntryId) => {
		return (
			<BountyEntryItem 
				bountyEntryId={bountyEntryId.toNumber()}
				key={bountyEntryId.toNumber()}
				web3={props.web3}
				accounts={props.accounts}
				bountyContract={props.bountyContract}
				bountyId={props.bountyId}
				bountyStatus={props.bountyStatus}
				bountyOwner={props.bountyOwner}
				onDeclareWinner={props.onDeclareWinner}
				winningEntryStatus={props.winningEntryStatus}
				/>
			);
	});

	return (
		<tbody>
			{entryItems}
		</tbody>
	);
}

export default BountyEntryList;