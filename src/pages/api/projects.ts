import { NextApiRequest, NextApiResponse } from 'next';

let projects: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const project = req.body;
    projects.unshift(project);
    return res.status(201).json({ success: true, project });
  }
  if (req.method === 'GET') {
    return res.status(200).json({ projects });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
