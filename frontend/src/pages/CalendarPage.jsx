import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Plus,
  Repeat,
  Search,
  Trash2,
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

  return String(value).slice(0, 10);
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
    ...events.map((event) => getDateOnlyKey(event.start_at)).filter(Boolean),
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
      <CardHeader className="p-5 pb-4">
        <CardTitle className="text-lg">{selectedLabel}</CardTitle>
        <CardDescription>Press an item to continue.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 p-5 pt-0">
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
  onEventCreate,
  onEventDelete,
  onEventUpdate,
  onTaskSelect,
  tasks,
  user,
}) {
  const initialDateKey = getClosestScheduleDate(tasks, events);
  const [currentView, setCurrentView] = useState("month");
  const [selectedDateKey, setSelectedDateKey] = useState(initialDateKey);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(`${initialDateKey}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState(
    entryMode === "create-event" ? "event" : "all"
  );
  const [colorFilter, setColorFilter] = useState("all");
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState(() =>
    getDefaultEventForm(initialDateKey)
  );
  const [eventFormError, setEventFormError] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

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
      .filter((event) => getDateOnlyKey(event.start_at) === dateKey)
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
  const eventCount = events.filter(matchesFilters).length;
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
    <div className="space-y-6">
      <section className="rounded-[26px] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-accent)]">
              Calendar
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                Scheduler for {user.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Tasks are deadlines. Events are scheduled time blocks with a
                start and end time.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-3.5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Deadlines
                </p>
                <p className="mt-1.5 text-xl font-semibold text-[var(--text-primary)]">
                  {deadlineTaskCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-3.5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Events
                </p>
                <p className="mt-1.5 text-xl font-semibold text-[var(--text-primary)]">
                  {eventCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-slate-900/60">
              <CardContent className="p-3.5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Overdue
                </p>
                <p className="mt-1.5 text-xl font-semibold text-[var(--text-primary)]">
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4 border-b border-[var(--border-soft)] p-5 pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-xl">{scheduleHeading}</CardTitle>
                <CardDescription>
                  Search by title, filter the item type, and use colors only for events.
                </CardDescription>
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

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  className="pl-11"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search tasks or events"
                  value={searchQuery}
                />
              </div>

              <select
                className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)]"
                onChange={(event) => setSourceFilter(event.target.value)}
                value={sourceFilter}
              >
                <option value="all">All items</option>
                <option value="event">Events only</option>
                <option value="task">Tasks only</option>
              </select>

              <select
                className="h-12 w-full rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel-strong)] px-4 text-sm text-[var(--text-secondary)] shadow-sm outline-none transition focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--ring-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!shouldShowColorFilter}
                onChange={(event) => setColorFilter(event.target.value)}
                value={colorFilter}
              >
                <option value="all">All colors</option>
                {EVENT_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-[var(--bg-panel-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">
              `Tasks` are deadline items without time slots.
              `Events` are scheduled blocks with start/end times.
              Colors only affect events.
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
              <CardHeader className="p-5 pb-4">
                <CardTitle className="text-lg">Selected day</CardTitle>
                <CardDescription>{getSelectedDateLabel(selectedDateKey)}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-panel-soft)] px-4 py-4 text-sm text-[var(--text-muted)]">
                  Choose an event to edit it.
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
