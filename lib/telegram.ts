// Telegram notification service
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured - skipping notification')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })

    if (response.ok) {
      console.log('Telegram notification sent successfully')
      return true
    } else {
      console.error('Failed to send Telegram notification:', response.statusText)
      return false
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return false
  }
}

export function formatOrderNotification(order: any): string {
  const emoji = order.package_size === '1kg' ? '📦' : '📦📦'

  return `🥩 <b>Nová objednávka!</b>

👤 <b>${order.customer_name} ${order.customer_surname}</b>
${emoji} <b>${order.package_size} tlačenka</b>
💰 <b>${order.total_price} Kč</b>
🔢 Objednávka č. <b>${order.order_number}</b>
🔒 PIN: <code>${order.pin}</code>

🕐 ${new Date(order.created_at).toLocaleString('cs-CZ')}

<a href="https://tlacenka-cz.vercel.app/admin">📊 Zobrazit v adminu</a>`
}

export function formatCancellationNotification(order: any): string {
  const emoji = order.package_size === '1kg' ? '📦' : '📦📦'

  return `❌ <b>Objednávka stornována!</b>

👤 <b>${order.customer_name} ${order.customer_surname}</b>
${emoji} <b>${order.package_size} tlačenka</b>
💰 <b>${order.total_price} Kč</b>
🔢 Objednávka č. <b>${order.order_number}</b>
🔒 PIN: <code>${order.pin}</code>

⏰ Stornováno: ${new Date().toLocaleString('cs-CZ')}
📅 Původně vytvořeno: ${new Date(order.created_at).toLocaleString('cs-CZ')}

<a href="https://tlacenka-cz.vercel.app/admin">📊 Zobrazit v adminu</a>`
}