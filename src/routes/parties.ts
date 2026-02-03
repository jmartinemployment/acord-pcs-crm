import { Router, Request, Response, NextFunction } from 'express';
import * as partyService from '../services/party.service';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  createPartySchema,
  updatePartySchema,
  partyQuerySchema,
  addressSchema,
  phoneSchema,
  emailSchema,
} from '../models/party.schema';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const router = Router();

// GET /api/parties
router.get(
  '/',
  validateQuery(partyQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await partyService.listParties(req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/parties/:id
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const party = await partyService.getPartyById(req.params.id as string);
      sendSuccess(res, party);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/parties
router.post(
  '/',
  validateBody(createPartySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const party = await partyService.createParty(req.body, req.user?.userId);
      sendCreated(res, party);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/parties/:id
router.patch(
  '/:id',
  validateBody(updatePartySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const party = await partyService.updateParty(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      sendSuccess(res, party);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/parties/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await partyService.deleteParty(req.params.id as string, req.user?.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/parties/:id/addresses
router.post(
  '/:id/addresses',
  validateBody(addressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await partyService.addAddress(req.params.id as string, req.body);
      sendCreated(res, address);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/parties/:id/phones
router.post(
  '/:id/phones',
  validateBody(phoneSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const phone = await partyService.addPhone(req.params.id as string, req.body);
      sendCreated(res, phone);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/parties/:id/emails
router.post(
  '/:id/emails',
  validateBody(emailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = await partyService.addEmail(req.params.id as string, req.body);
      sendCreated(res, email);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
