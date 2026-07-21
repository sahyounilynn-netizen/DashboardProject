import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  EllipsisVertical,
  Eye,
  Flag,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Repeat,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EVENT_COLORS = ["blue", "sky", "indigo", "green", "amber", "rose"];
const VIEW_OPTIONS = ["month", "week", "day"];

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function formatTimeKey(date) {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function getDateOnlyKey(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const directDateMatch = trimmedValue.match(/^(\d{4}-\d{2}-\d{2})/);

    if (directDateMatch) {
      return directDateMatch[1];
    }
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value).slice(0, 10);
  }

  return formatDateKey(parsedDate);
}

function isDateWithinRange(dateKey, startValue, endValue) {
  const startDateKey = getDateOnlyKey(startValue);
  const endDateKey = getDateOnlyKey(endValue);

  if (!dateKey || !startDateKey || !endDateKey) {
    return false;
  }

  return startDateKey <= dateKey && endDateKey >= dateKey;
}

function normalizeDateTimeInput(value) {
  return String(value).replace(" ", "T");
}

function getDateFromValue(value) {
  return new Date(normalizeDateTimeInput(value));
}

function getDateTimeParts(value) {
  const normalized = normalizeDateTimeInput(value);

  return {
    date: normalized.slice(0, 10),
    time: normalized.slice(11, 16),
  };
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getSelectedDateLabel(dateKey) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function getShortDateLabel(dateKey) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function buildCalendarDays(currentMonth) {
  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function startOfWeek(date) {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
}

function buildWeekDays(dateKey) {
  const baseDate = new Date(`${dateKey}T00:00:00`);
  const weekStart = startOfWeek(baseDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
}

function getClosestScheduleDate(tasks, events) {
  const today = new Date();
  const allDates = [
    ...tasks.map((task) => getDateOnlyKey(task.due_date)).filter(Boolean),
    ...events.flatMap((event) =>
      [getDateOnlyKey(event.start_at), getDateOnlyKey(event.end_at)].filter(
        Boolean
      )
    ),
  ];

  if (allDates.length === 0) {
    return formatDateKey(today);
  }

  return allDates.sort((firstDate, secondDate) => {
    const firstDistance = Math.abs(
      new Date(`${firstDate}T00:00:00`).getTime() - today.getTime()
    );
    const secondDistance = Math.abs(
      new Date(`${secondDate}T00:00:00`).getTime() - today.getTime()
    );

    return firstDistance - secondDistance || firstDate.localeCompare(secondDate);
  })[0];
}

function isTaskOverdue(task) {
  const dueDateKey = getDateOnlyKey(task.due_date);

  if (!dueDateKey || task.status === "completed") {
    return false;
  }

  return dueDateKey < formatDateKey(new Date());
}

function getTaskChipStyles(task) {
  if (task.status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
  }

  if (isTaskOverdue(task)) {
    return "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200";
  }

  return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200";
}

function getEventColorClasses(color) {
  if (color === "green") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
  }

  if (color === "sky") {
    return "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-200";
  }

  if (color === "indigo") {
    return "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200";
  }

  if (color === "amber") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200";
  }

  if (color === "rose") {
    return "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200";
  }

  return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200";
}

function getEventTimeLabel(event) {
  if (event.is_all_day) {
    return "All day";
  }

  const startDate = getDateFromValue(event.start_at);
  const endDate = getDateFromValue(event.end_at);

  return `${formatTimeKey(startDate)} - ${formatTimeKey(endDate)}`;
}

function getDefaultEventForm(dateKey) {
  return {
    title: "",
    description: "",
    start_date: dateKey,
    start_time: "09:00",
    end_date: dateKey,
    end_time: "10:00",
    color: "blue",
    is_all_day: false,
    recurrence_rule: "",
    reminder_minutes: "",
    task_id: "",
  };
}

function getEventFormFromEvent(event) {
  const startParts = getDateTimeParts(event.start_at);
  const endParts = getDateTimeParts(event.end_at);

  return {
    title: event.title ?? "",
    description: event.description ?? "",
    start_date: startParts.date,
    start_time: startParts.time,
    end_date: endParts.date,
    end_time: endParts.time,
    color: event.color ?? "blue",
    is_all_day: Boolean(event.is_all_day),
    recurrence_rule: event.recurrence_rule ?? "",
    reminder_minutes: event.reminder_minutes ?? "",
    task_id: event.task_id ? String(event.task_id) : "",
  };
}

function mapFormToEventPayload(form) {
  const startAt = form.is_all_day
    ? `${form.start_date}T00:00:00`
    : `${form.start_date}T${form.start_time}:00`;
  const endAt = form.is_all_day
    ? `${form.end_date}T23:59:00`
    : `${form.end_date}T${form.end_time}:00`;

  return {
    title: form.title,
    description: form.description,
    start_at: startAt,
    end_at: endAt,
    color: form.color,
    is_all_day: form.is_all_day,
    recurrence_rule: form.recurrence_rule || null,
    reminder_minutes:
      form.reminder_minutes === "" ? null : Number(form.reminder_minutes),
    taskId: form.task_id === "" ? null : Number(form.task_id),
  };
}

function getTaskIcon(task) {
  if (task.status === "completed") {
    return CheckCircle2;
  }

  if (isTaskOverdue(task)) {
    return AlertTriangle;
  }

  return Flag;
}

function getTodayDateKey() {
  return formatDateKey(new Date());
}

function getWeekBounds(dateKey) {
  const baseDate = new Date(`${dateKey}T00:00:00`);
  const weekStart = startOfWeek(baseDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    startKey: formatDateKey(weekStart),
    endKey: formatDateKey(weekEnd),
  };
}

function getMonthBounds(dateKey) {
  const baseDate = new Date(`${dateKey}T00:00:00`);
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  return {
    startKey: formatDateKey(monthStart),
    endKey: formatDateKey(monthEnd),
  };
}

function doesDateRangeOverlap(startKey, endKey, rangeStartKey, rangeEndKey) {
  if (!startKey || !endKey || !rangeStartKey || !rangeEndKey) {
    return false;
  }

  return startKey <= rangeEndKey && endKey >= rangeStartKey;
}

function buildEventRecord(event) {
  const startKey = getDateOnlyKey(event.start_at);
  const endKey = getDateOnlyKey(event.end_at) ?? startKey;

  return {
    ...event,
    endKey,
    searchText: `${event.title ?? ""} ${event.description ?? ""}`.toLowerCase(),
    startKey,
  };
}

function isEventToday(eventRecord, todayKey) {
  return doesDateRangeOverlap(
    eventRecord.startKey,
    eventRecord.endKey,
    todayKey,
    todayKey
  );
}

function isEventPast(eventRecord, todayKey) {
  return Boolean(eventRecord.endKey && eventRecord.endKey < todayKey);
}

function isEventUpcoming(eventRecord, todayKey) {
  return Boolean(
    eventRecord.startKey &&
      eventRecord.startKey > todayKey &&
      !isEventPast(eventRecord, todayKey)
  );
}

function isEventThisWeek(eventRecord, weekStartKey, weekEndKey) {
  return doesDateRangeOverlap(
    eventRecord.startKey,
    eventRecord.endKey,
    weekStartKey,
    weekEndKey
  );
}

function applyQuickEventFilter(eventRecords, quickFilter, todayKey, weekStartKey, weekEndKey) {
  if (quickFilter === "today") {
    return eventRecords.filter((eventRecord) => isEventToday(eventRecord, todayKey));
  }

  if (quickFilter === "upcoming") {
    return eventRecords.filter((eventRecord) =>
      isEventUpcoming(eventRecord, todayKey)
    );
  }

  if (quickFilter === "week") {
    return eventRecords.filter((eventRecord) =>
      isEventThisWeek(eventRecord, weekStartKey, weekEndKey)
    );
  }

  if (quickFilter === "past") {
    return eventRecords.filter((eventRecord) => isEventPast(eventRecord, todayKey));
  }

  return eventRecords;
}

function formatDateTimeLabel(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(getDateFromValue(value));
}

function formatEventDateRangeLabel(event) {
  const startKey = getDateOnlyKey(event.start_at);
  const endKey = getDateOnlyKey(event.end_at);

  if (!startKey) {
    return "";
  }

  const startLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${startKey}T00:00:00`));

  if (!endKey || endKey === startKey) {
    return startLabel;
  }

  const endLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${endKey}T00:00:00`));

  return `${startLabel} - ${endLabel}`;
}

