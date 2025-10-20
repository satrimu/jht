# Payments - Client-Side Search & Pagination Feature

**Status**: ✅ IMPLEMENTED  
**Last Updated**: 2025-10-20  
**Component**: `resources/js/pages/admin/payments/Index.tsx`

## Overview

Implementasi client-side search dan pagination untuk Payments Management page. Fitur ini memungkinkan admin untuk:

1. **Search Payments**: Pencarian real-time berdasarkan nama member, nomor member, email, atau jumlah pembayaran
2. **Pagination**: Membagi daftar pembayaran menjadi halaman dengan 10 pembayaran per halaman
3. **Results Info**: Informasi jumlah hasil yang ditampilkan

## Features

### 1. Client-Side Search
- **Real-time filtering**: Hasil perubahan saat pengguna mengetik
- **Multi-field search**: Mencari berdasarkan:
  - Member name (full_name)
  - Member number
  - Member email
  - Payment amount
- **Case-insensitive**: Pencarian tidak sensitif pada huruf besar/kecil
- **Auto-reset pagination**: Halaman otomatis reset ke halaman 1 saat search berubah

**Implementation**:
```tsx
const filteredPayments = useMemo(() => {
    const searchLower = searchPayments.toLowerCase();
    return payments.data.filter(payment =>
        payment.user.full_name.toLowerCase().includes(searchLower) ||
        payment.user.member_number?.toLowerCase().includes(searchLower) ||
        payment.user.email?.toLowerCase().includes(searchLower) ||
        payment.amount.includes(searchPayments)
    );
}, [payments.data, searchPayments]);
```

### 2. Pagination
- **Items per page**: 10 pembayaran per halaman
- **Dynamic page calculation**: Total halaman dihitung otomatis dari hasil filter
- **Smart page links**: Menampilkan first, last, current, dan neighbors dengan ellipsis
- **Disabled state**: Previous/Next button otomatis disabled di awal/akhir

**Implementation**:
```tsx
const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * paymentsPerPage;
    const endIndex = startIndex + paymentsPerPage;
    return filteredPayments.slice(startIndex, endIndex);
}, [filteredPayments, currentPage, paymentsPerPage]);
```

### 3. Search Input UI
- **Icon**: Search icon dari lucide-react
- **Placeholder**: "Cari member, jumlah, atau nomor..."
- **Responsive**: Full width pada mobile, 288px pada desktop
- **Position**: Di header dengan Add Payment button

### 4. Results Information
- **Dynamic text**: Menampilkan range hasil yang sedang ditampilkan
- **Example**: "Menampilkan 1 - 10 dari 50 pembayaran"
- **Empty state handling**: Pesan berbeda untuk search tidak match vs no data

## State Management

```tsx
const [searchPayments, setSearchPayments] = useState('');       // Search term
const [currentPage, setCurrentPage] = useState(1);              // Current page
const paymentsPerPage = 10;                                     // Fixed items per page
```

## Computed Values

1. **filteredPayments**: Array pembayaran hasil filter berdasarkan search
2. **totalPages**: Total halaman = ceil(filteredPayments.length / 10)
3. **paginatedPayments**: Array pembayaran untuk halaman saat ini

## Event Handlers

### `handleSearchChange(value: string)`
```tsx
const handleSearchChange = (value: string) => {
    setSearchPayments(value);
    setCurrentPage(1);  // Reset to page 1
};
```
- Triggered: Saat input search berubah
- Behavior: Update search term dan reset ke halaman 1

### Pagination Navigation
```tsx
onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}         // Previous
onClick={() => setCurrentPage(page)}                                  // Page number
onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} // Next
```

## Component Structure

```
Header
├── Title & Description (Payments)
├── Search Input (with icon)
└── Add Payment Button

Table Content
├── TableHeader (ID, Member, Amount, Payment Date, Status, Image, Actions)
└── TableBody (paginatedPayments)

Pagination (if totalPages > 1)
├── Previous Button
├── Page Numbers (1, ..., current-1, current, current+1, ..., last)
├── Next Button
└── Results Info (X - Y dari Z pembayaran)
```

