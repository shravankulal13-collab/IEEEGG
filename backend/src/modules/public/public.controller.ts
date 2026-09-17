import type { Request, Response } from 'express';
import { publicService } from './public.service.js';
import type { PublicReaction, PublicReportCategory } from './public.types.js';

const categories = new Set<PublicReportCategory>(['accident', 'fire', 'medical', 'other']);

export class PublicController {
  static async list(req: Request, res: Response) {
    const reports = await publicService.list(req.user?.id);
    res.json({ success: true, data: reports });
  }

  static async create(req: Request, res: Response) {
    const postType = String(req.body.postType || 'emergency');
    if (postType === 'health') {
      if (!req.file && !req.body.imageUrl) {
        res.status(400).json({ success: false, message: 'A health-post image is required.' });
        return;
      }
      const title = String(req.body.title || '').trim();
      const description = String(req.body.description || '').trim();
      if (!title || !description) {
        res.status(400).json({ success: false, message: 'Health post title and description are required.' });
        return;
      }
      const imageUrl = req.file ? await publicService.uploadImage(req.file) : String(req.body.imageUrl);
      const post = await publicService.createHealthPost({ authorId: req.user!.id, imageUrl, title: title.slice(0, 160), description: description.slice(0, 2000) });
      res.status(201).json({ success: true, data: post });
      return;
    }

    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const category = String(req.body.category || 'other') as PublicReportCategory;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !categories.has(category)) {
      res.status(400).json({ success: false, message: 'Valid location and category are required.' });
      return;
    }
    if (!req.file && !req.body.imageUrl) {
      res.status(400).json({ success: false, message: 'An incident image is required.' });
      return;
    }

    const imageUrl = req.file
      ? await publicService.uploadImage(req.file)
      : String(req.body.imageUrl);
    const report = await publicService.createReport({
      reporterId: req.user!.id,
      imageUrl,
      latitude,
      longitude,
      category,
      description: req.body.description ? String(req.body.description).slice(0, 1000) : undefined,
    });
    res.status(201).json({ success: true, data: report });
  }

  static async react(req: Request, res: Response) {
    const reaction = String(req.body.reaction) as PublicReaction;
    if (reaction !== 'confirm' && reaction !== 'dispute') {
      res.status(400).json({ success: false, message: 'Reaction must be confirm or dispute.' });
      return;
    }
    const report = await publicService.react(String(req.params.id), req.user!.id, reaction);
    res.json({ success: true, data: report });
  }

  static async likeHealthPost(req: Request, res: Response) {
    const post = await publicService.likeHealthPost(String(req.params.id), req.user!.id);
    res.json({ success: true, data: post });
  }
}
