import React, {useCallback, useEffect, useRef, useState} from 'react'
import history from '../../history'
import FastpassImage from '../../assets/images/day20-rocket.png'
import RaffleImage from '../../assets/images/raffle_logo.png'
import MenuImage from '../../assets/images/day82-burger.png'
import SurveyImage from '../../assets/images/120-power-of-pen.png'
import MenuMarketImage from '../../assets/images/day4-polariod.png'
import JukeboxImage from '../../assets/images/113-workstation.png'
import {Card, Image} from 'semantic-ui-react'
import styles from './locations.module.css'
import throttle from 'lodash/throttle';
import {connect} from 'react-redux'
import {getLocation} from '../../actions/locationActions'
import {setCampaign} from '../../actions/campaignActions'

const timing = (1 / 60) * 1000;
const decay = v => -0.1 * ((1 / timing) ^ 4) + v;

function Slider(props) {
    const icons = {
        'Fastpass': FastpassImage,
        'Raffle': RaffleImage,
        'Survey': SurveyImage,
    }
    const scrollWrapperRef = useRef()
    const [clickStartX, setClickStartX] = useState();
    const [scrollStartX, setScrollStartX] = useState();
    const [isDragging, setIsDragging] = useState(false);
    const [direction, setDirection] = useState(0);
    const [momentum, setMomentum] = useState(0);
    const [lastScrollX, setLastScrollX] = useState(0);
    const [speed, setSpeed] = useState(0);
    const scrollWrapperCurrent = scrollWrapperRef.current
    const {location, getLocation, setCampaign} = props
    const handleLastScrollX = useCallback(() =>
        throttle(screenX => {
            setLastScrollX(screenX);
        }, timing),
        []
    );
    const handleMomentum = useCallback(() =>
        throttle(nextMomentum => {
            setMomentum(nextMomentum);
            scrollWrapperRef.current.scrollLeft = scrollWrapperRef.current.scrollLeft + nextMomentum * timing * direction;
        }, timing),
        [direction]
    );
    useEffect(() => {
        if (direction !== 0) {
            if (momentum > 0.1 && !isDragging) {
                handleMomentum(decay(momentum));
            } else if (isDragging) {
                setMomentum(speed);
            } else {
                setDirection(0);
            }
        }
    }, [momentum, isDragging, speed, direction, handleMomentum]);
    const location_id = window.location.href.split('=')[1]
    const [loc, setLoc] = useState(location || {music: false, campaigns: [], menu_url: ""})
    useEffect(() => {
        if (location_id && location_id !== '') {
            getLocation(location_id)
        }
    }, [getLocation, location_id])

    useEffect(() => {
        setLoc(location)
    }, [location])

    function handleClick(campaign) {
        setCampaign(campaign)
        history.push(`/campaign/?campaign_id=${campaign._id}`)
    }

    useEffect(() => {
        if (scrollWrapperRef.current) {
            const handleDragStart = e => {
                setClickStartX(e.screenX);
                setScrollStartX(scrollWrapperRef.current.scrollLeft);
                setDirection(0);
            };
            const handleDragMove = e => {
                e.preventDefault();
                e.stopPropagation();

                if (clickStartX !== undefined && scrollStartX !== undefined) {
                    const touchDelta = clickStartX - e.screenX;
                    scrollWrapperRef.current.scrollLeft = scrollStartX + touchDelta;

                    if (Math.abs(touchDelta) > 1) {
                        setIsDragging(true);
                        setDirection(touchDelta / Math.abs(touchDelta));
                        setSpeed(Math.abs((lastScrollX - e.screenX) / timing));
                        handleLastScrollX(e.screenX);
                    }
                }
            };
            const handleDragEnd = () => {
                if (isDragging && clickStartX !== undefined) {
                    setClickStartX(undefined);
                    setScrollStartX(undefined);
                    setIsDragging(false);
                }
            };

            if (scrollWrapperRef.current.ontouchstart === undefined) {
                scrollWrapperRef.current.onmousedown = handleDragStart;
                scrollWrapperRef.current.onmousemove = handleDragMove;
                scrollWrapperRef.current.onmouseup = handleDragEnd;
                scrollWrapperRef.current.onmouseleave = handleDragEnd;
            }
        }
    }, [scrollWrapperCurrent, clickStartX, isDragging, scrollStartX, handleLastScrollX, lastScrollX]);
    return (
        <div className={styles.scroll_box}>
            <div className={styles.scroll_box_wrapper} ref={scrollWrapperRef}>
                <div className={styles.scroll_box_container} role="list"
                     style={{pointerEvents: isDragging ? 'none' : undefined}}>
                    <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-menu`}>
                        <a target="_blank" href={loc.menu_url} rel="noopener noreferrer">
                            <Card>
                                <Image src={MenuImage} wrapped ui={false}/>
                                <Card.Content>
                                    <Card.Header>Menu</Card.Header>
                                    <Card.Meta>
                                        <p style={{color: 'transparent'}}>
                                            -----
                                        </p>
                                    </Card.Meta>
                                </Card.Content>
                            </Card>
                        </a>
                    </div>
                    {loc && loc.music &&
                    <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-jukebox`}>
                        <Card style={{cursor: 'pointer'}} onClick={() => history.push('/customer-jukebox')}>
                            <Image src={JukeboxImage} wrapped ui={false}/>
                            <Card.Content>
                                <Card.Header>Jukebox</Card.Header>
                                <Card.Meta>Play a Song!</Card.Meta>
                            </Card.Content>
                        </Card>
                    </div>}
                    {loc && loc.campaigns.length > 0 && loc.campaigns.map((campaign, index) => {
                        const key = `scroll-box-item-${campaign._id}_${index}`
                        if (campaign.active) {
                            return (
                                <div className={styles.scroll_box__item} role="listitem"
                                     key={key}>
                                    <Card style={{cursor: 'pointer'}} onClick={handleClick.bind(null, campaign)}>
                                        <Image src={icons[campaign.details["type"]]} wrapped ui={false}/>
                                        <Card.Content>
                                            <Card.Header>{campaign.title}</Card.Header>
                                            <Card.Meta>{campaign.details.type}</Card.Meta>
                                        </Card.Content>
                                    </Card>
                                </div>
                            )
                        } else {
                            return <div></div>
                        }
                    })}
                    <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-menumarket`}>
                        <a target="_blank" href="https://apokoz.com/" rel="noopener noreferrer">
                            <Card>
                                <Image src={MenuMarketImage} wrapped ui={false}/>
                                <Card.Content>
                                    <Card.Header>Join our Menu Market Waitlist!</Card.Header>
                                    <Card.Meta>
                                        <p style={{color: 'transparent'}}>
                                            -----
                                        </p>
                                    </Card.Meta>
                                </Card.Content>
                            </Card>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    location: state.location.select_location,
})

export default connect(mapStateToProps, {getLocation, setCampaign})(Slider)