## Styling & Responsive

### Desktop (md breakpoint)
- Header: flex row with justify-between
- Search input: `w-72` (288px)
- Search + Button: flex row with gap
- Table: Full width with proper spacing

### Tablet (sm breakpoint)
- Header: flex row with gap
- Search + Button: flex row with items-center

### Mobile
- Header: flex col (stacked)
- Search input: `w-full` (full width)
- Search + Button: flex col with gap

### Dark Mode
- Full support via shadcn/ui components
- Proper contrast and visibility maintained

## Integration with Page Context

### Modal Integration
- All modals (Create, Show, Edit, Delete) still functional
- Modal data passed from selected payment (not affected by search/pagination)

### Navigation
- All action buttons (View, Edit, Delete) work with paginated payments
- Pagination is client-side only, no server requests

## Performance Considerations

1. **useMemo Optimization**:
   - filteredPayments: Hanya re-compute saat payments atau searchPayments berubah
   - paginatedPayments: Hanya re-compute saat filteredPayments atau currentPage berubah

2. **Rendering**:
   - Hanya 10 items di-render per halaman (tidak semua payments)
   - Search filtering dilakukan client-side (instant, tidak perlu request ke server)

3. **No Server Round-trips**:
   - Search dan pagination semuanya client-side
   - Tidak membuat request baru saat search atau page change

## Edge Cases Handled

1. **Empty search**: Menampilkan semua payments
2. **No results**: Pesan "No payments found matching your search"
3. **No payments**: Pesan "No payments found"
4. **Single page**: Pagination tidak ditampilkan (totalPages > 1 check)
5. **Current page exceeds total pages**: Tidak possible karena currentPage selalu valid

## Type Safety

```tsx
interface PaymentsIndexProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    users: User[];
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}
```

## Imports Added

```tsx
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
```

## Browser Support

✅ All modern browsers supporting:
- ES6+ (arrow functions, const/let, template literals)
- React 18+ hooks (useState, useMemo)
- CSS Grid/Flexbox

## Testing Considerations

**Unit Test scenarios**:
1. Search filter works correctly (all 4 fields)
2. Pagination calculates correct page count
3. Page navigation works (prev, next, page numbers)
4. Auto-reset on search
5. Empty states show correct messages
6. Results info displays correct range

**Integration Test scenarios**:
1. Create/Edit/Delete modals work with paginated payments
2. Multiple searches in sequence
3. Performance with large payment lists (100+ items)

## Future Enhancements

1. **Status filter**: Filter by pending/terbayar status
2. **Date range filter**: Filter by payment date range
3. **Export to CSV**: Export filtered results to CSV
4. **Sort by column**: Sort by member name, amount, date, etc.
5. **Payment validation workflow**: Visual indicators for pending approvals
6. **Batch actions**: Select multiple payments and perform actions

## Comparison with Reports Members List

| Feature | Payments | Reports Members |
|---|---|---|
| Search fields | 4 (name, member_no, email, amount) | 2 (name, email) |
| Items per page | 10 | 10 |
| Pagination style | Smart links with ellipsis | Smart links with ellipsis |
| Empty state | Different messages | Different messages |
| Responsive | Full support | Full support |
| Performance | Optimized with useMemo | Optimized with useMemo |

## Related Files

- **Component**: `resources/js/pages/admin/payments/Index.tsx`
- **Modals**: 
  - `resources/js/pages/admin/payments/CreatePaymentModal.tsx`
  - `resources/js/pages/admin/payments/EditPaymentModal.tsx`
  - `resources/js/pages/admin/payments/DeletePaymentModal.tsx`
  - `resources/js/pages/admin/payments/ShowPaymentModal.tsx`
- **Controller**: `app/Http/Controllers/Admin/PaymentController.php`
- **Types**: `resources/js/pages/shared/types/index.ts`
- **UI Components**: `resources/js/components/ui/` (Input, Pagination, Table)

---

**Implemented by**: GitHub Copilot  
**Completion Status**: ✅ Ready for production
