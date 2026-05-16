'use client';

import { useCallback, useEffect, useState } from 'react';
import { AgencyConfig } from '@/lib/types';

interface SubscriptionStatus {
  isPaid: boolean;
  vouchersThisMonth: number;
  vouchersLimit: number;
  loading: boolean;
  error?: string;
}

const STORAGE_KEY = 'lumina_subscription';
const VOUCHER_HISTORY_KEY = 'lumina_voucher_history';
const FREE_LIMIT = 5;
const RESET_DAY = 1; // Dia do mês que reseta

export function useSubscription(config: AgencyConfig): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPaid: false,
    vouchersThisMonth: 0,
    vouchersLimit: FREE_LIMIT,
    loading: true,
  });

  useEffect(() => {
    const checkStatus = () => {
      if (typeof window === 'undefined') return;

      // Verificar se tem assinatura paga
      const paidInfo = localStorage.getItem(STORAGE_KEY);
      const isPaid = paidInfo
        ? new Date(JSON.parse(paidInfo).expiresAt) > new Date()
        : false;

      // Contar vouchers gerados este mês
      const history = JSON.parse(localStorage.getItem(VOUCHER_HISTORY_KEY) || '[]');
      const now = new Date();
      const thisMonthVouchers = history.filter((v: any) => {
        const vDate = new Date(v.generatedAt);
        return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
      }).length;

      // Verificar se precisa resetar contagem (dia 1 do mês)
      if (now.getDate() === RESET_DAY && paidInfo) {
        const lastReset = localStorage.getItem('lumina_last_reset');
        const lastResetDate = lastReset ? new Date(JSON.parse(lastReset)) : new Date(0);
        if (lastResetDate.getMonth() !== now.getMonth()) {
          // Reset da data
          localStorage.setItem('lumina_last_reset', JSON.stringify(now));
        }
      }

      setStatus({
        isPaid,
        vouchersThisMonth: thisMonthVouchers,
        vouchersLimit: isPaid ? Infinity : FREE_LIMIT,
        loading: false,
      });
    };

    checkStatus();
  }, [config]);

  const canCreateVoucher = useCallback((): boolean => {
    return status.isPaid || status.vouchersThisMonth < FREE_LIMIT;
  }, [status]);

  return {
    ...status,
    isPaid: status.isPaid || canCreateVoucher(),
  };
}

export function recordPayment(email: string, subscriptionId: string) {
  if (typeof window === 'undefined') return;

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      subscriptionId,
      email,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    })
  );
}

export function clearPaymentInfo() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
