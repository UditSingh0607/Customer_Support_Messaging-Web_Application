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
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Customer Information
            </h3>

            <div className="space-y-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-2xl mb-4">
                    {customer.user_id}
                </div>

                <div>
                    <p className="text-sm text-gray-600">Customer ID</p>
                    <p className="font-semibold text-gray-800">#{customer.user_id}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="font-semibold text-gray-800">
                        {customer.account_status || 'ACTIVE'}
                    </p>
                </div>

                {customer.loan_status && (
                    <div>
                        <p className="text-sm text-gray-600">Loan Status</p>
                        <p className="font-semibold text-gray-800">{customer.loan_status}</p>
                    </div>
                )}

                <div>
                    <p className="text-sm text-gray-600">Total Messages</p>
                    <p className="font-semibold text-gray-800">
                        {customer.total_messages || messageCount || 0}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Customer Since</p>
                    <p className="font-semibold text-gray-800">
                        {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerInfo;
