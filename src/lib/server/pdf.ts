'use server'

import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

export async function generatePDFBuffer(element: React.ReactElement): Promise<Buffer> {
  return await renderToBuffer(element)
}
