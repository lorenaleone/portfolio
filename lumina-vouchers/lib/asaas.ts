// Asaas API Client

interface CreateSubscriptionParams {
  email: string;
  name: string;
  billingType: 'CREDIT_CARD' | 'PIX';
  value: number;
}

interface SubscriptionResponse {
  id: string;
  status: string;
  invoiceUrl?: string;
  checkoutUrl?: string;
  error?: string;
}

export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionResponse> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY não configurada');
  }

  const payload = {
    customer: await findOrCreateCustomer(params.email, params.name, apiKey),
    billingType: params.billingType,
    value: params.value,
    cycle: 'MONTHLY',
    description: 'Lumina Vouchers - Plano Pro',
  };

  try {
    const res = await fetch('https://api.asaas.com/v3/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        id: '',
        status: 'error',
        error: data.errors?.[0]?.detail || 'Erro ao criar assinatura',
      };
    }

    return {
      id: data.id,
      status: data.status,
      invoiceUrl: data.invoiceUrl,
    };
  } catch (err) {
    return {
      id: '',
      status: 'error',
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}

async function findOrCreateCustomer(
  email: string,
  name: string,
  apiKey: string
): Promise<string> {
  try {
    // Buscar cliente existente
    const searchRes = await fetch(
      `https://api.asaas.com/v3/customers?email=${encodeURIComponent(email)}`,
      {
        headers: { 'access_token': apiKey },
      }
    );

    const searchData = await searchRes.json();
    if (searchData.data?.length > 0) {
      return searchData.data[0].id;
    }

    // Criar novo cliente
    const createRes = await fetch('https://api.asaas.com/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
      },
      body: JSON.stringify({
        name,
        email,
        country: 'BR',
      }),
    });

    const createData = await createRes.json();
    return createData.id;
  } catch {
    throw new Error('Erro ao gerenciar cliente');
  }
}

export async function checkSubscriptionStatus(
  customerId: string
): Promise<{ active: boolean; subscriptionId?: string }> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return { active: false };

  try {
    const res = await fetch(
      `https://api.asaas.com/v3/subscriptions?customer=${customerId}&status=ACTIVE`,
      {
        headers: { 'access_token': apiKey },
      }
    );

    const data = await res.json();
    const hasActive = data.data?.length > 0;

    return {
      active: hasActive,
      subscriptionId: hasActive ? data.data[0].id : undefined,
    };
  } catch {
    return { active: false };
  }
}
