import DOMPurify from 'isomorphic-dompurify'

export interface OrderInput {
  customerName: string
  customerSurname: string
  packageSize: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export interface ValidationError {
  field: string
  message: string
}

// Sanitize text input to prevent XSS
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags and script content
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })

  // Additional cleanup - remove any remaining suspicious characters
  return sanitized
    .replace(/[<>'"]/g, '') // Remove potential HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 100) // Limit length
}

// Validate and sanitize order input
export function validateOrderInput(input: any): { isValid: boolean; errors: ValidationError[]; sanitizedData?: OrderInput } {
  const errors: ValidationError[] = []

  // Validate customerName
  if (!input.customerName || typeof input.customerName !== 'string') {
    errors.push({ field: 'customerName', message: 'Customer name is required' })
  } else if (input.customerName.trim().length < 1) {
    errors.push({ field: 'customerName', message: 'Customer name cannot be empty' })
  } else if (input.customerName.length > 50) {
    errors.push({ field: 'customerName', message: 'Customer name is too long' })
  }

  // Validate customerSurname
  if (!input.customerSurname || typeof input.customerSurname !== 'string') {
    errors.push({ field: 'customerSurname', message: 'Customer surname is required' })
  } else if (input.customerSurname.trim().length < 1) {
    errors.push({ field: 'customerSurname', message: 'Customer surname cannot be empty' })
  } else if (input.customerSurname.length > 50) {
    errors.push({ field: 'customerSurname', message: 'Customer surname is too long' })
  }

  // Validate packageSize
  if (!input.packageSize || !['1kg', '2kg'].includes(input.packageSize)) {
    errors.push({ field: 'packageSize', message: 'Invalid package size' })
  }

  // Validate quantity
  if (!input.quantity || typeof input.quantity !== 'number') {
    errors.push({ field: 'quantity', message: 'Quantity must be a number' })
  } else if (input.quantity < 1 || input.quantity > 20) {
    errors.push({ field: 'quantity', message: 'Quantity must be between 1 and 20' })
  } else if (!Number.isInteger(input.quantity)) {
    errors.push({ field: 'quantity', message: 'Quantity must be a whole number' })
  }

  // Validate unitPrice
  if (!input.unitPrice || typeof input.unitPrice !== 'number') {
    errors.push({ field: 'unitPrice', message: 'Unit price must be a number' })
  } else if (input.unitPrice < 0 || input.unitPrice > 1000) {
    errors.push({ field: 'unitPrice', message: 'Invalid unit price' })
  }

  // Validate totalPrice
  if (!input.totalPrice || typeof input.totalPrice !== 'number') {
    errors.push({ field: 'totalPrice', message: 'Total price must be a number' })
  } else if (input.totalPrice < 0 || input.totalPrice > 20000) {
    errors.push({ field: 'totalPrice', message: 'Invalid total price' })
  }

  // Validate notes (optional)
  if (input.notes && typeof input.notes !== 'string') {
    errors.push({ field: 'notes', message: 'Notes must be text' })
  } else if (input.notes && input.notes.length > 500) {
    errors.push({ field: 'notes', message: 'Notes are too long' })
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Sanitize all text inputs
  const sanitizedData: OrderInput = {
    customerName: sanitizeText(input.customerName),
    customerSurname: sanitizeText(input.customerSurname),
    packageSize: input.packageSize,
    quantity: parseInt(input.quantity.toString()),
    unitPrice: parseFloat(input.unitPrice.toString()),
    totalPrice: parseFloat(input.totalPrice.toString()),
    notes: input.notes ? sanitizeText(input.notes) : undefined
  }

  // Business logic validation
  const expectedPrice = sanitizedData.quantity * sanitizedData.unitPrice
  if (Math.abs(sanitizedData.totalPrice - expectedPrice) > 0.01) {
    errors.push({ field: 'totalPrice', message: 'Price calculation mismatch' })
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  }
}

// Validate auth input
export function validateAuthInput(input: any): { isValid: boolean; errors: ValidationError[]; sanitizedData?: { username: string; password: string } } {
  const errors: ValidationError[] = []

  if (!input.username || typeof input.username !== 'string') {
    errors.push({ field: 'username', message: 'Username is required' })
  } else if (input.username.length > 50) {
    errors.push({ field: 'username', message: 'Username is too long' })
  }

  if (!input.password || typeof input.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' })
  } else if (input.password.length > 100) {
    errors.push({ field: 'password', message: 'Password is too long' })
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: {
      username: sanitizeText(input.username),
      password: input.password // Don't sanitize password as it might contain special chars
    }
  }
}