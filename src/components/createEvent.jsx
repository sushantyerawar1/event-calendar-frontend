import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

const CreateEvent = ({ handleCreateEvent, setModalVisible, modalVisible }) => {
    const [newEvent, setNewEvent] = useState({ eventTitle: "", startTime: "", endTime: "", tags: [], bgcolor: '' });
    const [currentTag, setCurrentTag] = useState("");
    const [error, setError] = useState("");

    const handleCloseModal = () => {
        setModalVisible(false);
        setNewEvent({
            eventTitle: "", startTime: "", endTime: "", tags: [], bgcolor: ""
        });
    };


    const validateAndSave = () => {

        if (!newEvent.eventTitle.trim()) {
            setError("Event title is required.");
            return;
        }
        if (!newEvent.startTime) {
            setError("Start time is required.");
            return;
        }
        if (!newEvent.endTime) {
            setError("End time is required.");
            return;
        }

        if (new Date(newEvent.startTime) > new Date(newEvent.endTime)) {
            setError("Start date must be earlier than or equal to the end date.");
            return;
        }

        setError("");
        handleCreateEvent(newEvent);
        handleCloseModal();
    };

    const addTag = (e) => {
        if (e.key === "Enter" && currentTag.trim()) {
            const trimmedTag = currentTag.length > 10
                ? currentTag.trim().substring(0, 7) + "..."
                : currentTag.trim();

            setNewEvent({
                ...newEvent,
                tags: [...newEvent.tags, trimmedTag],
            });

            setCurrentTag("");
        }

    };



    const removeTag = (index) => {
        setNewEvent({
            ...newEvent,
            tags: newEvent.tags.filter((_, i) => i !== index),
        });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateAndSave();
    };


    return (
        <div className="max-w-10xl mx-auto p-4 bg-white rounded-xl shadow-lg">
            <Dialog open={modalVisible} onClose={handleCloseModal}>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogContent>
                    <form>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <TextField
                            label="Event Title"
                            name="title"
                            value={newEvent.eventTitle}
                            onChange={(e) => setNewEvent({ ...newEvent, eventTitle: e.target.value })}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            label="Start Time"
                            name="startTime"
                            type="datetime-local"
                            value={newEvent.startTime}
                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="End Time"
                            name="endTime"
                            type="datetime-local"
                            value={newEvent.endTime}
                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <div className="border p-2 w-full h-24 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {newEvent.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-2"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            className="text-white hover:text-red-500"
                                            onClick={() => removeTag(index)}
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
                            />
                        </div>
                        <DialogActions>
                            <Button onClick={handleCloseModal} color="secondary">Cancel</Button>
                            <Button onClick={handleSubmit} color="primary">Save Event</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CreateEvent;


