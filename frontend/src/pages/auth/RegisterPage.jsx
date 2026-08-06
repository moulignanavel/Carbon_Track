import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, UserRound, Lock, Mail, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, organisationRegisterSchema } from '@/utils/validators';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Button, Input, Alert } from '@/components/ui';

const inputClass = '!bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 !rounded-xl shadow-sm';
const passwordTests = [(v) => v.length >= 8, (v) => /[A-Z]/.test(v), (v) => /\d/.test(v), (v) => /[^A-Za-z0-9]/.test(v)];

function PasswordStrength({ value = '' }) {
  const score = passwordTests.filter((test) => test(value)).length;
  if (!value) return null;
  return <div className="mt-2" aria-live="polite">
    <div className="flex gap-1">{[1,2,3,4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded ${n <= score ? 'bg-[#7FBF8C]' : 'bg-slate-700'}`} />)}</div>
    <p className="mt-1 text-xs text-[#9FAFA5]">Password strength: {['Weak','Weak','Fair','Good','Strong'][score]}</p>
  </div>;
}

function Terms({ register, error }) {
  return <div><label className="flex gap-3 text-sm text-[#C8D3CB]">
    <input type="checkbox" className="mt-1" {...register('acceptTerms')} />
    <span>I accept the <Link className="text-[#7FBF8C]" to="#">Terms</Link> and <Link className="text-[#7FBF8C]" to="#">Privacy Policy</Link>.</span>
  </label>{error && <p className="form-error mt-1">{error.message}</p>}</div>;
}

function IndividualForm() {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(registerSchema), defaultValues:{ fullName:'', username:'', email:'', password:'', confirmPassword:'', acceptTerms:false } });
  const { register, handleSubmit, watch, setError, formState:{ errors, isSubmitting } } = form;
  const submit = async (data) => {
    try {
      await createAccount({ fullName:data.fullName, username:data.username, email:data.email, password:data.password });
      toast.success('Your individual account has been created successfully.');
      navigate('/', { replace:true });
    } catch (error) { setError('root', { message:extractErrorMessage(error) }); }
  };
  return <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
    <div>
      <h2 className="text-xl font-bold">Individual User Details</h2>
      <p className="mt-1 text-sm text-[#9FAFA5]">Enter your details using the example format shown in each field.</p>
    </div>
    {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
    <div className="grid sm:grid-cols-2 gap-4">
      <Input label="Full name" placeholder="e.g. Priya Sharma" autoComplete="name" required error={errors.fullName?.message} className={inputClass} {...register('fullName')} />
      <Input label="Username" placeholder="e.g. priya_sharma" autoComplete="username" hint="3–50 characters; letters, numbers, dots, dashes or underscores." required error={errors.username?.message} className={inputClass} {...register('username')} />
    </div>
    <Input label="Email" type="email" placeholder="e.g. priya@example.com" autoComplete="email" required leftIcon={<Mail />} error={errors.email?.message} className={inputClass} {...register('email')} />
    <div className="grid sm:grid-cols-2 gap-4">
      <div><Input label="Password" type="password" placeholder="Enter your password" autoComplete="new-password" required leftIcon={<Lock />} error={errors.password?.message} className={inputClass} {...register('password')} /><PasswordStrength value={watch('password')} /></div>
      <Input label="Confirm password" type="password" placeholder="Re-enter the same password" autoComplete="new-password" required error={errors.confirmPassword?.message} className={inputClass} {...register('confirmPassword')} />
    </div>
    <Terms register={register} error={errors.acceptTerms} />
    <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={isSubmitting}>Create individual account</Button>
  </form>;
}

function OrganisationForm() {
  const { registerOrganisation } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setError, formState:{ errors, isSubmitting } } = useForm({
    resolver:zodResolver(organisationRegisterSchema), defaultValues:{ acceptTerms:false, organisationType:'' },
  });
  const submit = async (data) => {
    try {
      const { confirmPassword: _confirmPassword, acceptTerms: _acceptTerms, ...payload } = data;
      await registerOrganisation(payload);
      toast.success('Your organisation account has been created successfully.');
      navigate('/', { replace:true });
    } catch(error) { setError('root', { message:extractErrorMessage(error) }); }
  };
  const field = (name,label,required=false,type='text',placeholder='',hint='') =>
    <Input label={label} type={type} placeholder={placeholder} hint={hint} required={required} error={errors[name]?.message} className={inputClass} {...register(name)} />;
  return <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
    {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
    <section>
      <h2 className="text-xl font-bold">1. Organisation Details</h2>
      <p className="mt-1 mb-4 text-sm text-[#9FAFA5]">Tell us about the organisation using its official information.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {field('organisationName','Organisation name',true,'text','e.g. Greenfield Technologies Pvt Ltd')}
        {field('organisationCode','Organisation code',true,'text','e.g. GFT-2026','Use your company or institution code.')}
        <div><label className="form-label">Organisation type *</label><select className={`form-input ${inputClass}`} {...register('organisationType')}><option value="">Choose organisation type</option><option>Company</option><option>Institution</option><option>Non-profit</option><option>Government</option><option>Team</option></select>{errors.organisationType && <p className="form-error">{errors.organisationType.message}</p>}</div>
        {field('industry','Industry',false,'text','e.g. Information Technology')}
        {field('officialEmail','Official organisation email',true,'email','e.g. contact@greenfield.com')}
        {field('contactNumber','Contact number',false,'tel','e.g. +91 98765 43210')}
        <div className="sm:col-span-2">{field('address','Address',false,'text','e.g. 12, Anna Salai, Guindy')}</div>
        {field('city','City',false,'text','e.g. Chennai')}
        {field('state','State',false,'text','e.g. Tamil Nadu')}
        {field('country','Country',false,'text','e.g. India')}
      </div>
    </section>
    <section>
      <h2 className="text-xl font-bold">2. Organisation Administrator Details</h2>
      <p className="mt-1 mb-4 text-sm text-[#9FAFA5]">This person will manage the organisation dashboard and members.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {field('adminFullName','Admin full name',true,'text','e.g. Priya Sharma')}
        {field('username','Username',true,'text','e.g. priya.admin','3–50 characters; letters, numbers, dots, dashes or underscores.')}
        {field('workEmail','Work email',true,'email','e.g. priya@greenfield.com')}
        {field('jobTitle','Job title',false,'text','e.g. Sustainability Manager')}
        <div>{field('password','Password',true,'password','Enter your password')}<PasswordStrength value={watch('password')} /></div>
        {field('confirmPassword','Confirm password',true,'password','Re-enter the same password')}
      </div>
    </section>
    <Terms register={register} error={errors.acceptTerms} />
    <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={isSubmitting}>Create organisation account</Button>
  </form>;
}

export default function RegisterPage() {
  const [accountType,setAccountType] = useState('INDIVIDUAL');
  const options = [
    { id:'INDIVIDUAL', title:'Individual User', icon:UserRound, text:'Track your personal carbon footprint, log activities, set sustainability goals, earn badges and receive personalised recommendations.', action:'Continue as Individual' },
    { id:'ORGANISATION', title:'Organisation', icon:Building2, text:'Register your company, institution or team to monitor organisation emissions, compare employee performance and generate CSR reports.', action:'Continue as Organisation' },
  ];
  return <div className="slide-up rounded-3xl border border-[#1E4432] bg-[#0F2E22]/70 p-5 sm:p-9 text-[#F3EFE4] backdrop-blur-3xl">
    <header className="text-center mb-7"><h1 className="text-3xl font-black">Create your CarbonTrack account</h1><p className="mt-2 text-[#9FAFA5]">Choose how you want to use CarbonTrack.</p></header>
    <div className="grid md:grid-cols-2 gap-4 mb-8" role="radiogroup" aria-label="Account type">
      {options.map(({id,title,icon:Icon,text,action}) => <button key={id} type="button" role="radio" aria-checked={accountType===id} onClick={()=>setAccountType(id)}
        className={`text-left rounded-2xl border p-5 transition ${accountType===id ? 'border-[#7FBF8C] bg-[#7FBF8C]/10 ring-2 ring-[#7FBF8C]/20' : 'border-[#315744] bg-[#06140F]/35 hover:border-[#7FBF8C]/60'}`}>
        <span className="flex justify-between"><Icon className="h-7 w-7 text-[#7FBF8C]" />{accountType===id && <BadgeCheck className="text-[#7FBF8C]" />}</span>
        <strong className="block text-lg mt-3">{title}</strong><span className="block text-sm text-[#9FAFA5] mt-2">{text}</span><span className="block text-sm font-bold text-[#7FBF8C] mt-4">{action}</span>
      </button>)}
    </div>
    {accountType === 'INDIVIDUAL' ? <IndividualForm key="individual" /> : <OrganisationForm key="organisation" />}
    <p className="text-center mt-7 text-sm"><Link to="/" className="font-bold text-[#7FBF8C]">Back to Login</Link></p>
  </div>;
}
