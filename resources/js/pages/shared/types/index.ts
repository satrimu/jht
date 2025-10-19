export interface User {
    id: number;
    name: string;
    full_name: string;
    member_number: string;
    email: string;
}

export interface Payment {
    id: number;
    user_id: number;
    amount: string;
    payment_date: string;
    status: string;
    notes: string | null;
    image: string | null;
    image_url: string;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface ReportStats {
    total_users: number;
    total_payments: number;
    total_amount: string;
    pending_payments: number;
    terbayar_payments: number;
    monthly_breakdown: Array<{
        month: string;
        year: number;
        total_amount: string;
        payment_count: number;
        terbayar_count: number;
        pending_count: number;
    }>;
    status_distribution: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
}

export interface UserReport {
    user: User;
    total_payments: number;
    total_amount: string;
    terbayar_amount: string;
    pending_amount: string;
    monthly_data: Array<{
        month: string;
        year: number;
        amount: string;
        status: string;
        payment_date: string;
    }>;
    recent_payments: Array<{
        id: number;
        amount: string;
        payment_date: string;
        status: string;
        notes: string | null;
    }>;
}