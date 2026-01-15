import React from 'react';

/**
 * CustomerInfo component - displays customer information
 */
const CustomerInfo = ({ customer, messageCount }) => {
    if (!customer) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Customer Information
                </h3>
                <p className="text-gray-500">No customer data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-xs font-bold text-branch-navy uppercase tracking-widest mb-8 opacity-70">
                Customer Intelligence
            </h3>

            <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-branch-light text-branch-navy font-black text-3xl border border-slate-200">
                        {customer.user_id}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-branch-gray uppercase tracking-widest mb-1">Database Key</p>
                        <p className="text-2xl font-black text-branch-navy">#{customer.user_id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-1">Account Status</p>
                        <p className="font-bold text-branch-navy text-lg">
                            {customer.account_status || 'ACTIVE'}
                        </p>
                    </div>

                    {customer.loan_status && (
                        <div>
                            <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-1">Loan Portfolio</p>
                            <p className="font-bold text-branch-navy text-lg">{customer.loan_status}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-1">Direct Messages</p>
                        <p className="font-bold text-branch-navy text-lg">
                            {customer.total_messages || messageCount || 0}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-1">Client Since</p>
                        <p className="font-bold text-branch-navy text-lg">
                            {new Date(customer.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerInfo;
