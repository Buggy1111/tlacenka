import { NextResponse } from 'next/server'

// Static product data for testing
const products = [
  {
    id: 1,
    name: 'Tlačenka 1kg',
    size: '1kg',
    price: 90,
    is_active: true
  },
  {
    id: 2,
    name: 'Tlačenka 2kg',
    size: '2kg',
    price: 175,
    is_active: true
  }
]

export async function GET() {
  try {
    console.log('GET /api/products called')
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}