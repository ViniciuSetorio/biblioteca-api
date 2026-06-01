import notificacaoService from '../services/notificacao.service.js';
import logger from '../config/logger.js';
import { z } from 'zod';

const normalizeKeysToCamel = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = value;
  }
  return result;
};

// Schema de validação
const NotificacaoSchema = z.preprocess(
  (data) => normalizeKeysToCamel(data),
  z.object({
    tipo: z.enum(["emprestimo", "devolucao", "multa", "reserva"]),
    usuarioId: z.number().int().positive(),
    emprestimoId: z.number().int().positive().optional(),
    dados: z.record(z.any()).optional(),
    telefone: z.string().optional(),
  }),
);

const EmailSchema = z.preprocess(
  (data) => normalizeKeysToCamel(data),
  z.object({
    tipo: z.enum(["emprestimo", "devolucao", "multa", "reserva"]),
    usuarioId: z.number().int().positive(),
    emprestimoId: z.number().int().positive().optional(),
    dados: z.record(z.any()).optional(),
  }),
);

const SmsSchema = z.preprocess(
  (data) => normalizeKeysToCamel(data),
  z.object({
    tipo: z.enum(["emprestimo", "devolucao", "multa", "reserva"]),
    usuarioId: z.number().int().positive(),
    emprestimoId: z.number().int().positive().optional(),
    telefone: z.string().min(10, "Telefone é obrigatório para SMS"),
    dados: z.record(z.any()).optional(),
  }),
);

async function enviarNotificacao(req, res) {
  try {
    // Validar dados de entrada
    const dados = NotificacaoSchema.parse(req.body);
    
    logger.info('Requisição de notificação recebida', dados);
    
    // Processar notificação
    const resultado = await notificacaoService.processarNotificacao(dados);
    
    // Retornar resultado
    return res.status(202).json({
      message: 'Notificação processada',
      timestamp: new Date().toISOString(),
      ...resultado
    });
    
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: error.errors
      });
    }
    
    logger.error('Erro ao processar notificação', error);
    return res.status(500).json({
      error: 'Erro interno ao processar notificação'
    });
  }
}

async function enviarEmail(req, res) {
  try {
    const dados = EmailSchema.parse(req.body);

    logger.info('Requisição de notificação por email recebida', dados);

    const resultado = await notificacaoService.processarNotificacao({
      ...dados,
      canal: 'email',
    });

    return res.status(202).json({
      message: 'Notificação por email processada',
      timestamp: new Date().toISOString(),
      ...resultado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: error.errors
      });
    }

    logger.error('Erro ao processar notificação por email', error);
    return res.status(500).json({
      error: 'Erro interno ao processar notificação por email'
    });
  }
}

async function enviarSms(req, res) {
  try {
    const dados = SmsSchema.parse(req.body);

    logger.info('Requisição de notificação por SMS recebida', dados);

    const resultado = await notificacaoService.processarNotificacao({
      ...dados,
      canal: 'sms',
    });

    return res.status(202).json({
      message: 'Notificação por SMS processada',
      timestamp: new Date().toISOString(),
      ...resultado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: error.errors
      });
    }

    logger.error('Erro ao processar notificação por SMS', error);
    return res.status(500).json({
      error: 'Erro interno ao processar notificação por SMS'
    });
  }
}

async function statusFila(req, res) {
  try {
    const status = notificacaoService.getStatusFila();
    return res.json(status);
  } catch (error) {
    logger.error('Erro ao obter status da fila', error);
    return res.status(500).json({ error: 'Erro ao obter status da fila' });
  }
}

export default {
  enviarNotificacao,
  enviarEmail,
  enviarSms,
  statusFila,
};
