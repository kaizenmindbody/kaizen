import { TicketIcon } from '@heroicons/react/24/outline';

export default function ManageCoupons() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
          Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
          <p className="text-gray-500 mb-6">Create discount coupons to promote your events.</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
            Create Your First Coupon
          </button>
        </div>
      </div>
    </div>
  );
}
