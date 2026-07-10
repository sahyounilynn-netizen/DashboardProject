const express = require("express");
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../services/eventService");

const router = express.Router();

function parseUserId(value) {
  if (value == null || value === "") {
    const error = new Error("userId is required.");
    error.statusCode = 400;
    throw error;
  }

  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("userId must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  return userId;
}

function parseEventId(value) {
  const eventId = Number(value);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    const error = new Error("Event id must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  return eventId;
}

router.get("/", async (req, res) => {
  try {
    const userId = parseUserId(req.query.userId);
    const events = await getAllEvents(userId);

    res.json({
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = parseUserId(req.body.userId);
    const event = await createEvent(req.body, userId);

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const eventId = parseEventId(req.params.id);
    const userId = parseUserId(req.body.userId);
    const event = await updateEvent(eventId, req.body, userId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to update event",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eventId = parseEventId(req.params.id);
    const userId = parseUserId(req.query.userId);
    const wasDeleted = await deleteEvent(eventId, userId);

    if (!wasDeleted) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
});

module.exports = router;
