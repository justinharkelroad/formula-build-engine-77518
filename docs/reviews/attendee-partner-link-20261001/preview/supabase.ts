const attendee = {
  id: 'a2000000-0000-4000-8000-000000000001', name: 'Bri Nichols', email: 'bri@example.com',
  seatType: 'team', eventRole: 'team_member', registrationState: 'invited', claimState: 'unclaimed',
  accessState: 'pending', agencyId: 'a3000000-0000-4000-8000-000000000001', agencyName: 'Post Pros', agencyKind: 'standard',
  sourceType: 'manual', sourceId: 'preview', sourceOrdinal: 1, identityLinked: false,
  createdAt: '2026-09-02T12:00:00Z', updatedAt: '2026-09-02T12:00:00Z',
  partnerOrgId: null as string | null, partnerCompanyName: null as string | null,
  partnerConnectionState: 'not_assigned', partnerConnectionCode: null as string | null,
};
const companies = [{id:'post_pros',businessName:'Post Pros Marketing Solutions'}, {id:'hagerty',businessName:'Hagerty'}, {id:'performology',businessName:'Performology'}];
export const supabase = { functions: { async invoke(_name: string, options: {body: Record<string, unknown>}) {
  const body = options.body;
  if (body.action === 'upsert') {
    attendee.name = String(body.name); attendee.email = String(body.email); attendee.seatType = String(body.seatType);
    attendee.partnerOrgId = typeof body.partnerOrgId === 'string' ? body.partnerOrgId : null;
    attendee.partnerCompanyName = companies.find(company=>company.id===attendee.partnerOrgId)?.businessName ?? null;
    attendee.partnerConnectionState = attendee.partnerOrgId ? 'waiting_for_sign_in' : 'not_assigned';
    attendee.partnerConnectionCode = attendee.partnerOrgId ? 'waiting_for_account' : null;
    return { data: { identityLinked: false, partnerOrgId: attendee.partnerOrgId }, error: null };
  }
  return { data: { summary: { purchasedSeats: 0, assignedPurchaseSeats: 0, unassignedPurchaseSeats: 0, activeRoster: 1, linkedAccounts: 0, manualAttendees: 1 },
    attendees: [{...attendee}], purchases: [], agencies: [{id:attendee.agencyId,displayName:'Post Pros',kind:'standard',attendeeCount:5}], partnerCompanies: companies }, error: null };
} } };
