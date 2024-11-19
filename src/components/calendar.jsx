import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Paper,
    Box,
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const NavigationBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EventItem = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        boxShadow: theme.shadows[4],
        zIndex: 1000
    }
}));


const CollisionEventItem = styled(EventItem)(({ theme }) => ({
    backgroundColor: theme.palette.error.light,
    '&:hover': {
        backgroundColor: theme.palette.error.main,
    }
}));


const CalendarContainer = styled(Paper)(({ theme }) => ({
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper
}));

const HeaderCell = styled(Box)(({ theme }) => ({
    flex: 1,
    textAlign: 'center',
    padding: theme.spacing(2),
    borderLeft: `1px solid ${theme.palette.divider}`,
}));

const TimeCell = styled(Box)(({ theme }) => ({
    width: '80px',
    height: '60px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    textAlign: 'right',
    padding: theme.spacing(1),
    color: theme.palette.text.secondary
}));

const GridCell = styled(Box)(({ theme }) => ({
    height: '60px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    flex: 1
}));


const Calendar = ({ events, onEditEvent, onDeleteEvent, email, onWeekChange, calculateWeekDates, dateRange, setDateRange }) => {
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [error, setError] = useState("");
    const [currentTag, setCurrentTag] = useState("");
    const [weekOffset, setWeekOffset] = useState(0);



    const getEventStyle = (event) => {
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);

        const dayOfWeek = startDate.getDay();
        const startHour = startDate.getHours() + startDate.getMinutes() / 60;
        const duration = (endDate - startDate) / (1000 * 60 * 60);

        const topPosition = startHour * 60;
        const height = duration * 60;

        return {
            top: `${topPosition}px`,
            left: `${dayOfWeek * 14.28}%`,
            height: `${height}px`,
            width: '13%'
        };
    };


    useEffect(() => {
        const { startDate, endDate } = calculateWeekDates(weekOffset);
        setDateRange({ startDate, endDate });
        onWeekChange();
    }, [weekOffset]);

    const handlePrevWeek = () => {
        setWeekOffset(prev => prev - 1);
    };

    const handleNextWeek = () => {
        setWeekOffset(prev => prev + 1);
    };

    const formatDateRange = () => {
        if (!dateRange.startDate || !dateRange.endDate) return '';

        return `${new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric'
        }).format(dateRange.startDate)} - ${new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(dateRange.endDate)}`;
    };

    const getWeekDates = () => {
        const { weekDates } = calculateWeekDates(weekOffset);
        return weekDates;
    };

    const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 || 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        return `${hour}:00 ${ampm}`;
    });

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsEditDialogOpen(true);
    };

    const handleSave = () => {
        onEditEvent(selectedEvent);
        setIsEditDialogOpen(false);
    };

    const findOverlappingEvents = (event, allEvents) => {
        return allEvents.filter(otherEvent =>
            otherEvent._id !== event._id &&
            new Date(event.startTime) < new Date(otherEvent.endTime) &&
            new Date(event.endTime) > new Date(otherEvent.startTime)
        );
    };

    const validateAndSave = () => {

        if (!selectedEvent.eventTitle.trim()) {
            setError("Event title is required.");
            return;
        }
        if (!selectedEvent.startTime) {
            setError("Start time is required.");
            return;
        }
        if (!selectedEvent.endTime) {
            setError("End time is required.");
            return;
        }

        if (new Date(selectedEvent.startTime) > new Date(selectedEvent.endTime)) {
            setError("Start date must be earlier than or equal to the end date.");
            return;
        }

        setError("");
        handleSave();
    };

    const addTag = (e) => {
        if (e.key === "Enter" && currentTag.trim()) {
            const trimmedTag = currentTag.length > 10
                ? currentTag.trim().substring(0, 7) + "..."
                : currentTag.trim();

            setSelectedEvent({
                ...selectedEvent,
                tags: [...selectedEvent.tags, trimmedTag],
            });

            setCurrentTag("");
        }

    };


    const removeTag = (index) => {
        setSelectedEvent({
            ...selectedEvent,
            tags: selectedEvent.tags.filter((_, i) => i !== index),
        });
        setError("");
    };

    return (
        <CalendarContainer elevation={0}>
            <NavigationBar>
                <IconButton onClick={handlePrevWeek}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6">
                    {formatDateRange()}
                </Typography>
                <IconButton onClick={handleNextWeek}>
                    <ChevronRightIcon />
                </IconButton>
            </NavigationBar>

            <Box display="flex" borderBottom={1} borderColor="divider">
                <Box width={80} flexShrink={0} />
                {getWeekDates().map((date, index) => (
                    <HeaderCell key={index}>
                        <Typography variant="subtitle2">
                            {formatDate(date)}
                        </Typography>
                    </HeaderCell>
                ))}
            </Box>


            <Box display="flex" flex={1} sx={{ overflowY: 'auto' }}>
                <Box width={80} flexShrink={0}>
                    {hours.map((hour, index) => (
                        <TimeCell key={index}>
                            <Typography variant="caption">
                                {hour}
                            </Typography>
                        </TimeCell>
                    ))}
                </Box>


                <Box flex={1} position="relative">
                    <Box display="flex" position="absolute" inset={0}>
                        {Array.from({ length: 7 }).map((_, index) => (
                            <GridCell key={index} />
                        ))}
                    </Box>

                    {hours.map((_, index) => (
                        <Box
                            key={index}
                            height={60}
                            borderBottom={1}
                            borderColor="divider"
                        />
                    ))}

                    {events.map((event) => {
                        const overlappingEvents = findOverlappingEvents(event, events);
                        const hasCollision = overlappingEvents.length > 0;
                        const EventComponent = hasCollision ? CollisionEventItem : EventItem;
                        const tooltipContent = hasCollision ? (
                            <Box>
                                <Typography variant="caption" display="block">
                                    {`${event.eventTitle} :${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" display="block" color="error.light">
                                    Overlapping Events:
                                </Typography>
                                {overlappingEvents.map((overlapEvent) => (
                                    <Typography
                                        key={overlapEvent._id}
                                        variant="caption"
                                        display="block"
                                    >
                                        {`${overlapEvent.eventTitle}: ${formatTime(overlapEvent.startTime)} - ${formatTime(overlapEvent.endTime)}`}
                                    </Typography>
                                ))}
                            </Box>
                        ) : `${event.eventTitle}: ${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
                        return (
                            <Tooltip
                                key={event._id}
                                title={tooltipContent}
                                arrow
                            >
                                <EventComponent
                                    style={getEventStyle(event)}
                                    onClick={() => handleEventClick(event)}
                                >
                                    <Typography variant="caption" fontWeight="bold">
                                        {event.eventTitle}
                                    </Typography>
                                    <Box sx={{
                                        position: 'absolute',
                                        right: 2,
                                        top: 2,
                                        display: 'flex',
                                        gap: '4px'
                                    }}>
                                        {(!event.isGoogleEvent && event.emailId == email) &&
                                            <>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: 'inherit',
                                                        opacity: 0.7,
                                                        '&:hover': { opacity: 1 }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEventClick(event);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: 'inherit',
                                                        opacity: 0.7,
                                                        '&:hover': {
                                                            opacity: 1,
                                                            color: 'error.main'
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteEvent(event._id);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        }
                                    </Box>
                                </EventComponent>
                            </Tooltip>
                        )
                    })}
                </Box>
            </Box>

            <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    <Box display="grid" gap={3} py={2}>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <TextField
                            label="Title"
                            fullWidth
                            value={selectedEvent?.eventTitle || ''}
                            onChange={(e) => setSelectedEvent(prev => ({
                                ...prev,
                                eventTitle: e.target.value
                            }))}
                            disabled={email != selectedEvent?.emailId}
                        />
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={selectedEvent?.startTime ? new Date(new Date(selectedEvent.startTime).getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setSelectedEvent(prev => ({
                                ...prev,
                                startTime: new Date(e.target.value).toISOString()
                            }))}
                            disabled={email != selectedEvent?.emailId}
                        />
                        <TextField
                            label="End Time"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={selectedEvent?.endTime ? new Date(new Date(selectedEvent.endTime).getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setSelectedEvent(prev => ({
                                ...prev,
                                endTime: new Date(e.target.value).toISOString()
                            }))}
                            disabled={email != selectedEvent?.emailId}
                        />
                        <div className="border p-2 w-full h-24 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedEvent?.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-2"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            className="text-white hover:text-red-500"
                                            onClick={() => removeTag(index)}
                                            disabled={email != selectedEvent?.emailId}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <TextField
                                label="Tag"
                                name="user"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                fullWidth
                                margin="normal"
                                onKeyDown={addTag}
                                disabled={email != selectedEvent?.emailId}
                            />
                        </div>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={validateAndSave} variant="contained" disabled={email != selectedEvent?.emailId}>Save Changes</Button>
                </DialogActions>
            </Dialog>
        </CalendarContainer>
    );
};

export default Calendar;
