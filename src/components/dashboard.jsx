import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { APP_URL } from "../url";
import CreateEvent from './createEvent';
import Calendar from './calendar.jsx';
import { useGoogleLogin } from "@react-oauth/google";
import { useSelector, useDispatch } from 'react-redux';
import { toggleButton } from '../actions/toggleActions.jsx';

const Dashboard = ({ email, userName }) => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [googleEvents, setGoogleEvents] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [combinedEvents, setCombinedEvents] = useState([]);
    const isFetchedFromGoogle = useSelector((state) => state.toggle.isFetchedFromGoogle);
    const dispatch = useDispatch();
    const toggleFeatureFlag = () => {
        if (isFetchedFromGoogle) setGoogleEvents([]);
        dispatch(toggleButton());
    };

    useEffect(() => {
        fetchUsers();
        fetchEvents();
    }, []);


    const fetchUsers = async () => {
        try {
            const { data } = await axios.post(`${APP_URL}api/auth/getusers`);
            setUsers(
                data.users
                    .filter(user => user.emailId !== email)
                    .map(user => ({ value: user._id, label: user.emailId }))
            );
        } catch (error) {
            console.error("Error fetching users:", error.response?.data?.message || error.message);
        }
    };

    const handleEditEvent = async (updatedEvent) => {
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data, status } = await axios.post(
                `${APP_URL}api/events/updateevents`,
                {
                    isFetchedFromGoogle: isFetchedFromGoogle,
                    googleEvents: googleEvents,
                    username: userName,
                    emailId: email,
                    ...updatedEvent
                },
                config
            );


            fetchEvents();

        } catch (error) {
            if (error.status == 409) {
                alert('Clashing of events. Not able to schedule new events')
                // console.log('Clashing of events. Not able to schedule new events')
            } else
                console.log(error.response.data.message)
        }

    };


    const fetchEvents = async () => {
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                }
            };

            const { data, status } = await axios.post(
                `${APP_URL}api/events/getevents`,
                {
                    emailIds: selectedUsers.length ? selectedUsers : [email]
                },
                config
            );
            setEvents(data.events);
        } catch (error) {
            console.log(error.response.data.message)
        }
    };

    useEffect(() => {
        fetchEvents();
        getCombineEvents();
    }, [selectedUsers])


    const handleCreateEvent = async (newEvent) => {
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data, status } = await axios.post(
                `${APP_URL}api/events/addevents`,
                {
                    isFetchedFromGoogle: isFetchedFromGoogle,
                    googleEvents: googleEvents,
                    username: userName,
                    emailId: email,
                    ...newEvent
                },
                config
            );

            setShowPopup(false);
            fetchEvents();

        } catch (error) {
            if (error.status == 409) {
                alert('Clashing of events. Not able to schedule new events')
            } else
                console.log(error.response.data.message)
        }
    };

    const handleUserSelect = (selectedOptions) => {
        if (selectedOptions)
            setSelectedUsers([selectedOptions?.label])
        else setSelectedUsers([])
    };

    const handleUserRemove = (removedOption) => {
        setSelectedUsers((prevSelectedUsers) =>
            prevSelectedUsers.filter((label) => label !== removedOption.label)
        );
    };

    const getCombineEvents = () => {

        const istOffset = 5.5 * 60 * 60 * 1000;
        const newEvents = [];
        if (selectedUsers.length == 0) {
            for (let event of googleEvents) {
                try {
                    if (!event.start?.dateTime || !event.end?.dateTime) {
                        console.warn(`Event is missing start or end dateTime: ${JSON.stringify(event)}`);
                        continue;
                    }

                    let eventStartDateTime = new Date(event.start.dateTime);
                    let eventEndDateTime = new Date(event.end.dateTime);

                    eventStartDateTime = new Date(eventStartDateTime.getTime() + istOffset);
                    eventEndDateTime = new Date(eventEndDateTime.getTime() + istOffset);

                    newEvents.push({
                        startTime: eventStartDateTime,
                        endTime: eventEndDateTime,
                        eventTitle: event.description || "No Description",
                        _id: event.id,
                        tags: [],
                        isGoogleEvent: true
                    });
                } catch (err) {
                    console.error(`Error processing event: ${JSON.stringify(event)} - ${err.message}`);
                }
            }
        }

        for (let event of events) {
            newEvents.push({
                ...event,
                isGoogleEvent: false
            });
        }

        setCombinedEvents((prevEvents) => [...prevEvents, ...newEvents]);
    };


    useEffect(() => {
        setCombinedEvents([])
        getCombineEvents();
    }, [googleEvents, events])

    const fetchSync = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                const accessToken = response.access_token;

                const res = await axios.get(
                    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        params: {
                            singleEvents: true,
                            orderBy: "startTime",
                            maxResults: 2500
                        },
                    }
                );

                setGoogleEvents(res.data.items);
                toggleFeatureFlag();
            } catch (error) {
                console.error("Error fetching Google Calendar events", error);
            }
        },
        onError: (error) => {
            console.error("Login Failed", error);
        },
        scope: "https://www.googleapis.com/auth/calendar.readonly",
    });


    const handleDeleteEvent = async (eventId) => {

        const userConfirmation = window.confirm("Do you want to delete this event?");
        if (userConfirmation) {
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                    },
                };

                const { data, status } = await axios.post(
                    `${APP_URL}api/events/deleteevents`,
                    {
                        eventId: eventId
                    },
                    config
                );
                fetchEvents()
            } catch (error) {
                console.log(error.response.data.message)
            }
        }

    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center space-x-4">
                <Select
                    options={users}
                    value={users.filter(user => selectedUsers.includes(user.label))}
                    onChange={handleUserSelect}
                    className="w-[1150px]"
                    placeholder="Filter by Users..."
                    isClearable
                    onInputChange={handleUserRemove}
                />
                {/* <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={fetchEvents}
                >
                    Search
                </button> */}
                {
                    isFetchedFromGoogle ?
                        <button
                            className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600"
                            onClick={toggleFeatureFlag}
                        >
                            Desync
                        </button>
                        :
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={fetchSync}
                        >
                            Sync
                        </button>
                }
                <button
                    className="bg-gray-800 text-white px-2 py-2 rounded hover:bg-gray-900"
                    onClick={() => setModalVisible(true)}
                >
                    Create Event
                </button>
            </div>
            <Calendar
                events={isFetchedFromGoogle ? combinedEvents : events}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                email={email}
            />
            {
                modalVisible &&
                <CreateEvent
                    handleCreateEvent={handleCreateEvent}
                    setModalVisible={setModalVisible}
                    modalVisible={modalVisible}
                />
            }
        </div >
    );
};

export default Dashboard;