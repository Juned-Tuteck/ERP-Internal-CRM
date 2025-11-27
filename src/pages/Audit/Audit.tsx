import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Filter, Calendar, User, FileText, Search } from 'lucide-react';

interface Customer {
  customer_id: string;
  customer_number: string;
  business_name: string;
}

interface Lead {
  lead_id: string;
  lead_number: string;
  business_name: string;
}

interface AuditLog {
  id: string;
  sourcetype: string;
  sourceid: string;
  eventtype: 'CREATE' | 'UPDATE' | 'DELETE';
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_snapshot: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  changed_by: string;
  changed_by_name: string;
  change_reason: string | null;
  source_status: string | null;
  created_at: string;
}

type EntityType = 'customer' | 'lead';

const Audit: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  const [entities, setEntities] = useState<Customer[] | Lead[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [fieldNameFilter, setFieldNameFilter] = useState<string>('ALL');
  const [changedByFilter, setChangedByFilter] = useState<string>('ALL');

  useEffect(() => {
    if (entityType) {
      fetchEntities();
    }
  }, [entityType]);

  useEffect(() => {
    if (selectedEntityId) {
      fetchAuditLogs();
    }
  }, [selectedEntityId]);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    setEntities([]);
    setSelectedEntityId('');
    setAuditLogs([]);

    try {
      if (entityType === 'customer') {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/customer/`,
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        const customers = response.data.data || response.data || [];
        setEntities(customers);
      } else if (entityType === 'lead') {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead/`
        );
        const leads = response.data.data || [];
        setEntities(leads);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/audit-log/source/${selectedEntityId}`
      );
      const logs = response.data.data || [];
      setAuditLogs(logs);
      resetFilters();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setEventTypeFilter('ALL');
    setFromDate('');
    setToDate('');
    setFieldNameFilter('ALL');
    setChangedByFilter('ALL');
  };

  const uniqueFieldNames = useMemo(() => {
    const fields = new Set<string>();
    auditLogs.forEach(log => {
      if (log.field_name) fields.add(log.field_name);
    });
    return Array.from(fields).sort();
  }, [auditLogs]);

  const uniqueChangedBy = useMemo(() => {
    const users = new Set<string>();
    auditLogs.forEach(log => {
      if (log.changed_by) users.add(log.changed_by_name);
    });
    return Array.from(users).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (eventTypeFilter !== 'ALL' && log.eventtype !== eventTypeFilter) {
        return false;
      }

      if (fieldNameFilter !== 'ALL' && log.field_name !== fieldNameFilter) {
        return false;
      }

      if (changedByFilter !== 'ALL' && log.changed_by_name !== changedByFilter) {
        return false;
      }

      if (fromDate) {
        const logDate = new Date(log.created_at);
        const filterDate = new Date(fromDate);
        if (logDate < filterDate) return false;
      }

      if (toDate) {
        const logDate = new Date(log.created_at);
        const filterDate = new Date(toDate);
        filterDate.setHours(23, 59, 59, 999);
        if (logDate > filterDate) return false;
      }

      return true;
    });
  }, [auditLogs, eventTypeFilter, fromDate, toDate, fieldNameFilter, changedByFilter]);

  const getEntityDisplay = (entity: Customer | Lead) => {
    if (entityType === 'customer') {
      return `${entity.business_name} (${entity.customer_number})`;
    }
    return `${entity.business_name} (${entity.lead_number})`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getEventTypeBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select Entity Type --</option>
              <option value="customer">Customer</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          {entityType && entities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {entityType === 'customer' ? 'Customer' : 'Lead'}
              </label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select {entityType === 'customer' ? 'Customer' : 'Lead'} --</option>
                {entities.map((entity) => {
                  const id = entityType === 'customer' ? entity.customer_id : entity.lead_id;
                  return (
                    <option key={id} value={id}>
                      {getEntityDisplay(entity)}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {selectedEntityId && auditLogs.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="ALL">ALL</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changed Field
                </label>
                <select
                  value={fieldNameFilter}
                  onChange={(e) => setFieldNameFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="ALL">ALL</option>
                  {uniqueFieldNames.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changed By
                </label>
                <select
                  value={changedByFilter}
                  onChange={(e) => setChangedByFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="ALL">ALL</option>
                  {uniqueChangedBy.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredLogs.length} of {auditLogs.length} logs
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Old Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Changed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No audit logs found matching the selected filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeBadgeColor(log.eventtype)}`}>
                            {log.eventtype}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            {log.field_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-xs truncate" title={formatValue(log.old_value)}>
                            {formatValue(log.old_value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate font-medium" title={formatValue(log.new_value)}>
                            {formatValue(log.new_value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[150px]" title={log.changed_by_name}>
                              {log.changed_by_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-xs truncate" title={log.change_reason || '-'}>
                            {log.change_reason || '-'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedEntityId && auditLogs.length === 0 && !loading && !error && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">No audit logs found for this {entityType}</p>
        </div>
      )}
    </div>
  );
};

export default Audit;
