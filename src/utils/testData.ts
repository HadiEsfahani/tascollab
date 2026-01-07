export const createTestUser = () => {
  const testUser = {
    id: 'user_test_123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    walletBalance: 100,
    createdAt: new Date()
  };

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (!users.find((u: any) => u.email === testUser.email)) {
    users.push(testUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Test user created:', testUser);
  }
};

// Call this function to create a test user
createTestUser();