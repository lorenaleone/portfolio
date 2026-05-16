import { createSubscription } from '@/lib/asaas';

export async function POST(request: Request) {
  try {
    const { email, name, billingType } = await request.json();

    if (!email || !name) {
      return Response.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await createSubscription({
      email,
      name,
      billingType: billingType === 'PIX' ? 'PIX' : 'CREDIT_CARD',
      value: 29.0,
    });

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({
      success: true,
      subscriptionId: result.id,
      invoiceUrl: result.invoiceUrl,
    });
  } catch (err) {
    console.error('Erro ao criar assinatura:', err);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
