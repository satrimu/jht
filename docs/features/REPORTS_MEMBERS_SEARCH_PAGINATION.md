# Reports - Members List Search & Pagination Feature

**Status**: ✅ IMPLEMENTED  
**Last Updated**: 2025-10-20  
**Component**: `resources/js/pages/admin/reports/Index.tsx`

## Overview

Implementasi client-side search dan pagination untuk Members List section di halaman Laporan Iuran. Fitur ini memungkinkan admin untuk:

1. **Search Members**: Pencarian real-time berdasarkan nama atau email anggota
2. **Pagination**: Membagi daftar anggota menjadi halaman dengan 10 anggota per halaman
3. **Results Info**: Informasi jumlah hasil yang ditampilkan

## Features

### 1. Client-Side Search
- **Real-time filtering**: Hasil perubahan saat pengguna mengetik
- **Multi-field search**: Mencari berdasarkan nama (full_name) atau email
- **Case-insensitive**: Pencarian tidak sensitif pada huruf besar/kecil
- **Auto-reset pagination**: Halaman otomatis reset ke halaman 1 saat search berubah

**Implementation**:
```tsx
const filteredMembers = useMemo(() => {
    const searchLower = searchMembers.toLowerCase();
    return members.filter(member =>
        member.full_name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
    );
}, [members, searchMembers]);
```

### 2. Pagination
- **Items per page**: 10 anggota per halaman
- **Dynamic page calculation**: Total halaman dihitung otomatis dari hasil filter
- **Smart page links**: Menampilkan first, last, current, dan neighbors dengan ellipsis
- **Disabled state**: Previous/Next button otomatis disabled di awal/akhir

**Implementation**:
```tsx
const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    return filteredMembers.slice(startIndex, endIndex);
}, [filteredMembers, currentPage, membersPerPage]);
```

### 3. Search Input UI
- **Icon**: Search icon dari lucide-react
- **Placeholder**: "Cari nama atau email..."
- **Responsive**: Full width pada mobile, 288px pada desktop
- **Clear on empty**: Reset ke halaman 1 saat search dikosongkan

### 4. Results Information
- **Dynamic text**: Menampilkan range hasil yang sedang ditampilkan
- **Example**: "Menampilkan 1 - 10 dari 50 anggota"
- **Empty state handling**: Pesan berbeda untuk "Anggota tidak ditemukan" vs "Belum ada anggota"

## State Management

```tsx
const [searchMembers, setSearchMembers] = useState('');     // Search term
const [currentPage, setCurrentPage] = useState(1);           // Current page
const membersPerPage = 10;                                   // Fixed items per page
```

## Computed Values

1. **filteredMembers**: Array anggota hasil filter berdasarkan search
2. **totalPages**: Total halaman = ceil(filteredMembers.length / 10)
3. **paginatedMembers**: Array anggota untuk halaman saat ini

## Event Handlers

### `handleSearchChange(value: string)`
```tsx
const handleSearchChange = (value: string) => {
    setSearchMembers(value);
    setCurrentPage(1);  // Reset to page 1
};
```
- Triggered: Saat input search berubah
- Behavior: Update search term dan reset ke halaman 1

### Pagination Navigation
```tsx
onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}    // Previous
onClick={() => setCurrentPage(page)}                             // Page number
onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} // Next
```

## Component Structure

```
CardHeader
├── Title & Description (Daftar Anggota)
└── Search Input (with icon)

CardContent
├── Table (Members list)
│   ├── TableHeader (Nama, Email, Aksi)
│   └── TableBody (paginatedMembers)
├── Pagination (if totalPages > 1)
│   ├── Previous Button
│   ├── Page Numbers (1, ..., current-1, current, current+1, ..., last)
│   └── Next Button
└── Results Info (X - Y dari Z anggota)
```

## Styling & Responsive

### Desktop (md breakpoint)
- Search input: `w-72` (288px)
- Header layout: flex row with justify-between
- Table: Full width with proper spacing

### Mobile
- Search input: `w-full` (full width)
- Header layout: flex col (stacked)
- Table: Scrollable horizontally

### Dark Mode
- Full support via shadcn/ui components
- Proper contrast and visibility maintained

## Integration with Page Context

### Year/Month Filter Integration
- Members list automatically reflects Year/Month selection
- Backend returns members data untuk periode yang dipilih
- Search dan pagination dilakukan pada data yang sudah di-filter server-side

### Navigation Integration
- "Lihat Laporan" button navigasi ke halaman individual report
- URL: `/admin/reports/{member.id}?year={year}`
- Uses Inertia `router.visit()`

## Performance Considerations

1. **useMemo Optimization**: 
   - filteredMembers: Hanya re-compute saat members atau searchMembers berubah
   - paginatedMembers: Hanya re-compute saat filteredMembers atau currentPage berubah

2. **Rendering**:
   - Hanya 10 items di-render per halaman (tidak semua members)
   - Search filtering dilakukan client-side (instant, tidak perlu request ke server)

3. **No Server Round-trips**:
   - Search dan pagination semuanya client-side
   - Tidak membuat request baru saat search atau page change
   - Year/Month filter tetap server-side (via router.get)

## Edge Cases Handled

1. **Empty search**: Menampilkan semua members
2. **No results**: Pesan "Anggota tidak ditemukan"
3. **No members**: Pesan "Belum ada anggota"
4. **Single page**: Pagination tidak ditampilkan (totalPages > 1 check)
5. **Current page exceeds total pages**: Tidak possible karena currentPage selalu valid

## Type Safety

```tsx
interface ReportIndexProps {
    generalStats: {
        total_members: number;
        active_members: number;
        total_payments: number;
        pending_payments: number;
        terbayar_payments: number;
        total_amount: number;
        terbayar_amount: number;
        average_amount: number;
        period: string;
    };
    members: Array<{
        id: number;
        full_name: string;
        email: string;
    }>;
    availableYears: number[];
    selectedYear: number;
    selectedMonth: number | null;
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Search } from 'lucide-react';
```

## Browser Support

✅ All modern browsers supporting:
- ES6+ (arrow functions, const/let, template literals)
- React 18+ hooks (useState, useMemo)
- CSS Grid/Flexbox

## Testing Considerations

**Unit Test scenarios**:
1. Search filter works correctly
2. Pagination calculates correct page count
3. Page navigation works (prev, next, page numbers)
4. Auto-reset on search
5. Empty states show correct messages
6. Results info displays correct range

**Integration Test scenarios**:
1. Year/Month filter interaction
2. Navigation to individual report
3. Performance with large member lists

## Future Enhancements

1. **Export to CSV**: Export filtered results to CSV
2. **Sort by column**: Sort by name, email, etc.
3. **Member details modal**: Quick view member info
4. **Bulk actions**: Select multiple members and perform actions
5. **Advanced filters**: Filter by join_date, status, etc.

## Related Files

- **Component**: `resources/js/pages/admin/reports/Index.tsx`
- **Controller**: `app/Http/Controllers/Admin/ReportController.php`
- **UI Components**: `resources/js/components/ui/` (Input, Pagination, Table)

---

**Implemented by**: GitHub Copilot  
**Completion Status**: ✅ Ready for production
