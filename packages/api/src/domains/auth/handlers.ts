import { Request, Response } from 'express';

export async function getCurrentUser(req: Request, res: Response) {
  // TODO: Implement proper authentication
  // For now, return a mock user
  res.json({
    user_id: '1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user'
  });
}
