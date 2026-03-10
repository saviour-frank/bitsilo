import { z } from 'zod';

export const depositSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => /^[0-9]*\.?[0-9]{0,8}$/.test(v), 'Invalid number format')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
});

export const withdrawSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => /^[0-9]*\.?[0-9]{0,6}$/.test(v), 'Invalid number format')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
});

export type DepositFormValues = z.infer<typeof depositSchema>;
export type WithdrawFormValues = z.infer<typeof withdrawSchema>;
