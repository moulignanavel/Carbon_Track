import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Leaf,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateOrganisationActivityVerification } from "@/api/organisationApi";

const EMPTY_DATA = {};
const FILTER_KEY = "carbontrack.organisation.activity-logs.filters";
const pageSize = 10;
const card =
  "rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900";
const control =
  "h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800";
const dateOf = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
function Loading() {
  return (
    <div className="space-y-5" aria-label="Loading activity logs">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 rounded-2xl bg-white p-5">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}
function Empty() {
  return (
    <div className="grid min-h-72 place-items-center text-center">
      <div>
        <Leaf className="mx-auto h-9 w-9 text-emerald-500" />
        <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">
          No activity logs match these filters
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Change the date range, department, category, or search text.
        </p>
      </div>
    </div>
  );
}
function Status({ value }) {
  return value ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      {value}
    </span>
  ) : (
    <span className="text-xs font-medium text-slate-400">Not available</span>
  );
}
function VerificationControl({ row, busy, onChange }) {
  const value = row.verificationStatus || "PENDING";
  return (
    <select
      aria-label={`Verification status for ${row.activity || "activity"}`}
      value={value}
      disabled={busy}
      onChange={(event) => onChange(row, event.target.value)}
      className={`h-9 rounded-lg border px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 ${value === "VERIFIED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : value === "REJECTED" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
    >
      <option value="PENDING">Pending</option>
      <option value="VERIFIED">Verified</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );
}
function ActivityDrawer({ row, onClose }) {
  const reduceMotion = useReducedMotion(),
    closeRef = useRef(null),
    returnFocus = useRef(document.activeElement);
  useEffect(() => {
    const focus = returnFocus.current;
    closeRef.current?.focus();
    const handle = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      focus?.focus?.();
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.aside
        initial={reduceMotion ? false : { x: 44, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-details-title"
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Activity details
            </p>
            <h2
              id="activity-details-title"
              className="mt-1 text-xl font-bold text-slate-950 dark:text-white"
            >
              {row.activity || "Activity"}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close activity details"
            className="rounded-lg p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3">
          {[
            ["Date", row.date],
            ["Employee", row.employee],
            ["Department", row.department],
            ["Category", row.category],
            [
              "Quantity",
              row.quantity === null || row.quantity === undefined
                ? "Not available"
                : `${Number(row.quantity).toLocaleString()} ${row.unit || ""}`.trim(),
            ],
            [
              "Emission",
              `${Number(row.emission || 0).toLocaleString()} kg CO₂e`,
            ],
            ["Verification", row.verificationStatus || "Not available"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
            >
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {value || "Not available"}
              </dd>
            </div>
          ))}
        </dl>
        {row.notes && (
          <section className="mt-6">
            <h3 className="font-semibold">Notes</h3>
            <p className="mt-2 rounded-xl border border-slate-100 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {row.notes}
            </p>
          </section>
        )}
      </motion.aside>
    </div>
  );
}

export default function OrganisationActivityLogsPage({
  data,
  loading,
  error,
  onRetry,
  onReload,
}) {
  const source = data || EMPTY_DATA,
    logs = useMemo(() => source.activityLogs || [], [source.activityLogs]),
    employees = useMemo(() => source.employees || [], [source.employees]);
  const stored = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(FILTER_KEY) || "{}");
    } catch {
      return {};
    }
  }, []);
  const [range, setRange] = useState(stored.range || "all"),
    [department, setDepartment] = useState(stored.department || ""),
    [category, setCategory] = useState(stored.category || ""),
    [verification, setVerification] = useState(stored.verification || ""),
    [query, setQuery] = useState(stored.query || ""),
    [debounced, setDebounced] = useState(query),
    [sort, setSort] = useState(stored.sort || "newest"),
    [page, setPage] = useState(stored.page || 1),
    [drawer, setDrawer] = useState(null),
    [updating, setUpdating] = useState(null);
  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(query.trim().toLowerCase()),
      250,
    );
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    sessionStorage.setItem(
      FILTER_KEY,
      JSON.stringify({
        range,
        department,
        category,
        verification,
        query,
        sort,
        page,
      }),
    );
  }, [range, department, category, verification, query, sort, page]);
  const employeeDepartments = useMemo(
      () =>
        new Map(
          employees.map((row) => [row.name, row.department || "Unassigned"]),
        ),
      [employees],
    ),
    departments = useMemo(
      () =>
        [
          ...new Set(employees.map((row) => row.department || "Unassigned")),
        ].sort(),
      [employees],
    ),
    categories = useMemo(
      () =>
        [...new Set(logs.map((row) => row.category).filter(Boolean))].sort(),
      [logs],
    ),
    verificationOptions = useMemo(
      () =>
        [
          ...new Set(logs.map((row) => row.verificationStatus).filter(Boolean)),
        ].sort(),
      [logs],
    );
  const rows = useMemo(() => {
    const now = new Date(),
      start = new Date(now);
    if (range === "week") start.setDate(start.getDate() - 6);
    if (range === "month") start.setDate(1);
    if (range === "quarter") start.setMonth(start.getMonth() - 2, 1);
    if (range === "year") start.setMonth(0, 1);
    return logs
      .map((row) => ({
        ...row,
        department: employeeDepartments.get(row.employee) || "Unassigned",
      }))
      .filter((row) => {
        const date = dateOf(row.date);
        const text =
          `${row.employee || ""} ${row.department} ${row.category || ""} ${row.activity || ""}`.toLowerCase();
        return (
          (range === "all" || (date && date >= start && date <= now)) &&
          (!department || row.department === department) &&
          (!category || row.category === category) &&
          (!verification || row.verificationStatus === verification) &&
          (!debounced || text.includes(debounced))
        );
      })
      .sort((a, b) =>
        sort === "oldest"
          ? String(a.date).localeCompare(String(b.date))
          : sort === "emission-high"
            ? Number(b.emission || 0) - Number(a.emission || 0)
            : sort === "emission-low"
              ? Number(a.emission || 0) - Number(b.emission || 0)
              : String(b.date).localeCompare(String(a.date)),
      );
  }, [
    logs,
    employeeDepartments,
    range,
    department,
    category,
    verification,
    debounced,
    sort,
  ]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const verify = async (row, status) => {
    if (updating) return;
    setUpdating(row.id);
    try {
      await updateOrganisationActivityVerification(row.id, status);
      await onReload(true);
      setDrawer((current) =>
        current?.id === row.id
          ? { ...current, verificationStatus: status }
          : current,
      );
      toast.success(`Activity marked ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to update verification status",
      );
    } finally {
      setUpdating(null);
    }
  };
  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} p-5 text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">Activity logs could not be loaded</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </section>
    );
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">
            Verified organisation records
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            Activity Logs
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review recorded employee sustainability activities and calculated
            emissions.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <FileText className="h-4 w-4" />
          {logs.length.toLocaleString()} records
        </div>
      </header>
      <section className={`${card} p-4`} aria-label="Activity log filters">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <label className="relative">
            <span className="sr-only">Search activities</span>
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              className={`${control} pl-9`}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search employee, activity or category"
            />
          </label>
          <select
            aria-label="Activity date range"
            className={control}
            value={range}
            onChange={(event) => {
              setRange(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All available dates</option>
            <option value="week">Last 7 days</option>
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
            <option value="year">This year</option>
          </select>
          <select
            aria-label="Activity department"
            className={control}
            value={department}
            onChange={(event) => {
              setDepartment(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All departments</option>
            {departments.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Activity category"
            className={control}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Verification status"
            disabled={!verificationOptions.length}
            className={control}
            value={verification}
            onChange={(event) => {
              setVerification(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              {verificationOptions.length
                ? "All verification statuses"
                : "Verification status unavailable"}
            </option>
            {verificationOptions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Sort activity logs"
            className={control}
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="emission-high">Highest emissions</option>
            <option value="emission-low">Lowest emissions</option>
          </select>
        </div>
      </section>
      <section className={`${card} overflow-hidden`}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr>
                {[
                  "Date",
                  "Employee",
                  "Department",
                  "Category",
                  "Activity",
                  "Quantity",
                  "Emission",
                  "Verification Status",
                  "",
                ].map((label) => (
                  <th key={label || "action"} className="px-4 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {row.employee}
                  </td>
                  <td className="px-4 py-3">{row.department}</td>
                  <td className="px-4 py-3">
                    {row.category || "Not available"}
                  </td>
                  <td className="px-4 py-3">
                    {row.activity || "Not available"}
                  </td>
                  <td className="px-4 py-3">
                    {row.quantity === null || row.quantity === undefined
                      ? "Not available"
                      : `${Number(row.quantity).toLocaleString()} ${row.unit || ""}`.trim()}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {Number(row.emission || 0).toLocaleString()} kg CO₂e
                  </td>
                  <td className="px-4 py-3">
                    <VerificationControl row={row} busy={updating === row.id} onChange={verify} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDrawer(row)}
                      aria-label={`View ${row.activity || "activity"} details`}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">
          {visible.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {row.activity || row.category}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.employee} · {row.department}
                  </p>
                </div>
                  <VerificationControl row={row} busy={updating === row.id} onChange={verify} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Date</dt>
                  <dd>{row.date}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Emission</dt>
                  <dd className="font-semibold">{row.emission} kg CO₂e</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setDrawer(row)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
              >
                <Eye className="h-4 w-4" />
                View details
              </button>
            </article>
          ))}
        </div>
        {!visible.length && <Empty />}
        {!!visible.length && (
          <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, rows.length)} of {rows.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous activity page"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-semibold">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                aria-label="Next activity page"
                disabled={page === pages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        )}
      </section>
      {drawer && (
        <ActivityDrawer row={drawer} onClose={() => setDrawer(null)} />
      )}
    </div>
  );
}
