// Update Joined Guests Counters
export const updateJoinedGuestsCounts = async function (event_id, connection) {
    try {
        const countQuery = `
            SELECT COUNT(*) AS joined_count 
            FROM event_guests 
            WHERE event_id = ? AND status = 'joined'
        `;
        const [rows] = await connection.query(countQuery, [event_id]);
        const joinedCount = rows[0].joined_count;
        const updateEventQuery = `
            UPDATE events 
            SET current_guests_count = ? 
            WHERE event_id = ?
        `;
        await connection.query(updateEventQuery, [joinedCount, event_id]);
        return joinedCount;
    } catch (error) {
        throw error;
    }
}

// Update Invited Guests Counters
export const updateInvitedGuestsCounts = async function (event_id, connection) {
    try {
        const countQuery = `
            SELECT COUNT(*) AS invited_count 
            FROM event_guests 
            WHERE event_id = ? AND status = 'invited'
        `;
        const [rows] = await connection.query(countQuery, [event_id]);
        
        const invitedCount = rows[0].invited_count;
        console.log(`Invited guests count for event_id ${event_id}: ${invitedCount}`);

        const updateEventQuery = `
            UPDATE events 
            SET invited_guests_count = ? 
            WHERE event_id = ?
        `;
        await connection.query(updateEventQuery, [invitedCount, event_id]);

        return invitedCount;
    } catch (error) {
        console.error('Error updating joined guests count:', error);
        throw error;
    }
}

// Check if a event is joinable 
export const isEventJoinable = async function (event_id, event_guests_id = null, connection) {
    const checkEventQuery = `
        SELECT event_status, current_guests_count, max_guests_count, creator_uid 
        FROM events 
        WHERE event_id = ?  
    `;
    const [eventRows] = await connection.query(checkEventQuery, [event_id]);
    const eventStatus = eventRows[0].event_status; 
    const currentGuests = eventRows[0].current_guests_count;
    const maxGuests = eventRows[0].max_guests_count;
    const statuses = eventStatus.split(','); 

    if (eventRows.length === 0) {
        throw new Error('Event not found');
    }
    
    if(currentGuests === maxGuests){
        throw new Error('Cannot join this event');
    }

    if (statuses.includes('public') && statuses.includes('open')){
        return true; 
    } else {
            const checkInviteQuery = `
            SELECT invited_by_uid
            FROM event_guests 
            WHERE event_id = ? AND guest_uid = ?
        `
        const [inviteRows] = await connection.query(checkInviteQuery,[event_id,event_guests_id]); 
        const eventCreator = eventRows[0].creator_uid; 
        const inviter = inviteRows[0].invited_by_uid;

        if (statuses.includes('public') && statuses.includes('closed') && eventCreator === inviter){
            return true; 
        } 
        
        if (statuses.includes('private') && statuses.includes('closed') && eventCreator === inviter) {
            return true;
        } 

        if (statuses.includes('private') && statuses.includes('open')) {
            if (inviter != null) {              
                return true
            } else {
                throw new Error('Cannot join this event');
            }
        } else {
            throw new Error('Cannot join this event');
        } 
    } 
}
