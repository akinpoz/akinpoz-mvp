import React, { useEffect, useState } from 'react'
import styles from './locations.module.css'
import history from '../../history'
import { connect } from 'react-redux'
import { getLocations } from '../../actions/locationActions'

function Search(props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [locations, setLocations] = useState(props.locations)
    useEffect(() => {
        if (locations.length === 0) props.getLocations()
        setLocations(props.locations)
    }, [props.locations])
    function handleChange(e) {
        setSearchTerm(e.target.value)
        if (e.target.value === '') {
            setLocations(props.locations)
        }
        else {
            const filteredLocations = locations.filter(location => location.name.toLowerCase().includes(e.target.value.toLowerCase()))
            setLocations(filteredLocations)
        }
    }
    function handleClick(location) {
        history.push(`/location/?location_id=${location._id}`)
    }
    return (
        <div id="search-container" className={styles.search_container}>
            <input placeholder='Search' style={{ borderColor: 'grey', height: '30px', width: "95%", marginLeft: 'auto', marginRight: 'auto', marginBottom: '5%' }} value={searchTerm} onChange={handleChange} />
            {locations.map(location => {
                return (
                    <div key={location._id} style={{ borderBottom: '.5px solid grey', width: "100%", background: 'lightgrey' }}>
                        <div id="search-item-container" style={{ width: "95%", margin: 'auto', cursor: 'pointer' }} onClick={handleClick.bind(null, location)}>
                            <h1>{location.name}</h1>
                        </div>
                    </div>
                )
            }
            )}
        </div>
    )
}

const mapStateToProps = (state) => ({
    locations: state.location.locations
})

export default connect(mapStateToProps, { getLocations })(Search)