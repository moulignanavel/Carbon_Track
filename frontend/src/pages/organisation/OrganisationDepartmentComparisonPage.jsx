import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, Award, Building2, ChevronRight, Leaf, X } from 'lucide-react';

const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const select = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const EMPTY_DATA = {};
const dateOf = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
function Empty({ label }) {
  return (
    <div className="grid h-full min-h-40 place-items-center text-center text-xs text-slate-500">
      <div>
        <Leaf className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
        No {label} is available.
      </div>
    </div>
  );
}
function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading department comparison">
      <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-3.5 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
function MetricChart({ title, description, data, dataKey, unit, reduceMotion }) {
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className={card}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-2.5 h-52">
        {data.length ? (
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 18 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={unit === '%' ? [0, 100] : undefined} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="department" width={95} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}`]} />
              <Bar dataKey={dataKey} fill="#059669" radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty label={title.toLowerCase()} />
        )}
      </div>
    </motion.section>
  );
}
export default function OrganisationDepartmentComparisonPage({data,loading,error,onRetry}){
  const reduceMotion=useReducedMotion(),source=data||EMPTY_DATA;
  const employees=useMemo(()=>source.employees||[],[source.employees]);
  const logs=useMemo(()=>source.activityLogs||[],[source.activityLogs]);
  const names=useMemo(()=>[...new Set(employees.map(row=>row.department||'Unassigned'))].sort(),[employees]);const [department,setDepartment]=useState('');const [range,setRange]=useState('all');const [drawer,setDrawer]=useState(null);
  const rows=useMemo(()=>{const now=new Date(),start=new Date(now);if(range==='month')start.setDate(1);if(range==='quarter')start.setMonth(start.getMonth()-2,1);if(range==='year')start.setMonth(0,1);const memberDepartment=new Map(employees.map(row=>[row.name,row.department||'Unassigned']));const filtered=logs.filter(row=>{const date=dateOf(row.date);return range==='all'||(date&&date>=start&&date<=now)});return names.map(name=>{const members=employees.filter(row=>(row.department||'Unassigned')===name),memberNames=new Set(members.map(row=>row.name)),activity=filtered.filter(row=>memberDepartment.get(row.employee)===name),participants=new Set(activity.map(row=>row.employee).filter(Boolean)),emissions=activity.reduce((sum,row)=>sum+Number(row.emission||0),0),goalProgress=members.length?members.reduce((sum,row)=>sum+Number(row.goalProgress||0),0)/members.length:null;return{department:name,employees:members.length,activities:activity.length,emissions:Number(emissions.toFixed(2)),participation:members.length?Number((participants.size*100/members.length).toFixed(1)):0,goalCompletion:goalProgress===null?null:Number(goalProgress.toFixed(1)),members:[...memberNames]}}).filter(row=>!department||row.department===department)},[employees,logs,names,range,department]);
  if(loading)return <Loading/>;if(error)return <section className={`${card} border-rose-200 text-rose-700`}><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5"/><div className="flex-1"><h1 className="font-semibold">Department comparison could not be loaded</h1><p className="text-sm">{error}</p></div><button type="button" onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">Retry</button></div></section>;
  const ranked=[...rows].sort((a,b)=>a.emissions-b.emissions),best=ranked.find(row=>row.activities>0);
  return <div className="space-y-5"><header><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Organisation intelligence</p><h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">Department Comparison</h1><p className="mt-2 text-sm text-slate-500">Compare real department emissions, participation and current goal progress.</p></header>
    <section className={card} aria-label="Department comparison filters"><div className="grid gap-3 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-semibold text-slate-600">Department</span><select aria-label="Department selector" className={select} value={department} onChange={e=>setDepartment(e.target.value)}><option value="">All departments</option>{names.map(name=><option key={name}>{name}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-semibold text-slate-600">Date range</span><select aria-label="Department date range" className={select} value={range} onChange={e=>setRange(e.target.value)}><option value="all">All available dates</option><option value="month">This month</option><option value="quarter">This quarter</option><option value="year">This year</option></select></label></div></section>
    {best&&<motion.section initial={reduceMotion?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-slate-900"><Award className="h-5 w-5"/></span><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Best-performing department</p><h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{best.department}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Lowest recorded emissions among departments with activity: {best.emissions.toLocaleString()} kg CO₂e.</p></div></div></motion.section>}
    {!rows.length&&<section className={card}><Empty label="department data"/></section>}
    <div className="grid gap-5 xl:grid-cols-2"><MetricChart title="Emission Comparison Chart" description="Lower recorded emissions indicate stronger performance" data={rows} dataKey="emissions" unit=" kg CO₂e" reduceMotion={reduceMotion}/><MetricChart title="Participation Comparison" description="Employees with matching activity in the selected period" data={rows} dataKey="participation" unit="%" reduceMotion={reduceMotion}/><MetricChart title="Goal Completion Comparison" description="Current backend-reported employee goal progress averaged by department" data={rows.filter(row=>row.goalCompletion!==null)} dataKey="goalCompletion" unit="%" reduceMotion={reduceMotion}/><section className={card}><h2 className="font-semibold text-slate-950 dark:text-white">Department Ranking</h2><p className="mt-1 text-xs text-slate-500">Ranked by lowest matching emissions</p><div className="mt-4 space-y-2">{ranked.map((row,index)=><button key={row.department} type="button" onClick={()=>setDrawer(row)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-emerald-950/20"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm font-bold dark:bg-slate-800">{index+1}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold text-slate-900 dark:text-white">{row.department}</span><span className="text-xs text-slate-500">{row.emissions.toLocaleString()} kg CO₂e · {row.participation}% participation</span></span><ChevronRight className="h-4 w-4 text-slate-400"/></button>)}</div></section></div>
    {drawer&&<div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setDrawer(null)}}><motion.aside initial={reduceMotion?false:{x:40,opacity:0}} animate={{x:0,opacity:1}} className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="department-drawer-title"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-600"/><h2 id="department-drawer-title" className="text-xl font-bold">{drawer.department}</h2></div><button type="button" aria-label="Close department details" onClick={()=>setDrawer(null)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5"/></button></div><dl className="mt-6 grid grid-cols-2 gap-3">{[['Employees',drawer.employees],['Activities',drawer.activities],['Emissions',`${drawer.emissions.toLocaleString()} kg CO₂e`],['Participation',`${drawer.participation}%`],['Goal progress',drawer.goalCompletion===null?'Not available':`${drawer.goalCompletion}%`]].map(([label,value])=><div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</dd></div>)}</dl><h3 className="mt-6 font-semibold">Employees</h3>{drawer.members.length?<ul className="mt-3 space-y-2">{drawer.members.map(name=><li key={name} className="rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">{name}</li>)}</ul>:<p className="mt-2 text-sm text-slate-500">No employees available.</p>}</motion.aside></div>}
  </div>;
}
