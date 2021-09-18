import React, { useEffect } from 'react';
import history from '../../history'
import { Redirect } from 'react-router';

function CustomerHome() {
    const location_id = history.location.search.split('=')[1]
    return (
        <div id="customer-home-container">
            {!location_id && <Redirect to="/search" />}
            {location_id && <Redirect to={`/location/?location_id=${location_id}`} />}
        </div>
    )
}

export default CustomerHome