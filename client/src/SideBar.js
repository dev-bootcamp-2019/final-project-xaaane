import React from 'react';
import { withRouter, Link } from 'react-router-dom';

const SideBar = ({location}) => {
	return (
	    <nav id="sidebar">
	        <div className="sidebar-header">
	            <Link to='/'><h3>Bounty dApp</h3></Link>
	        </div>

	        <ul className="list-unstyled components">
	            <li className={location.pathname === "/all-bounties" ? 'active' : ''}>
	                <Link to='/all-bounties'>All Bounties</Link>
	            </li>
	            <li className={(location.pathname === "/my-bounties" || location.pathname === "/new-bounty") ? 'active' : ''}>
	                <Link to='/my-bounties'>My Bounties</Link>
	            </li>
	            <li className={location.pathname === "/participated-bounties" ? 'active' : ''}>
	                <Link to='/participated-bounties'>Participated Bounties</Link>
	            </li>
	        </ul>
	    </nav>
    );
}

export default withRouter(SideBar);