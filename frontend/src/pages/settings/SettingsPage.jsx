import { useState, useEffect, useRef } from 'react';
import { User, Moon, Sun, Bell, Shield, Leaf } from 'lucide-react';
import { useAuth }  from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useDensity } from '@/context/DensityContext';
import { Card, Button, Input, Badge, Alert, Tabs } from '@/components/ui';
import { getMyProfile, updateMyProfile, uploadAvatar } from '@/api';
import toast from 'react-hot-toast';

const SETTING_TABS = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'appearance',    label: 'Appearance',     icon: Sun    },
  { id: 'notifications', label: 'Notifications',  icon: Bell   },
  { id: 'security',      label: 'Security',       icon: Shield },
];

function ProfileTab({ user }) {
  const { updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (!active) return;
        setUsername(profile.username || '');
        setEmail(profile.email || '');
      })
      .catch((err) => {
        console.error('Failed to load profile details:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setErrorMsg(null);
    try {
      const updated = await updateMyProfile({ username, email });
      updateUser({ username: updated.username });
      setSaved(true);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl });
      toast.success('Profile picture updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <form className="space-y-8 flex flex-col items-center py-6" onSubmit={handleSave}>
      {saved && (
        <Alert variant="success" dismissible onClose={() => setSaved(false)}>
          Profile updated successfully.
        </Alert>
      )}
      {errorMsg && (
        <Alert variant="danger" dismissible onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}
      <div className="flex flex-col items-center gap-3">
        <div 
          className="relative group cursor-pointer rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          {user?.avatarUrl ? (
            <img 
              src={`http://localhost:8080${user.avatarUrl}`} 
              alt="Profile" 
              className={`h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-green-50 dark:ring-green-900/30 ${uploadingAvatar ? 'opacity-50' : ''}`}
            />
          ) : (
            <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white text-4xl font-bold shadow-md ring-4 ring-green-50 dark:ring-green-900/30 ${uploadingAvatar ? 'opacity-50' : ''}`}>
              {user?.username?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
            <span className="text-white text-xs font-medium">Change</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{user?.username}</p>
          <Badge variant="green" size="sm" dot className="mt-1">{user?.role ?? 'USER'}</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Input 
          label="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          leftIcon={<User className="h-4 w-4" />} 
          required
        />
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="your@email.com" 
          required
        />
      </div>
      <Button 
        type="submit"
        variant="primary" 
        size="md"
        className="w-full max-w-md mt-2"
        isLoading={loading} 
        disabled={!username || !email}
      >
        Save Changes
      </Button>
    </form>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();
  const { density, setDensity } = useDensity();

  const densityOptions = [
    { id: 'compact',     label: 'Compact'     },
    { id: 'default',     label: 'Default'     },
    { id: 'comfortable', label: 'Comfortable' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Theme</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun  },
            { id: 'dark',  label: 'Dark',  icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => theme !== id && toggleTheme()}
              className={[
                'flex items-center gap-3 rounded-xl border-2 p-4 text-sm font-medium transition-all cursor-pointer',
                theme === id
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
              {label}
              {theme === id && <Badge variant="green" size="xs" className="ml-auto">Active</Badge>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Density</p>
        <p className="text-xs text-slate-500 mb-3">Control spacing of UI elements</p>
        <div className="flex gap-2">
          {densityOptions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setDensity(id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                density === id
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    weeklyDigest: true,
    goalAlerts: true,
    badgeEarned: true,
    newTips: false,
  });
  return (
    <div className="space-y-4">
      {Object.entries({
        weeklyDigest: { label: 'Weekly digest',      desc: 'Summary of your carbon activity' },
        goalAlerts:   { label: 'Goal alerts',         desc: 'Notify when approaching budget'  },
        badgeEarned:  { label: 'Badge notifications', desc: 'When you earn a new achievement' },
        newTips:      { label: 'Eco tips',            desc: 'Sustainability tips & tricks'    },
      }).map(([key, { label, desc }]) => (
        <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${prefs[key] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${prefs[key] ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <Alert variant="info">
        Password changes are not yet available. Please contact support.
      </Alert>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Current Password" type="password" disabled placeholder="••••••••" />
        <Input label="New Password"     type="password" disabled placeholder="••••••••" />
      </div>
      <div className="card border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 p-4">
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Danger Zone</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 mb-3">
          Permanently delete your account and all associated data.
        </p>
        <Button variant="danger" size="sm">Delete Account</Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');

  const PANELS = {
    profile:       <ProfileTab user={user} />,
    appearance:    <AppearanceTab />,
    notifications: <NotificationsTab />,
    security:      <SecurityTab />,
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
          <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
          <p className="text-sm text-slate-500">Manage your account and preferences</p>
        </div>
      </div>

      <Card>
        <Tabs tabs={SETTING_TABS} variant="line" activeTab={tab} onChange={setTab} />
        <div className="mt-5">{PANELS[tab]}</div>
      </Card>
    </div>
  );
}
