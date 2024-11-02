async function testUpdateAccount() {
    try {
        const response = await fetch('http://localhost:3001/api/accounts/464687a0-4279-4367-ae56-8e4839bf040d', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Updated Account',
                type: 'Customer',
                billing_address: {
                    address1: '789 Update St',
                    city: 'Update City',
                    province: 'Update Province',
                    postal_code: '67890',
                    country: 'Canada'
                }
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testUpdateAccount();
