import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';

const NotificationSettings: React.FC = () => {
  const { addNotification } = useCRM();
  const [settings, setSettings] = useState({
    emailNotifications: {
      newLeads: true,
      dealUpdates: true,
      taskReminders: true,
      weeklyReports: false,
    },
    pushNotifications: {
      newMessages: true,
      appointmentReminders: true,
      deadlineAlerts: true,
      systemUpdates: false,
    },
    smsNotifications: {
      urgentAlerts: true,
      appointmentConfirmations: false,
      weeklyDigest: false,
    },
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting as keyof typeof prev[category as keyof typeof prev]],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      type: 'success',
      message: 'Notification preferences updated successfully!',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        <p className="text-sm text-gray-500">Configure how you want to receive notifications</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Notifications */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <p className="text-xs text-gray-500">
                    {key === 'newLeads' && 'Get notified when new leads are added'}
                    {key === 'dealUpdates' && 'Receive updates on deal progress'}
                    {key === 'taskReminders' && 'Reminders for upcoming tasks'}
                    {key === 'weeklyReports' && 'Weekly performance summary'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('emailNotifications', key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Push Notifications</h4>
          <div className="space-y-4">
            {Object.entries(settings.pushNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <p className="text-xs text-gray-500">
                    {key === 'newMessages' && 'Instant notifications for new messages'}
                    {key === 'appointmentReminders' && 'Reminders for scheduled appointments'}
                    {key === 'deadlineAlerts' && 'Alerts for approaching deadlines'}
                    {key === 'systemUpdates' && 'Notifications about system updates'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('pushNotifications', key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">SMS Notifications</h4>
          <div className="space-y-4">
            {Object.entries(settings.smsNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <p className="text-xs text-gray-500">
                    {key === 'urgentAlerts' && 'Critical alerts via SMS'}
                    {key === 'appointmentConfirmations' && 'SMS confirmations for appointments'}
                    {key === 'weeklyDigest' && 'Weekly summary via SMS'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('smsNotifications', key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;