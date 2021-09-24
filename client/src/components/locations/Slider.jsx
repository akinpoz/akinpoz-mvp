import React, { useEffect, useState, useRef, useCallback } from 'react'
import history from '../../history'
import FastpassImage from '../../assets/images/day20-rocket.png'
import RaffleImage from '../../assets/images/raffle_logo.png'
import MenuImage from '../../assets/images/day82-burger.png'
import SurveyImage from '../../assets/images/120-power-of-pen.png'
import MenuMarketImage from '../../assets/images/day4-polariod.png'
import JukeboxImage from '../../assets/images/113-workstation.png'
import { Card, Image } from 'semantic-ui-react'
import styles from './locations.module.css'
import throttle from 'lodash/throttle';
import { connect } from 'react-redux'
import { getLocation } from '../../actions/locationActions'
import { setCampaign } from '../../actions/campaignActions'

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
    const handleLastScrollX = useCallback(
        throttle(screenX => {
            setLastScrollX(screenX);
        }, timing),
        []
    );
    const handleMomentum = useCallback(
        throttle(nextMomentum => {
            setMomentum(nextMomentum);
            scrollWrapperRef.current.scrollLeft = scrollWrapperRef.current.scrollLeft + nextMomentum * timing * direction;
        }, timing),
        [scrollWrapperCurrent, direction]
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
    const location_id = history.location.search.split('=')[1]
    const [location, setLocation] = useState(props.location || { music: false, campaigns: [], menu_url: "" })
    useEffect(() => {
        if (props.location === "") {
            props.getLocation(location_id)
        }
        setLocation(props.location)
    }, [props.location])
    function handleClick(campaign) {
        props.setCampaign(campaign)
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
                <div className={styles.scroll_box_container} role="list" style={{ pointerEvents: isDragging ? 'none' : undefined }}>
                    <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-menu`}>
                        <a target="_blank" href={location.menu_url}>
                            <Card>
                                <Image src={MenuImage} wrapped ui={false} />
                                <Card.Content>
                                    <Card.Header>Menu</Card.Header>
                                    <Card.Meta>
                                        <p style={{ color: 'transparent' }}>
                                            -----
                                        </p>
                                    </Card.Meta>
                                </Card.Content>
                            </Card>
                        </a>
                    </div>
                    {location && location.music && <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-jukebox`}>
                        <a href="/#/customer-jukebox">
                            <Card>
                                <Image src={JukeboxImage} wrapped ui={false} />
                                <Card.Content>
                                    <Card.Header>Jukebox</Card.Header>
                                    <Card.Meta>Play a Song!</Card.Meta>
                                </Card.Content>
                            </Card>
                        </a>
                    </div>}
                    {location && location.campaigns.length > 0 && location.campaigns.map(campaign => {
                        return (
                            <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-${campaign._id}`}>
                                <a style={{cursor: 'pointer'}} onClick={handleClick.bind(null, campaign)}>
                                    <Card>
                                        <Image src={icons[campaign.details["type"]]} wrapped ui={false} />
                                        <Card.Content>
                                            <Card.Header>{campaign.title}</Card.Header>
                                            <Card.Meta>{campaign.details.type}</Card.Meta>
                                        </Card.Content>
                                    </Card>
                                </a>
                            </div>
                        )
                    })}
                    <div className={styles.scroll_box__item} role="listitem" key={`scroll-box-item-menumarket`}>
                        <a target="_blank" href="https://apokoz.com/">
                            <Card>
                                <Image src={MenuMarketImage} wrapped ui={false} />
                                <Card.Content>
                                    <Card.Header>Join our Menu Market Waitlist!</Card.Header>
                                    <Card.Meta>
                                        <p style={{ color: 'transparent' }}>
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

export default connect(mapStateToProps, { getLocation, setCampaign })(Slider)