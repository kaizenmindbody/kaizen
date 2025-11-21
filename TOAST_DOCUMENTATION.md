# Professional Toast Notification System

## Overview
This project uses a professionally designed toast notification system built on top of `react-hot-toast` with enhanced styling, animations, and user experience.

## Features

### 🎨 Professional Design
- **Gradient backgrounds** for visual depth
- **Rounded corners** (16px) for modern look
- **Enhanced shadows** with color-specific tints
- **Custom icons** with circular backgrounds
- **Backdrop blur** for glassmorphism effect
- **Responsive design** for mobile and desktop

### ✨ Smooth Animations
- Slide-in from right animation
- Smooth slide-out animation
- Hover effects with subtle scale and movement
- Icon animations on hover
- Professional transitions (cubic-bezier easing)

### 🎯 Toast Types

#### 1. Success Toast (Green)
```typescript
import { showToast } from '@/lib/toast';

showToast.success('Profile updated successfully!');
```
- **Color**: Green (#10b981)
- **Duration**: 4 seconds
- **Use for**: Successful operations, confirmations

#### 2. Error Toast (Red)
```typescript
showToast.error('Failed to upload file. Please try again.');
```
- **Color**: Red (#ef4444)
- **Duration**: 5 seconds (longer for errors)
- **Use for**: Error messages, failed operations

#### 3. Loading Toast (Blue)
```typescript
const toastId = showToast.loading('Uploading file...');

// Later, dismiss it
showToast.dismiss(toastId);
```
- **Color**: Blue (#3b82f6)
- **Duration**: Until manually dismissed
- **Use for**: Ongoing operations, loading states

#### 4. Warning Toast (Yellow)
```typescript
showToast.warning('This action cannot be undone.');
```
- **Color**: Yellow (#f59e0b)
- **Duration**: 4.5 seconds
- **Use for**: Warnings, cautions, important notices

#### 5. Info Toast (Blue)
```typescript
showToast.info('New features are available!');
```
- **Color**: Blue (#3b82f6)
- **Duration**: 4 seconds
- **Use for**: Informational messages, tips

### 🔄 Promise Toast
For async operations with automatic state management:

```typescript
showToast.promise(
  uploadFile(),
  {
    loading: 'Uploading...',
    success: 'File uploaded successfully!',
    error: 'Upload failed. Please try again.'
  }
);

// With dynamic messages
showToast.promise(
  fetchUserData(),
  {
    loading: 'Loading user data...',
    success: (data) => `Welcome back, ${data.name}!`,
    error: (error) => `Error: ${error.message}`
  }
);
```

## Customization

### Custom Duration
```typescript
showToast.success('Message', { duration: 6000 }); // 6 seconds
```

### Custom Styling
```typescript
showToast.error('Error message', {
  style: {
    fontSize: '16px',
    padding: '20px 26px'
  }
});
```

### Dismissing Toasts
```typescript
// Dismiss a specific toast
const toastId = showToast.loading('Loading...');
showToast.dismiss(toastId);

// Dismiss all toasts
showToast.dismiss();
```

## Configuration

### Global Settings (src/app/providers.tsx)
- **Position**: Bottom-right
- **Spacing**: 24px from edges
- **Gutter**: 16px between toasts
- **Max Width**: 420px
- **Min Width**: 320px

### Design Specifications

#### Colors
- **Success**: Green gradient (#ecfdf5 → #d1fae5)
- **Error**: Red gradient (#fef2f2 → #fee2e2)
- **Loading**: Blue gradient (#eff6ff → #dbeafe)
- **Warning**: Yellow gradient (#fefce8 → #fef3c7)
- **Info**: Blue gradient (#eff6ff → #dbeafe)

#### Typography
- **Font Size**: 15px
- **Font Weight**: 500 (Medium)
- **Letter Spacing**: -0.01em
- **Line Height**: 1.5

#### Spacing
- **Padding**: 18px (vertical) × 24px (horizontal)
- **Border Radius**: 16px
- **Border Width**: 1px

#### Shadows
Each toast has a multi-layered shadow:
1. Primary shadow: `0 20px 25px -5px` with color-specific tint
2. Secondary shadow: `0 10px 10px -5px` with color-specific tint
3. Border shadow: `0 0 0 1px` with color-specific tint

## Animations

### Entrance Animation
- Slides in from the right
- Duration: 0.35s
- Easing: cubic-bezier(0.21, 1.02, 0.73, 1)

### Exit Animation
- Slides out to the right
- Duration: 0.25s
- Easing: cubic-bezier(0.4, 0, 1, 1)

### Hover Effect
- Moves 4px to the left
- Scales up by 1%
- Shadow intensifies
- Icon scales up by 5%

## Accessibility

- **ARIA labels**: All toasts include proper ARIA labels
- **Focus states**: Clear focus indicators for keyboard navigation
- **Color contrast**: All text meets WCAG AA standards
- **Screen reader friendly**: Messages are announced to screen readers

## Mobile Responsiveness

On screens smaller than 640px:
- Toast width adapts to screen width minus 32px margin
- Animations adjusted for mobile viewport
- Touch-friendly sizing maintained

## Best Practices

### Do's ✅
- Use success toasts for confirmations
- Use error toasts for failures with actionable messages
- Use loading toasts for operations taking > 1 second
- Keep messages concise and clear
- Use promise toasts for async operations
- Dismiss loading toasts after operation completes

### Don'ts ❌
- Don't show too many toasts simultaneously
- Don't use toast for critical errors (use modals instead)
- Don't show toasts that disappear too quickly for users to read
- Don't use vague messages like "Error occurred"
- Don't forget to dismiss loading toasts

## Examples

### Form Submission
```typescript
const handleSubmit = async (data) => {
  try {
    await showToast.promise(
      submitForm(data),
      {
        loading: 'Submitting form...',
        success: 'Form submitted successfully!',
        error: 'Failed to submit form. Please try again.'
      }
    );
    // Handle success
  } catch (error) {
    // Error already shown by toast
  }
};
```

### File Upload
```typescript
const handleUpload = async (file) => {
  const uploadToast = showToast.loading('Uploading file...');

  try {
    await uploadFile(file);
    showToast.dismiss(uploadToast);
    showToast.success('File uploaded successfully!');
  } catch (error) {
    showToast.dismiss(uploadToast);
    showToast.error('Upload failed. Please try again.');
  }
};
```

### Multiple Operations
```typescript
const handleBulkAction = async (items) => {
  showToast.info(`Processing ${items.length} items...`);

  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  if (failed === 0) {
    showToast.success(`All ${successful} items processed successfully!`);
  } else if (successful === 0) {
    showToast.error(`Failed to process all ${failed} items.`);
  } else {
    showToast.warning(`${successful} items processed, ${failed} failed.`);
  }
};
```

## Technical Details

### Files
- **Utility**: `src/lib/toast.tsx`
- **Styles**: `src/styles/toast.css`
- **Configuration**: `src/app/providers.tsx`

### Dependencies
- `react-hot-toast`: ^2.6.0

### Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Backdrop filter support (with fallback)
- CSS animations and transitions

## Troubleshooting

### Toast not appearing
- Check if `<Toaster />` is included in providers
- Verify `@/styles/toast.css` is imported
- Check browser console for errors

### Animations not smooth
- Ensure hardware acceleration is enabled
- Check if browser supports backdrop-filter
- Verify CSS animations are not disabled

### Mobile issues
- Check viewport meta tag in HTML
- Verify responsive breakpoints in CSS
- Test on actual devices, not just DevTools

## Migration from Old Toast

If you were using `toast` directly from `react-hot-toast`:

**Before:**
```typescript
import toast from 'react-hot-toast';

toast.success('Success!');
toast.error('Error!');
```

**After:**
```typescript
import { showToast } from '@/lib/toast';

showToast.success('Success!');
showToast.error('Error!');
```

All components in the codebase have been updated to use the new professional toast system.
