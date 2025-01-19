import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { CallStatusService } from '../services/callStatus.service';

export const getCallStatus = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const status = await CallStatusService.getStatus(callId);
    
    res.json({
      status: 'success',
      data: status
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get call status');
    res.status(500).json({
      status: 'error',
      message: 'Failed to get call status'
    });
  }
};

export const updateCallStatus = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;
    
    await CallStatusService.updateStatus(callId, status);
    
    res.json({
      status: 'success'
    });
  } catch (error) {
    logger.error({ error }, 'Failed to update call status');
    res.status(500).json({
      status: 'error',
      message: 'Failed to update call status'
    });
  }
}; 