function getReminderLabel(value) {
  if (value == null || value === "") {
    return "";
  }

  const minutes = Number(value);

  if (minutes === 1440) {
    return "1 day before";
  }

  if (minutes === 60) {
    return "1 hour before";
  }

  return `${minutes} min before`;
}

function formatColorLabel(color) {
  if (!color) {
    return "Blue";
  }

  return color.charAt(0).toUpperCase() + color.slice(1);
}

function sortEvents(items, sortBy) {
  const sortedItems = [...items];

  sortedItems.sort((firstEvent, secondEvent) => {
    if (sortBy === "newest") {
      return (
        new Date(secondEvent.created_at ?? secondEvent.start_at).getTime() -
        new Date(firstEvent.created_at ?? firstEvent.start_at).getTime()
      );
    }

    if (sortBy === "oldest") {
      return (
        new Date(firstEvent.created_at ?? firstEvent.start_at).getTime() -
        new Date(secondEvent.created_at ?? secondEvent.start_at).getTime()
      );
    }

    const firstStart = new Date(firstEvent.start_at).getTime();
    const secondStart = new Date(secondEvent.start_at).getTime();

    return firstStart - secondStart || firstEvent.title.localeCompare(secondEvent.title);
  });

  return sortedItems;
}

function EventModalShell({ children, onClose, subtitle, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
            ) : null}
          </div>

          <Button
            aria-label="Close"
            className="shrink-0"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function EventDetailsModal({ event, onClose, onDelete, onEdit, tasks }) {
  const linkedTask = tasks.find((task) => task.id === event.task_id) ?? null;
  const reminderLabel = getReminderLabel(event.reminder_minutes);

  return (
    <EventModalShell
      onClose={onClose}
      subtitle="Event details"
      title={event.title}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getEventColorClasses(event.color)}`}
          >
            {formatColorLabel(event.color)}
          </span>
          <span className="inline-flex items-center rounded-full bg-[var(--bg-panel-soft)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
            {event.is_all_day ? "All day" : "Scheduled"}
          </span>
          {reminderLabel ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-panel-soft)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
              <Bell className="h-3.5 w-3.5" />
              {reminderLabel}
            </span>
          ) : null}
          {event.recurrence_rule ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-panel-soft)] px-3 py-1 text-xs font-medium capitalize text-[var(--text-secondary)]">
              <Repeat className="h-3.5 w-3.5" />
              {event.recurrence_rule}
            </span>
          ) : null}
        </div>

        <Card className="rounded-3xl">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {formatEventDateRangeLabel(event)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Time
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {getEventTimeLabel(event)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Starts
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {formatDateTimeLabel(event.start_at)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Ends
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {formatDateTimeLabel(event.end_at)}
              </p>
            </div>

            {linkedTask ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Linked task
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {linkedTask.title}
                </p>
              </div>
            ) : null}

            {event.description ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                  {event.description}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => onEdit(event)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button className="gap-2" onClick={() => onDelete(event)} variant="danger">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </EventModalShell>
  );
}

function EventManagementPage({
  error,
  events,
  isSidebarVisible,
  onEventCreate,
  onEventDelete,
  onEventUpdate,
  onSidebarToggle,
  tasks,
}) {
  const todayKey = getTodayDateKey();
  const { startKey: weekStartKey, endKey: weekEndKey } = getWeekBounds(todayKey);
  const { startKey: monthStartKey, endKey: monthEndKey } = getMonthBounds(todayKey);
  const [quickFilter, setQuickFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nearest");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [openMenuEventId, setOpenMenuEventId] = useState(null);
  const [eventForm, setEventForm] = useState(() => getDefaultEventForm(todayKey));
  const [eventFormError, setEventFormError] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const eventRecords = useMemo(
    () => events.map((event) => buildEventRecord(event)),
    [events]
  );

  const quickFilterCounts = useMemo(
    () => ({
      all: eventRecords.length,
      upcoming: applyQuickEventFilter(
        eventRecords,
        "upcoming",
        todayKey,
        weekStartKey,
        weekEndKey
      ).length,
      today: applyQuickEventFilter(
        eventRecords,
        "today",
        todayKey,
        weekStartKey,
        weekEndKey
      ).length,
      week: applyQuickEventFilter(
        eventRecords,
        "week",
        todayKey,
        weekStartKey,
        weekEndKey
      ).length,
      past: applyQuickEventFilter(
        eventRecords,
        "past",
        todayKey,
        weekStartKey,
        weekEndKey
      ).length,
    }),
    [eventRecords, todayKey, weekEndKey, weekStartKey]
  );

  const hasActiveFilters =
    quickFilter !== "all" ||
    searchQuery.trim() !== "" ||
    dateFilter !== "all" ||
    colorFilter !== "all" ||
    sortBy !== "nearest";

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const quickFilteredEvents = applyQuickEventFilter(
      eventRecords,
      quickFilter,
      todayKey,
      weekStartKey,
      weekEndKey
    );

    const searchFilteredEvents = quickFilteredEvents.filter((eventRecord) =>
      normalizedSearch ? eventRecord.searchText.includes(normalizedSearch) : true
    );

    const dateFilteredEvents = searchFilteredEvents.filter((eventRecord) => {
      if (dateFilter === "today") {
        return isEventToday(eventRecord, todayKey);
      }

      if (dateFilter === "week") {
        return isEventThisWeek(eventRecord, weekStartKey, weekEndKey);
      }

      if (dateFilter === "month") {
        return doesDateRangeOverlap(
          eventRecord.startKey,
          eventRecord.endKey,
          monthStartKey,
          monthEndKey
        );
      }

      if (dateFilter === "past") {
        return isEventPast(eventRecord, todayKey);
      }

      if (dateFilter === "future") {
        return isEventUpcoming(eventRecord, todayKey);
      }

      return true;
    });

    const colorFilteredEvents = dateFilteredEvents.filter((eventRecord) =>
      colorFilter === "all" ? true : eventRecord.color === colorFilter
    );

    return sortEvents(colorFilteredEvents, sortBy);
  }, [
    colorFilter,
    dateFilter,
    eventRecords,
    monthEndKey,
    monthStartKey,
    quickFilter,
    searchQuery,
    sortBy,
    todayKey,
    weekEndKey,
    weekStartKey,
  ]);

  const groupedEvents = useMemo(() => {
    const groups = filteredEvents.reduce((collection, event) => {
      const dateKey = getDateOnlyKey(event.start_at) ?? todayKey;

      if (!collection[dateKey]) {
        collection[dateKey] = [];
      }

      collection[dateKey].push(event);
      return collection;
    }, {});

    return Object.entries(groups);
  }, [filteredEvents, todayKey]);

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ?? null;
  const editingEvent =
    events.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (selectedEventId && !selectedEvent) {
      setSelectedEventId(null);
    }

    if (editingEventId && !editingEvent) {
      setEditingEventId(null);
      setIsEventModalOpen(false);
    }
  }, [editingEvent, editingEventId, selectedEvent, selectedEventId]);

  function resetFilters() {
    setQuickFilter("all");
    setSearchQuery("");
    setDateFilter("all");
    setColorFilter("all");
    setSortBy("nearest");
    setIsFilterPanelOpen(false);
  }

  function closeEventModal() {
    setEditingEventId(null);
    setEventFormError("");
    setIsEventModalOpen(false);
    setEventForm(getDefaultEventForm(todayKey));
  }

  function openCreateEventModal() {
    setEditingEventId(null);
    setEventForm(getDefaultEventForm(todayKey));
    setEventFormError("");
    setActionError("");
    setIsEventModalOpen(true);
  }

  function openEditEventModal(event) {
    setEditingEventId(event.id);
    setSelectedEventId(null);
    setEventForm(getEventFormFromEvent(event));
    setEventFormError("");
    setActionError("");
    setOpenMenuEventId(null);
    setIsEventModalOpen(true);
  }

  function handleEventFormChange(field, value) {
    setEventForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setEventFormError("");
    setActionError("");
  }

  async function handleEventSubmit() {
    if (eventForm.title.trim() === "") {
      setEventFormError("Event title is required.");
      return;
    }

    setIsSavingEvent(true);
    setEventFormError("");
    setActionError("");

    try {
      const payload = mapFormToEventPayload(eventForm);

      if (editingEventId) {
        await onEventUpdate(editingEventId, payload);
      } else {
        await onEventCreate(payload);
      }

      closeEventModal();
    } catch (submitError) {
      setEventFormError(submitError.message);
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleDeleteEvent(event) {
    const shouldDelete = window.confirm(
      `Delete "${event.title}"? This action cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setIsSavingEvent(true);
    setEventFormError("");
    setActionError("");

    try {
      await onEventDelete(event.id);
      setOpenMenuEventId(null);
      setSelectedEventId((currentId) => (currentId === event.id ? null : currentId));

      if (editingEventId === event.id) {
        closeEventModal();
      }
    } catch (deleteError) {
      setActionError(deleteError.message);
    } finally {
      setIsSavingEvent(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
              My Events
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Events</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Create and manage your scheduled events.
              </p>
            </div>
          </div>

          <Button className="gap-2 self-start lg:self-auto" onClick={openCreateEventModal}>
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </section>

      {error || actionError ? (
        <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error || actionError}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { key: "all", label: "All Events", count: quickFilterCounts.all },
          { key: "upcoming", label: "Upcoming", count: quickFilterCounts.upcoming },
          { key: "today", label: "Today", count: quickFilterCounts.today },
          { key: "week", label: "This Week", count: quickFilterCounts.week },
          { key: "past", label: "Past", count: quickFilterCounts.past },
        ].map((item) => (
          <button
            className={`rounded-[24px] border p-4 text-left shadow-[var(--shadow-panel)] transition ${
              quickFilter === item.key
                ? "border-[var(--border-accent)] bg-[var(--bg-accent-soft)]"
                : "border-[var(--border-soft)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-soft)]"
            }`}
            key={item.key}
            onClick={() => setQuickFilter(item.key)}
            type="button"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {item.count}
            </p>
          </button>
        ))}
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 border-b border-[var(--border-soft)] p-4 pb-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  className="pl-11"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search events"
                  value={searchQuery}
                />
              </div>

              <Button
                className="gap-2"
                onClick={() => setIsFilterPanelOpen((open) => !open)}
                size="default"
                variant="secondary"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {isFilterPanelOpen ? (
              <div className="grid gap-3 rounded-2xl bg-[var(--bg-panel-soft)] p-3">
                <select
                  className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                  onChange={(event) => setDateFilter(event.target.value)}
                  value={dateFilter}
                >
                  <option value="all">All dates</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="future">Future</option>
                  <option value="past">Past</option>
                </select>

                <select
                  className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                  onChange={(event) => setColorFilter(event.target.value)}
                  value={colorFilter}
                >
                  <option value="all">Event color</option>
                  {EVENT_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {formatColorLabel(color)}
                    </option>
                  ))}
                </select>

                <select
                  className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                  onChange={(event) => setSortBy(event.target.value)}
                  value={sortBy}
                >
                  <option value="nearest">Nearest first</option>
                  <option value="newest">Newest created</option>
                  <option value="oldest">Oldest created</option>
                </select>

                <Button
                  disabled={!hasActiveFilters}
                  onClick={resetFilters}
                  variant="ghost"
                >
                  Clear Filters
                </Button>
              </div>
            ) : null}
          </div>

          <div className="hidden gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_170px_170px_170px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                className="pl-11"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by event title"
                value={searchQuery}
              />
            </div>

            <select
              className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) => setDateFilter(event.target.value)}
              value={dateFilter}
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="future">Future</option>
              <option value="past">Past</option>
            </select>

            <select
              className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) => setColorFilter(event.target.value)}
              value={colorFilter}
            >
              <option value="all">Event color</option>
              {EVENT_COLORS.map((color) => (
                <option key={color} value={color}>
                  {formatColorLabel(color)}
                </option>
              ))}
            </select>

            <select
              className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <option value="nearest">Nearest first</option>
              <option value="newest">Newest created</option>
              <option value="oldest">Oldest created</option>
            </select>

            <Button
              className="h-11"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
              variant="ghost"
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:p-5">
          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-6 py-6 text-center">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                No events scheduled
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Create an event to start planning your schedule.
              </p>
              <Button className="mt-4 gap-2" onClick={openCreateEventModal}>
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-6 py-8 text-center">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                No events match these filters.
              </h2>
              <Button className="mt-4" onClick={resetFilters} variant="secondary">
                Clear Filters
              </Button>
            </div>
          ) : (
            groupedEvents.map(([dateKey, dateEvents]) => (
              <div className="space-y-3" key={dateKey}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {getSelectedDateLabel(dateKey)}
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    {dateEvents.length} event{dateEvents.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-3">
                  {dateEvents.map((event) => {
                    const reminderLabel = getReminderLabel(event.reminder_minutes);
                    const isPastEvent = isEventPast(event, todayKey);
                    const linkedTask = tasks.find((task) => task.id === event.task_id);

                    return (
                      <div
                        className={`rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-panel)] transition ${
                          isPastEvent ? "opacity-80" : ""
                        }`}
                        key={event.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setOpenMenuEventId(null);
                            }}
                            type="button"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-[var(--text-primary)]">
                                {event.title}
                              </p>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getEventColorClasses(event.color)}`}
                              >
                                {formatColorLabel(event.color)}
                              </span>
                              {isPastEvent ? (
                                <span className="inline-flex items-center rounded-full bg-[var(--bg-panel-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                                  Past
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
                                {formatEventDateRangeLabel(event)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4 text-[var(--text-muted)]" />
                                {getEventTimeLabel(event)}
                              </span>
                              {reminderLabel ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <Bell className="h-4 w-4 text-[var(--text-muted)]" />
                                  {reminderLabel}
                                </span>
                              ) : null}
                              {event.recurrence_rule ? (
                                <span className="inline-flex items-center gap-1.5 capitalize">
                                  <Repeat className="h-4 w-4 text-[var(--text-muted)]" />
                                  {event.recurrence_rule}
                                </span>
                              ) : null}
                            </div>

                            {event.description ? (
                              <p className="mt-2 text-sm text-[var(--text-muted)]">
                                {event.description}
                              </p>
                            ) : null}

                            {linkedTask ? (
                              <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">
                                Linked task: {linkedTask.title}
                              </p>
                            ) : null}
                          </button>

                          <div className="relative shrink-0">
                            <Button
                              aria-expanded={openMenuEventId === event.id}
                              className="h-10 w-10 p-0"
                              onClick={() =>
                                setOpenMenuEventId((currentId) =>
                                  currentId === event.id ? null : event.id
                                )
                              }
                              variant="ghost"
                            >
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>

                            {openMenuEventId === event.id ? (
                              <div className="absolute right-0 top-11 z-20 min-w-[168px] rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-2 shadow-[var(--shadow-panel)]">
                                <button
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-panel-soft)] hover:text-[var(--text-primary)]"
                                  onClick={() => {
                                    setSelectedEventId(event.id);
                                    setOpenMenuEventId(null);
                                  }}
                                  type="button"
                                >
                                  <Eye className="h-4 w-4" />
                                  View details
                                </button>
                                <button
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-panel-soft)] hover:text-[var(--text-primary)]"
                                  onClick={() => openEditEventModal(event)}
                                  type="button"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                                  onClick={() => handleDeleteEvent(event)}
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isEventModalOpen ? (
        <EventModalShell
          onClose={closeEventModal}
          subtitle={editingEvent ? "Update this event." : "Create a new scheduled event."}
          title={editingEvent ? "Edit event" : "Create event"}
        >
          <SchedulerForm
            editingEvent={editingEvent}
            eventForm={eventForm}
            eventFormError={eventFormError}
            isSavingEvent={isSavingEvent}
            onDelete={() => handleDeleteEvent(editingEvent)}
            onEditCancel={closeEventModal}
            onFormChange={handleEventFormChange}
            onSubmit={handleEventSubmit}
            showCreateHint={false}
            tasks={tasks}
          />
        </EventModalShell>
      ) : null}

      {selectedEvent ? (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onDelete={handleDeleteEvent}
          onEdit={openEditEventModal}
          tasks={tasks}
        />
      ) : null}
    </div>
  );
}

function SchedulerForm({
  showCreateHint,
  editingEvent,
  eventForm,
  eventFormError,
  isSavingEvent,
  onDelete,
  onEditCancel,
  onFormChange,
  onSubmit,
  tasks,
}) {
  return (
    <Card>
      <CardHeader className="p-5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5" />
          {editingEvent ? "Edit event" : "Create event"}
        </CardTitle>
        <CardDescription>
          Events are scheduled time blocks. Tasks are deadline items.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-0">
        {showCreateHint && !editingEvent ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
            You add events from here. Use events for meetings, calls, sessions,
            or anything that has a start and end time.
          </div>
        ) : null}

        {eventFormError ? (
          <div className="rounded-xl border border-red-200 bg-[var(--bg-danger-soft)] px-3 py-3 text-sm text-red-700 dark:text-red-200">
            {eventFormError}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Title
          </label>
          <Input
            onChange={(event) => onFormChange("title", event.target.value)}
            placeholder="Planning session"
            value={eventForm.title}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Description
          </label>
          <textarea
            className="min-h-24 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
            onChange={(event) => onFormChange("description", event.target.value)}
            placeholder="Optional notes"
            value={eventForm.description}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-[var(--bg-panel-soft)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <input
            checked={eventForm.is_all_day}
            onChange={(event) => onFormChange("is_all_day", event.target.checked)}
            type="checkbox"
          />
          All day event
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Start date
            </label>
            <Input
              onChange={(event) => onFormChange("start_date", event.target.value)}
              type="date"
              value={eventForm.start_date}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              End date
            </label>
            <Input
              onChange={(event) => onFormChange("end_date", event.target.value)}
              type="date"
              value={eventForm.end_date}
            />
          </div>
        </div>

        {!eventForm.is_all_day ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Start time
              </label>
              <Input
                onChange={(event) => onFormChange("start_time", event.target.value)}
                type="time"
                value={eventForm.start_time}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                End time
              </label>
              <Input
                onChange={(event) => onFormChange("end_time", event.target.value)}
                type="time"
                value={eventForm.end_time}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Color
            </label>
            <select
              className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) => onFormChange("color", event.target.value)}
              value={eventForm.color}
            >
              {EVENT_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Reminder
            </label>
            <select
              className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) =>
                onFormChange("reminder_minutes", event.target.value)
              }
              value={String(eventForm.reminder_minutes)}
            >
              <option value="">No reminder</option>
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Recurrence
            </label>
            <select
              className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) =>
                onFormChange("recurrence_rule", event.target.value)
              }
              value={eventForm.recurrence_rule}
            >
              <option value="">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Link task
            </label>
            <select
              className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
              onChange={(event) => onFormChange("task_id", event.target.value)}
              value={eventForm.task_id}
            >
              <option value="">No linked task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button disabled={isSavingEvent} onClick={onSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            {editingEvent ? "Save event" : "Create event"}
          </Button>

          {editingEvent ? (
            <>
              <Button onClick={onEditCancel} variant="secondary">
                Cancel
              </Button>
              <Button disabled={isSavingEvent} onClick={onDelete} variant="danger">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SchedulerAgenda({
  items,
  onEventEdit,
  onTaskSelect,
  selectedLabel,
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-lg">{selectedLabel}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-3 py-4 text-sm text-[var(--text-muted)]">
            No tasks or events here.
          </div>
        ) : (
          items.map((item) =>
            item.kind === "event" ? (
              <button
                className={`w-full rounded-xl border px-3 py-3 text-left ${getEventColorClasses(item.color)}`}
                key={item.key}
                onClick={() => onEventEdit(item)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="flex items-center gap-2 text-xs opacity-80">
                      <Clock3 className="h-3.5 w-3.5" />
                      {getEventTimeLabel(item)}
                    </p>
                    {item.recurrence_rule ? (
                      <p className="flex items-center gap-2 text-xs opacity-80">
                        <Repeat className="h-3.5 w-3.5" />
                        {item.recurrence_rule}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold capitalize text-current dark:bg-black/20">
                    event
                  </span>
                </div>
              </button>
            ) : (
              <button
                className={`w-full rounded-xl border px-3 py-3 text-left ${getTaskChipStyles(item)}`}
                key={item.key}
                onClick={() => onTaskSelect?.(item)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {(() => {
                        const Icon = getTaskIcon(item);
                        return <Icon className="h-4 w-4 shrink-0" />;
                      })()}
                      {item.title}
                    </p>
                    <p className="text-xs opacity-80">
                      {item.status.replace("-", " ")}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold capitalize text-current dark:bg-black/20">
                    task
                  </span>
                </div>
              </button>
            )
          )
        )}
      </CardContent>
    </Card>
  );
}

function CalendarPage({
  entryMode = "browse",
  error,
  events,
  isSidebarVisible,
  onEventCreate,
  onEventDelete,
  onEventUpdate,
  onSidebarToggle,
  onTaskSelect,
  tasks,
  user,
}) {
  if (entryMode === "events") {
    return (
      <EventManagementPage
        error={error}
        events={events}
        isSidebarVisible={isSidebarVisible}
        onEventCreate={onEventCreate}
        onEventDelete={onEventDelete}
        onEventUpdate={onEventUpdate}
        onSidebarToggle={onSidebarToggle}
        tasks={tasks}
      />
    );
  }

  const initialDateKey = getClosestScheduleDate(tasks, events);
  const [currentView, setCurrentView] = useState("month");
  const [selectedDateKey, setSelectedDateKey] = useState(initialDateKey);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(`${initialDateKey}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState(
    entryMode === "browse" ? "all" : "event"
  );
  const [colorFilter, setColorFilter] = useState("all");
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState(() =>
    getDefaultEventForm(initialDateKey)
  );
  const [eventFormError, setEventFormError] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  useEffect(() => {
    setSourceFilter(entryMode === "browse" ? "all" : "event");
  }, [entryMode]);

  function selectDate(dateKey) {
    const selectedDate = new Date(`${dateKey}T00:00:00`);
    setSelectedDateKey(dateKey);
    setCurrentMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );

    if (!editingEventId) {
      setEventForm((currentForm) => ({
        ...currentForm,
        start_date: dateKey,
        end_date: dateKey,
      }));
    }
  }

  function resetEventForm(dateKey = selectedDateKey) {
    setEditingEventId(null);
    setEventForm(getDefaultEventForm(dateKey));
    setEventFormError("");
  }

  function handleEventFormChange(field, value) {
    setEventForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setEventFormError("");
  }

  async function handleEventSubmit() {
    if (eventForm.title.trim() === "") {
      setEventFormError("Event title is required.");
      return;
    }

    setIsSavingEvent(true);
    setEventFormError("");

    try {
      const payload = mapFormToEventPayload(eventForm);

      if (editingEventId) {
        await onEventUpdate(editingEventId, payload);
      } else {
        await onEventCreate(payload);
      }

      resetEventForm(eventForm.start_date);
    } catch (submitError) {
      setEventFormError(submitError.message);
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleDeleteCurrentEvent() {
    if (!editingEventId) {
      return;
    }

    setIsSavingEvent(true);
    setEventFormError("");

    try {
      await onEventDelete(editingEventId);
      resetEventForm(selectedDateKey);
    } catch (deleteError) {
      setEventFormError(deleteError.message);
    } finally {
      setIsSavingEvent(false);
    }
  }

  function handleStartEventEdit(event) {
    const eventDateKey = getDateOnlyKey(event.start_at);
    const selectedDate = new Date(`${eventDateKey}T00:00:00`);

    setEditingEventId(event.id);
    setEventForm(getEventFormFromEvent(event));
    setSelectedDateKey(eventDateKey);
    setCurrentMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    setEventFormError("");
  }

  function matchesFilters(item) {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (sourceFilter !== "all" && item.kind !== sourceFilter) {
      return false;
    }

    if (
      item.kind === "event" &&
      colorFilter !== "all" &&
      item.color !== colorFilter
    ) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText =
      item.kind === "event"
        ? `${item.title} ${item.description ?? ""}`
        : item.title;

    return searchableText.toLowerCase().includes(normalizedSearch);
  }

  function getDayItems(dateKey) {
    const taskItems = tasks
      .filter((task) => getDateOnlyKey(task.due_date) === dateKey)
      .map((task) => ({
        ...task,
        key: `task-${task.id}`,
        kind: "task",
      }));
    const eventItems = events
      .filter((event) => isDateWithinRange(dateKey, event.start_at, event.end_at))
      .map((event) => ({
        ...event,
        key: `event-${event.id}`,
        kind: "event",
      }));

    return [...eventItems, ...taskItems]
      .filter(matchesFilters)
      .sort((firstItem, secondItem) => {
        if (firstItem.kind === "event" && secondItem.kind === "task") {
          return -1;
        }

        if (firstItem.kind === "task" && secondItem.kind === "event") {
          return 1;
        }

        if (firstItem.kind === "event" && secondItem.kind === "event") {
          return (
            getDateFromValue(firstItem.start_at).getTime() -
            getDateFromValue(secondItem.start_at).getTime()
          );
        }

        return firstItem.title.localeCompare(secondItem.title);
      });
  }

  function moveRange(direction) {
    if (currentView === "month") {
      setCurrentMonth(
        (current) =>
          new Date(current.getFullYear(), current.getMonth() + direction, 1)
      );
      return;
    }

    const currentDate = new Date(`${selectedDateKey}T00:00:00`);
    currentDate.setDate(
      currentDate.getDate() + (currentView === "week" ? 7 * direction : direction)
    );
    selectDate(formatDateKey(currentDate));
  }

  const calendarDays = buildCalendarDays(currentMonth);
  const weekDays = buildWeekDays(selectedDateKey);
  const selectedDateItems = getDayItems(selectedDateKey);
  const deadlineTaskCount = tasks.filter((task) => task.due_date).length;
  const overdueTaskCount = tasks.filter((task) => isTaskOverdue(task)).length;
  const eventCount = events
    .map((event) => ({
      ...event,
      key: `event-${event.id}`,
      kind: "event",
    }))
    .filter(matchesFilters).length;
  const selectedEvent = events.find((event) => event.id === editingEventId) ?? null;
  const shouldShowColorFilter = sourceFilter === "all" || sourceFilter === "event";
  const shouldShowSchedulerForm =
    entryMode === "create-event" || selectedEvent !== null;
  const scheduleHeading =
    currentView === "month"
      ? getMonthLabel(currentMonth)
      : currentView === "week"
        ? `${getShortDateLabel(formatDateKey(weekDays[0]))} - ${getShortDateLabel(formatDateKey(weekDays[6]))}`
        : getSelectedDateLabel(selectedDateKey);

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
              Calendar
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                {`Calendar for ${user.name}`}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Tasks show deadlines. Events use start and end times.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Deadlines
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  {deadlineTaskCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Events
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  {eventCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Overdue
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  {overdueTaskCount}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_330px]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3 border-b border-[var(--border-soft)] p-4 pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-xl">{scheduleHeading}</CardTitle>
                <CardDescription>Search and filter your schedule.</CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                {VIEW_OPTIONS.map((view) => (
                  <Button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    size="sm"
                    variant={currentView === view ? "default" : "secondary"}
                  >
                    {view}
                  </Button>
                ))}
                <Button onClick={() => moveRange(-1)} size="sm" variant="secondary">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => moveRange(1)} size="sm" variant="secondary">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  className="pl-11"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search schedule"
                  value={searchQuery}
                />
              </div>

              <select
                className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                onChange={(event) => setSourceFilter(event.target.value)}
                value={sourceFilter}
              >
                <option value="all">All</option>
                <option value="event">Events</option>
                <option value="task">Tasks</option>
              </select>

              <select
                className="h-11 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!shouldShowColorFilter}
                onChange={(event) => setColorFilter(event.target.value)}
                value={colorFilter}
              >
                <option value="all">Colors</option>
                {EVENT_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-[var(--bg-panel-soft)] px-4 py-2.5 text-sm text-[var(--text-muted)]">
              Tasks use due dates. Colors apply to events only.
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {currentView === "month" ? (
              <>
                <div className="grid grid-cols-7 border-b border-[var(--border-soft)] bg-[var(--bg-panel-soft)]">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      className="flex h-12 items-center justify-center px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]"
                      key={label}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid auto-rows-fr grid-cols-7">
                  {calendarDays.map((date) => {
                    const dateKey = formatDateKey(date);
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isSelected = dateKey === selectedDateKey;
                    const dayItems = getDayItems(dateKey);

                    return (
                      <button
                        className={`flex min-h-[132px] w-full flex-col border-b border-r border-[var(--border-soft)] px-3 py-2 text-left transition ${
                          isSelected
                            ? "bg-[var(--bg-accent-soft)]"
                            : "bg-transparent hover:bg-[var(--bg-panel-soft)]"
                        }`}
                        key={dateKey}
                        onClick={() => selectDate(dateKey)}
                        type="button"
                      >
                        <div className="flex min-h-6 items-start justify-between">
                          <span
                            className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-sm font-semibold ${
                              isCurrentMonth
                                ? "text-[var(--text-primary)]"
                                : "text-[var(--text-muted)] opacity-60"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          {dayItems.length > 0 ? (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                              {dayItems.length}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 space-y-1.5">
                          {dayItems.slice(0, 2).map((item) =>
                            item.kind === "event" ? (
                              <button
                                className={`w-full rounded-xl border px-2 py-1.5 text-left text-[11px] font-semibold ${getEventColorClasses(item.color)}`}
                                key={item.key}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleStartEventEdit(item);
                                }}
                                type="button"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Clock3 className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{item.title}</span>
                                </div>
                              </button>
                            ) : (
                              <button
                                className={`w-full rounded-xl border px-2 py-1.5 text-left text-[11px] font-semibold ${getTaskChipStyles(item)}`}
                                key={item.key}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onTaskSelect?.(item);
                                }}
                                type="button"
                              >
                                <div className="flex items-center gap-1.5">
                                  {(() => {
                                    const Icon = getTaskIcon(item);
                                    return <Icon className="h-3 w-3 shrink-0" />;
                                  })()}
                                  <span className="truncate">{item.title}</span>
                                </div>
                              </button>
                            )
                          )}

                          {dayItems.length > 2 ? (
                            <div className="text-[11px] font-medium text-[var(--text-muted)]">
                              +{dayItems.length - 2} more
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : currentView === "week" ? (
              <div className="grid gap-3 p-4 lg:grid-cols-7">
                {weekDays.map((date) => {
                  const dateKey = formatDateKey(date);
                  const dayItems = getDayItems(dateKey);

                  return (
                    <button
                      className={`rounded-2xl border p-3 text-left ${
                        selectedDateKey === dateKey
                          ? "border-[var(--border-accent)] bg-[var(--bg-accent-soft)]"
                          : "border-[var(--border-soft)] bg-[var(--bg-panel-soft)]"
                      }`}
                      key={dateKey}
                      onClick={() => selectDate(dateKey)}
                      type="button"
                    >
                      <div className="mb-3 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {WEEKDAY_LABELS[date.getDay()]}
                        </p>
                        <p className="text-lg font-semibold text-[var(--text-primary)]">
                          {date.getDate()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {dayItems.length === 0 ? (
                          <div className="text-xs text-[var(--text-muted)]">
                            Empty
                          </div>
                        ) : (
                          dayItems.slice(0, 4).map((item) => (
                            <div
                              className={`rounded-xl border px-2 py-2 text-[11px] font-semibold ${
                                item.kind === "event"
                                  ? getEventColorClasses(item.color)
                                  : getTaskChipStyles(item)
                              }`}
                              key={item.key}
                            >
                              {item.title}
                            </div>
                          ))
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4">
                <SchedulerAgenda
                  items={selectedDateItems}
                  onEventEdit={handleStartEventEdit}
                  onTaskSelect={onTaskSelect}
                  selectedLabel={getSelectedDateLabel(selectedDateKey)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {shouldShowSchedulerForm ? (
            <SchedulerForm
              showCreateHint={entryMode === "create-event"}
              editingEvent={selectedEvent}
              eventForm={eventForm}
              eventFormError={eventFormError}
              isSavingEvent={isSavingEvent}
              onDelete={handleDeleteCurrentEvent}
              onEditCancel={() => resetEventForm(selectedDateKey)}
              onFormChange={handleEventFormChange}
              onSubmit={handleEventSubmit}
              tasks={tasks}
            />
          ) : (
            <Card>
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-lg">Selected day</CardTitle>
                <CardDescription>{getSelectedDateLabel(selectedDateKey)}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-4 py-4 text-sm text-[var(--text-muted)]">
                  Select an event to edit.
                </div>
              </CardContent>
            </Card>
          )}

          {currentView !== "day" ? (
            <SchedulerAgenda
              items={selectedDateItems}
              onEventEdit={handleStartEventEdit}
              onTaskSelect={onTaskSelect}
              selectedLabel={getSelectedDateLabel(selectedDateKey)}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default CalendarPage;
