/**
 * QuickLog — one-tap shortcuts to pre-fill the activity log form
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap } from 'lucide-react';
import { Card, Button, Modal, Input, Select } from '@/components/ui';
import { MOCK_QUICK_LOG_ITEMS } from '@/data/dashboardMock';
import { ACTIVITY_CATEGORIES } from '@/constants/activities';

function QuickButton({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={[
        'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3',
        'transition-all duration-150 cursor-pointer group',
        item.id === 'custom'
          ? 'border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-green-500 hover:shadow-md hover:-translate-y-0.5',
      ].join(' ')}
      aria-label={`Quick log: ${item.label}`}
    >
      <span className="text-2xl leading-none" aria-hidden="true">{item.icon}</span>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
        {item.label}
      </span>
    </button>
  );
}

export default function QuickLog() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen]   = useState(false);
  const [selectedItem, setSelected] = useState(null);
  const [amount, setAmount]         = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleQuickClick = (item) => {
    if (item.id === 'custom') {
      navigate('/activities');
      return;
    }
    setSelected(item);
    setAmount('');
    setModalOpen(true);
  };

  const handleSave = () => {
    // In production: call addLog() from ActivityContext
    setModalOpen(false);
    setSelected(null);
    setAmount('');
    navigate('/activities');
  };

  const categoryOptions = ACTIVITY_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
  const typeOptions = selectedCat
    ? ACTIVITY_CATEGORIES.find((c) => c.value === selectedCat)?.types?.map((t) => ({ value: t.value, label: t.label })) ?? []
    : selectedItem
      ? [{ value: selectedItem.activityType, label: selectedItem.label }]
      : [];

  return (
    <>
      <Card>
        <Card.Header
          title="Quick Log"
          subtitle="Tap to log a common activity"
          icon={Zap}
          iconColor="text-amber-500"
          action={
            <Button
              variant="primary"
              size="xs"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => navigate('/activities')}
            >
              Full form
            </Button>
          }
        />

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {MOCK_QUICK_LOG_ITEMS.map((item) => (
            <QuickButton key={item.id} item={item} onClick={handleQuickClick} />
          ))}
        </div>
      </Card>

      {/* Quick log mini-modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Log: ${selectedItem?.label}`}
        description="Enter the amount for this activity"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!amount}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3 mb-2">
            <span className="text-2xl" aria-hidden="true">{selectedItem?.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedItem?.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{selectedItem?.category}</p>
            </div>
          </div>
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 15"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
