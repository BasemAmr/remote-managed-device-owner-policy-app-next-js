'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react';
import type { ApprovalRequest } from '@/lib/types';
import { formatRelativeTime, formatRequestType, safeJsonParse, getCountdownSeconds, formatCountdown } from '@/lib/utils';

interface RequestCardProps {
    request: ApprovalRequest;
    onApprove: (id: number, notes?: string) => Promise<void>;
    onDeny: (id: number, notes?: string) => Promise<void>;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onApprove, onDeny }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isDenying, setIsDenying] = useState(false);
    const [notes, setNotes] = useState('');
    const [countdown, setCountdown] = useState<number>(0);

    const targetData = safeJsonParse(request.target_data, {});
    const isPending = request.status === 'pending';

    // Update countdown every second
    useEffect(() => {
        if (request.cooldown_until) {
            const updateCountdown = () => {
                const seconds = getCountdownSeconds(request.cooldown_until!);
                setCountdown(seconds);
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);

            return () => clearInterval(interval);
        }
    }, [request.cooldown_until]);

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await onApprove(request.id, notes || undefined);
        } finally {
            setIsApproving(false);
        }
    };

    const handleDeny = async () => {
        setIsDenying(true);
        try {
            await onDeny(request.id, notes || undefined);
        } finally {
            setIsDenying(false);
        }
    };

    return (
        <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2
      ${isPending ? 'border-yellow-400 dark:border-yellow-600' : 'border-gray-200 dark:border-gray-700'}
    `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${isPending ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Smartphone className={`w-6 h-6 ${isPending ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {request.device_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatRequestType(request.request_type)}
                        </p>
                    </div>
                </div>

                {/* Status badge */}
                <span className={`
          px-3 py-1 rounded-full text-xs font-semibold uppercase
          ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
          ${request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
          ${request.status === 'denied' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
        `}>
                    {request.status}
                </span>
            </div>

            {/* Target data */}
            {Object.keys(targetData).length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Request Details:</p>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        {JSON.stringify(targetData, null, 2)}
                    </pre>
                </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Requested {formatRelativeTime(request.requested_at)}</span>
                </div>

                {request.cooldown_until && countdown > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>Cooldown: {formatCountdown(countdown)}</span>
                    </div>
                )}

                {request.notes && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Admin Notes:</p>
                        <p className="text-sm text-blue-800 dark:text-blue-400">{request.notes}</p>
                    </div>
                )}
            </div>

            {/* Actions (only for pending requests) */}
            {isPending && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes (optional)..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={isApproving || isDenying}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            {isApproving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            <span>Approve</span>
                        </button>

                        <button
                            onClick={handleDeny}
                            disabled={isApproving || isDenying}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            {isDenying ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <span>Deny</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestCard;
