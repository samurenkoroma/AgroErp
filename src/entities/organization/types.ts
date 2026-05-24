export interface Organization {
    id: string;
    name: string;
    role: string;
}

export interface OrganizationInvite {
    id: string;
    email: string;
    role: string;
    status: 'pending' | 'accepted' | 'expired';
    invited_by: string;
    invited_at: string;
}
