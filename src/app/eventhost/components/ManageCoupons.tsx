import { TicketIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
}

interface ManageCouponsProps {
  hostId: string;
}

export default function ManageCoupons({ hostId }: ManageCouponsProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coupons?host_id=${hostId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        // Transform database format to component format
        const transformedCoupons = result.coupons.map((c: any) => ({
          id: c.id.toString(),
          code: c.code,
          discountType: c.discount_type,
          discountValue: parseFloat(c.discount_value),
          maxUses: c.max_uses,
          usedCount: c.used_count,
          validFrom: c.valid_from,
          validUntil: c.valid_until,
          isActive: c.is_active,
          description: c.description,
        }));
        setCoupons(transformedCoupons);
      }
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setShowCouponModal(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowCouponModal(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    setDeletingCouponId(couponToDelete.id);
    try {
      const response = await fetch(`/api/coupons?id=${couponToDelete.id}&host_id=${hostId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCoupons(coupons.filter(c => c.id !== couponToDelete.id));
        toast.success('Coupon deleted successfully');
        setShowDeleteConfirm(false);
        setCouponToDelete(null);
      } else {
        toast.error(result.error || 'Failed to delete coupon');
      }
    } catch (error) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingCouponId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setCouponToDelete(null);
  };

  const handleSaveCoupon = async (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    try {
      const apiData = {
        host_id: hostId,
        code: couponData.code,
        description: couponData.description,
        discount_type: couponData.discountType,
        discount_value: couponData.discountValue,
        max_uses: couponData.maxUses,
        valid_from: couponData.validFrom,
        valid_until: couponData.validUntil,
        is_active: couponData.isActive,
      };

      if (editingCoupon) {
        // Update existing coupon
        const response = await fetch('/api/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...apiData, id: editingCoupon.id }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          await fetchCoupons(); // Refresh the list
          toast.success('Coupon updated successfully');
          setShowCouponModal(false);
        } else {
          toast.error(result.error || 'Failed to update coupon');
          throw new Error(result.error || 'Failed to update coupon');
        }
      } else {
        // Create new coupon
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          await fetchCoupons(); // Refresh the list
          toast.success('Coupon created successfully');
          setShowCouponModal(false);
        } else {
          toast.error(result.error || 'Failed to create coupon');
          throw new Error(result.error || 'Failed to create coupon');
        }
      }
    } catch (error) {
      toast.error('Failed to save coupon');
      throw error; // Re-throw so modal can handle it
    }
  };

  const toggleCouponStatus = async (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    try {
      const response = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: couponId,
          host_id: hostId,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discountType,
          discount_value: coupon.discountValue,
          max_uses: coupon.maxUses,
          valid_from: coupon.validFrom,
          valid_until: coupon.validUntil,
          is_active: !coupon.isActive,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCoupons(coupons.map(c =>
          c.id === couponId ? { ...c, isActive: !c.isActive } : c
        ));
        toast.success('Coupon status updated');
      } else {
        toast.error(result.error || 'Failed to update coupon status');
      }
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={handleAddCoupon}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading coupons...</p>
          </div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
            <p className="text-gray-500 mb-6">Create discount coupons to promote your events.</p>
            <button
              onClick={handleAddCoupon}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Create Your First Coupon
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-gray-900 font-mono">{coupon.code}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-primary">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium text-gray-900">
                    {coupon.usedCount} / {coupon.maxUses}
                  </span>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <div>Valid from: {new Date(coupon.validFrom).toLocaleDateString()}</div>
                  <div>Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleCouponStatus(coupon.id)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEditCoupon(coupon)}
                  className="px-3 py-2 text-sm text-primary hover:bg-blue-50 rounded-lg transition"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(coupon)}
                  disabled={deletingCouponId === coupon.id}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <CouponModal
          coupon={editingCoupon}
          onSave={handleSaveCoupon}
          onClose={() => setShowCouponModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Coupon?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete coupon &quot;<strong className="font-mono">{couponToDelete.code}</strong>&quot;?
              This action cannot be undone and the coupon will no longer be available for use.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={!!deletingCouponId}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingCouponId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingCouponId ? 'Deleting...' : 'Delete Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Coupon Modal Component
interface CouponModalProps {
  coupon: Coupon | null;
  onSave: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  onClose: () => void;
}

function CouponModal({ coupon, onSave, onClose }: CouponModalProps) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    discountType: coupon?.discountType || 'percentage' as 'percentage' | 'fixed',
    discountValue: coupon?.discountValue.toString() || '',
    maxUses: coupon?.maxUses.toString() || '100',
    validFrom: coupon?.validFrom || '',
    validUntil: coupon?.validUntil || '',
    isActive: coupon?.isActive ?? true,
    description: coupon?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format dates for datetime-local input when editing
  useEffect(() => {
    if (coupon) {
      // Convert datetime to format required by datetime-local input (YYYY-MM-DDTHH:mm)
      // Handle timezone correctly - datetime-local expects local time, not UTC
      const formatDateTimeForInput = (dateString: string) => {
        if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
          return '';
        }
        
        try {
          // First, try to parse if it's already in YYYY-MM-DDTHH:mm format (with or without seconds)
          const simpleFormatMatch = dateString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
          if (simpleFormatMatch) {
            // If it's already in the right format (or close), use it directly
            return simpleFormatMatch[1];
          }
          
          // Otherwise, parse the date string - JavaScript Date automatically handles timezone conversion
          // Backend returns dates as ISO 8601 strings (e.g., "2025-11-27T05:20:00+00:00")
          const date = new Date(dateString);
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            return '';
          }
          
          // Get local date/time components (not UTC)
          // This ensures the datetime-local input shows the correct local time
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
          return formatted;
        } catch (error) {
          return '';
        }
      };

      // Format dates for datetime-local input
      const validFromFormatted = formatDateTimeForInput(coupon.validFrom);
      const validUntilFormatted = formatDateTimeForInput(coupon.validUntil);

      setFormData(prev => ({
        ...prev,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        maxUses: coupon.maxUses.toString(),
        validFrom: validFromFormatted,
        validUntil: validUntilFormatted,
        isActive: coupon.isActive,
        description: coupon.description || '',
      }));
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.code || !formData.discountValue || !formData.maxUses || !formData.validFrom || !formData.validUntil) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate discount value
    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    if (formData.discountType === 'percentage' && discountValue > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    // Validate dates
    const validFrom = new Date(formData.validFrom);
    const validUntil = new Date(formData.validUntil);

    if (validUntil < validFrom) {
      alert('Valid Until date cannot be before Valid From date');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: discountValue,
        maxUses: parseInt(formData.maxUses),
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        isActive: formData.isActive,
        description: formData.description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {coupon ? 'Edit Coupon' : 'Create Coupon'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                placeholder="e.g., SUMMER2024, EARLYBIRD"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This code will be automatically converted to uppercase
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Summer promotion discount"
              />
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <div className="relative">
                  {formData.discountType === 'fixed' && (
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className={`w-full ${formData.discountType === 'fixed' ? 'pl-8' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder={formData.discountType === 'percentage' ? '10' : '25.00'}
                    required
                  />
                  {formData.discountType === 'percentage' && (
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of times this coupon can be used
              </p>
            </div>

            {/* Valid Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  min={formData.validFrom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Only active coupons can be used by customers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{coupon ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  coupon ? 'Update Coupon' : 'Create Coupon'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
