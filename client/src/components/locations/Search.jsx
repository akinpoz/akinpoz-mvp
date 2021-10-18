import React, {useEffect, useState} from 'react'
import styles from './locations.module.css'
import history from '../../history'
import {connect} from 'react-redux'
import {getLocations, setLocation} from '../../actions/locationActions'
import {Search as SemanticSearch} from 'semantic-ui-react'

function Search(props) {
    const [searchTerm, setSearchTerm] = useState('')
    const {locations, getLocations, setLocation, no_locations} = props
    const [filteredLocations, setFilteredLocations] = useState(locations)
    useEffect(() => {
        if (locations.length === 0) {
            getLocations()
        }
        setFilteredLocations(locations)
    }, [locations, getLocations, no_locations])


    function handleChange(e) {
        setSearchTerm(e.target.value)
        if (e.target.value === '') {
            setFilteredLocations(locations)
        } else {
            const newFilteredLocations = filteredLocations.filter(location => location.name.toLowerCase().includes(e.target.value.toLowerCase()))
            setFilteredLocations(newFilteredLocations)
        }
    }

    function handleClick(location) {
        setLocation(location)
        history.push(`/location/?location_id=${location._id}`)
    }

    return (
        <div id="search-container" className={styles.search_container}>
            <br/>
            <SemanticSearch
                size='large'
                value={searchTerm}
                onSearchChange={handleChange}
                results={[]}
                showNoResults={false}
                placeholder={'Search'}
            />
            <br/>
            {filteredLocations.map(location => {
                    return (
                        <div key={location._id} style={{
                            borderBottom: '.5px solid grey',
                            width: "90%",
                            maxWidth: 500,
                            background: 'lightgrey',
                            borderRadius: 15,
                            marginBottom: 10
                        }}>
                            <div id="search-item-container" style={{width: "95%", margin: 'auto', cursor: 'pointer'}}
                                 onClick={handleClick.bind(null, location)}>
                                <h1 style={{textAlign: 'center'}}>{location.name}</h1>
                            </div>
                        </div>
                    )
                }
            )}
            <br/>
            {filteredLocations.length === 0 &&
            <h4>No Results :(</h4>
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    locations: state.location.locations,
    no_locations: state.location.no_locations
})

export default connect(mapStateToProps, {getLocations, setLocation})(Search)
